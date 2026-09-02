import VideoListGrid from "@/components/composite/Analysis/VideoListGrid";
import { Ionicons } from "@expo/vector-icons";
import {
  AnalysisResult,
  getAllRuns,
  getAnalysisHistory,
  getCurrentUser,
  getRunThumbnailUrl,
} from "@/utils/endpoints";
import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import { useIsFocused } from "@react-navigation/native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AnalysisHistoryScreen() {
  const router = useRouter();
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isFocused = useIsFocused();
  const hasFetchedRef = useRef(false);

  const pickScore = (value: unknown): number | undefined => {
    if (!value || typeof value !== "object") return undefined;
    const obj = value as Record<string, unknown>;
    const candidates = [obj.score, obj.overall_score, obj.total_score, obj.performance_score];
    for (const candidate of candidates) {
      if (typeof candidate === "number") return candidate;
      if (
        typeof candidate === "string" &&
        candidate.trim() &&
        !Number.isNaN(Number(candidate))
      ) {
        return Number(candidate);
      }
    }
    return undefined;
  };

  const withTimeout = async <T,>(
    promise: Promise<T>,
    timeoutMs: number,
    fallbackMessage: string,
  ): Promise<T> => {
    let timeoutHandle: ReturnType<typeof setTimeout> | null = null;
    try {
      return await Promise.race([
        promise,
        new Promise<T>((_, reject) => {
          timeoutHandle = setTimeout(() => reject(new Error(fallbackMessage)), timeoutMs);
        }),
      ]);
    } finally {
      if (timeoutHandle) clearTimeout(timeoutHandle);
    }
  };

  const fetchRuns = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [runsResult, historyResult, currentUserResult] = await Promise.allSettled([
        withTimeout(getAllRuns(), 12000, "Runs request timed out"),
        withTimeout(getAnalysisHistory(), 10000, "History request timed out"),
        withTimeout(getCurrentUser(), 10000, "User request timed out"),
      ]);

      if (runsResult.status === "rejected") {
        throw runsResult.reason instanceof Error
          ? runsResult.reason
          : new Error("Failed to load runs");
      }

      const runs = runsResult.value;
      const history =
        historyResult.status === "fulfilled" ? historyResult.value : ([] as AnalysisResult[]);
      const currentUser =
        currentUserResult.status === "fulfilled" ? currentUserResult.value : null;

      const historyByRunId = new Map<number, AnalysisResult>();
      history.forEach((item) => {
        if (typeof item.run_id === "number") historyByRunId.set(item.run_id, item);
      });

      const ownRuns = currentUser
        ? runs.filter((run) => run.user_id === currentUser.id)
        : runs;

      // Sort newest first
      const sortedRuns = [...ownRuns].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );

      const thumbnailUrls = await Promise.all(
        sortedRuns.map((run) => getRunThumbnailUrl(run.id)),
      );

      const transformedVideos = sortedRuns.map((run, i) => ({
        id: run.id.toString(),
        title: run.title ?? null,
        thumbnailUri: thumbnailUrls[i] ?? undefined,
        date: new Date(run.created_at).toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        score:
          pickScore(run.analysis_results) ?? pickScore(historyByRunId.get(run.id)),
      }));

      setVideos(transformedVideos);
    } catch (err: any) {
      setError(err.message || "Failed to load runs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isFocused && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchRuns();
    }
  }, [isFocused, fetchRuns]);

  const handleVideoSelect = (id: string) => {
    router.push(`/run/${id}` as Href);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Runs</Text>
          {!loading && videos.length > 0 && (
            <Text style={styles.headerSub}>{videos.length} analyses</Text>
          )}
        </View>
        <View style={styles.backBtn} />
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#6347C7" />
          <Text style={styles.loadingText}>Loading your runs…</Text>
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={40} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => {
              hasFetchedRef.current = false;
              fetchRuns();
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : videos.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="walk-outline" size={48} color="#D1C9F0" />
          <Text style={styles.emptyTitle}>No runs yet</Text>
          <Text style={styles.emptyText}>
            Record your first clip to see your analyses here.
          </Text>
          <TouchableOpacity
            style={styles.analyzeBtn}
            onPress={() => router.push("/analysis")}
            activeOpacity={0.85}
          >
            <Text style={styles.analyzeBtnText}>Analyze my run</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <VideoListGrid videos={videos} onSelect={handleVideoSelect} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F5F3FF" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    marginBottom: 4,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: { flex: 1, alignItems: "center" },
  headerTitle: { fontSize: 17, fontWeight: "800", color: "#0F172A" },
  headerSub: { fontSize: 12, color: "#64748B", marginTop: 2 },

  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 10,
  },
  loadingText: { color: "#64748B", fontSize: 14, marginTop: 8 },
  errorText: { color: "#EF4444", fontSize: 14, textAlign: "center" },
  retryBtn: {
    marginTop: 8,
    backgroundColor: "#6347C7",
    borderRadius: 999,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  retryText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  emptyTitle: { fontSize: 18, fontWeight: "800", color: "#0F172A", marginTop: 4 },
  emptyText: { fontSize: 14, color: "#64748B", textAlign: "center", lineHeight: 21 },
  analyzeBtn: {
    marginTop: 12,
    backgroundColor: "#6347C7",
    borderRadius: 999,
    paddingHorizontal: 28,
    paddingVertical: 12,
  },
  analyzeBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
