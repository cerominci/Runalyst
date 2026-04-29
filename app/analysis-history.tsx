import Column from "@/components/atomic/Layout/Column";
import ScreenContainer from "@/components/atomic/Layout/ScreenContainer";
import Subtitle from "@/components/atomic/Typography/Subtitle";
import VideoListGrid from "@/components/composite/Analysis/VideoListGrid";
import AppTopBar from "@/components/composite/Layout/AppTopBar";
import {
  AnalysisResult,
  getAllRuns,
  getAnalysisHistory,
  getCurrentUser,
} from "@/utils/endpoints";
import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import { useIsFocused } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

export default function AnalysisHistoryScreen() {
  const router = useRouter();
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isFocused = useIsFocused();

  const pickScore = (value: unknown): number | undefined => {
    if (!value || typeof value !== "object") return undefined;
    const obj = value as Record<string, unknown>;
    const candidates = [
      obj.score,
      obj.overall_score,
      obj.total_score,
      obj.performance_score,
    ];
    for (const candidate of candidates) {
      if (typeof candidate === "number") return candidate;
      if (typeof candidate === "string" && candidate.trim() && !Number.isNaN(Number(candidate))) {
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
          timeoutHandle = setTimeout(() => {
            reject(new Error(fallbackMessage));
          }, timeoutMs);
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
        if (typeof item.run_id === "number") {
          historyByRunId.set(item.run_id, item);
        }
      });
      const ownRuns = currentUser ? runs.filter((run) => run.user_id === currentUser.id) : runs;

      const transformedVideos = ownRuns.map((run) => ({
        id: run.id.toString(),
        thumbnailUri:
          "https://via.placeholder.com/150x100/cccccc/000000?text=No+Thumbnail",
        date: new Date(run.created_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
        score:
          pickScore(run.analysis_results) ??
          pickScore(historyByRunId.get(run.id)),
      }));

      setVideos(transformedVideos);
    } catch (err: any) {
      console.error("Error fetching runs:", err);
      setError(err.message || "Failed to load videos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isFocused) {
      fetchRuns();
    }
  }, [isFocused, fetchRuns]);

  const handleVideoSelect = (id: string) => {
    router.push(`/run/${id}` as Href);
  };

  return (
    <ScreenContainer>
      <Column style={styles.content}>
        <AppTopBar />
        <View style={styles.headerSection}>
          <Subtitle style={styles.title}>Your Videos</Subtitle>
          <Subtitle style={styles.subtitle}>
            View your uploaded videos and analysis history.
          </Subtitle>
        </View>
        <View style={styles.videosSection}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Subtitle style={styles.loadingText}>
                Loading your videos...
              </Subtitle>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Subtitle style={styles.errorText}>{error}</Subtitle>
            </View>
          ) : videos.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Subtitle style={styles.emptyText}>
                No videos uploaded yet.
              </Subtitle>
            </View>
          ) : (
            <VideoListGrid videos={videos} onSelect={handleVideoSelect} />
          )}
        </View>
      </Column>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingBottom: 24,
  },
  headerSection: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#64748B",
    lineHeight: 24,
  },
  videosSection: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#64748B",
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 16,
    textAlign: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    color: "#64748B",
    fontSize: 16,
  },
});
