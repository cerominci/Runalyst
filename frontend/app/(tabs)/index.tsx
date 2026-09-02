import AppTopBar from "@/components/composite/Layout/AppTopBar";
import { getAllRuns, getCurrentUser, Run } from "@/utils/endpoints";
import { LinearGradient } from "expo-linear-gradient";
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

export default function HomeScreen() {
  const router = useRouter();
  const isFocused = useIsFocused();
  const isFirstLoadRef = useRef(true);
  const [userName, setUserName] = useState<string | null>(null);
  const [lastRun, setLastRun] = useState<Run | null>(null);
  const [weekCount, setWeekCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (isFirstLoadRef.current) setLoading(true);
    try {
      const [user, runs] = await Promise.all([getCurrentUser(), getAllRuns()]);
      const email = user?.email ?? "";
      setUserName(email.split("@")[0] ?? "Runner");
      const now = Date.now();
      const weekMs = 7 * 24 * 60 * 60 * 1000;
      const thisWeek = runs.filter((r) => now - new Date(r.created_at).getTime() < weekMs);
      setWeekCount(thisWeek.length);
      const sorted = [...runs].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
      setLastRun(sorted[0] ?? null);
    } catch {
      // non-critical — show empty state
    } finally {
      setLoading(false);
      isFirstLoadRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (isFocused) fetchData();
  }, [isFocused, fetchData]);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <AppTopBar
          title={`Hi, ${userName ?? "Runner"}`}
          sub={new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        />

        {/* Hero card */}
        <LinearGradient
          colors={["#6347C7", "#4929B3"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroGlow} />
          <Text style={styles.heroTag}>NEW ANALYSIS</Text>
          <Text style={styles.heroTitle}>
            Record a 15s clip.{" "}
            <Text style={styles.heroOrange}>Get instant form feedback.</Text>
          </Text>
          <TouchableOpacity
            style={styles.heroBtn}
            onPress={() => router.push("/analysis")}
            activeOpacity={0.85}
          >
            <Text style={styles.heroBtnText}>⚡  Analyze my run</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Last run */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Last run</Text>
          <TouchableOpacity onPress={() => router.push("/analysis-history")}>
            <Text style={styles.seeAll}>See all ›</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.card}>
            <ActivityIndicator color="#6347C7" />
          </View>
        ) : lastRun ? (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/run/${lastRun.id}`)}
            activeOpacity={0.82}
          >
            <View style={styles.runRow}>
              <View style={styles.runIndex}>
                <Text style={styles.runIndexText}>#{lastRun.id}</Text>
              </View>
              <View style={styles.runMeta}>
                <Text style={styles.runTitle}>{lastRun.title ?? `Run #${lastRun.id}`}</Text>
                <Text style={styles.runDate}>{formatDate(lastRun.created_at)}</Text>
              </View>
              <View style={styles.chevWrap}>
                <Text style={styles.chev}>›</Text>
              </View>
            </View>
          </TouchableOpacity>
        ) : (
          <View style={styles.card}>
            <Text style={styles.emptyText}>No runs yet — record your first clip!</Text>
          </View>
        )}

        {/* This week */}
        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>This week</Text>
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { flex: 1 }]}>
            <View style={styles.statDot} />
            <Text style={styles.statLabel}>RUNS</Text>
            <Text style={styles.statValue}>{weekCount}</Text>
            <Text style={styles.statTrend}>this week</Text>
          </View>
          <View style={[styles.statCard, { flex: 1, marginLeft: 12 }]}>
            <View style={[styles.statDot, { backgroundColor: "#FF8A4C" }]} />
            <Text style={styles.statLabel}>ANALYSES</Text>
            <Text style={styles.statValue}>{weekCount}</Text>
            <Text style={styles.statTrend}>completed</Text>
          </View>
        </View>

        {/* Guide entry card */}
        <TouchableOpacity
          style={styles.guideCard}
          onPress={() => router.push("/tips")}
          activeOpacity={0.82}
        >
          <View style={styles.guideIcon}>
            <Text style={styles.guideIconText}>📖</Text>
          </View>
          <View style={styles.guideText}>
            <Text style={styles.guideTitle}>Runalyst guide</Text>
            <Text style={styles.guideSub}>How to record a clip & read your metrics</Text>
          </View>
          <Text style={[styles.chev, { color: "#6347C7" }]}>›</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F5F3FF" },
  scroll: { paddingHorizontal: 16, paddingBottom: 32 },

  heroCard: {
    borderRadius: 24,
    padding: 22,
    marginBottom: 20,
    overflow: "hidden",
    position: "relative",
  },
  heroGlow: {
    position: "absolute",
    right: -40,
    top: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "#FF8A4C",
    opacity: 0.35,
  },
  heroTag: { fontSize: 11, fontWeight: "700", color: "rgba(255,255,255,0.75)", letterSpacing: 1, marginBottom: 8 },
  heroTitle: { color: "#fff", fontWeight: "800", fontSize: 22, lineHeight: 30, maxWidth: 220, marginBottom: 18 },
  heroOrange: { color: "#FF8A4C" },
  heroBtn: { alignSelf: "flex-start", backgroundColor: "#fff", paddingVertical: 10, paddingHorizontal: 18, borderRadius: 999 },
  heroBtnText: { color: "#4929B3", fontWeight: "700", fontSize: 14 },

  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10, marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: "#0F172A", letterSpacing: -0.3 },
  seeAll: { color: "#6347C7", fontSize: 14, fontWeight: "600" },

  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#6347C7",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    marginBottom: 4,
  },
  runRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  runIndex: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: "#EDE9FB",
    alignItems: "center",
    justifyContent: "center",
  },
  runIndexText: { fontWeight: "800", fontSize: 18, color: "#4929B3" },
  runMeta: { flex: 1 },
  runTitle: { fontWeight: "700", color: "#0F172A", fontSize: 15 },
  runDate: { color: "#64748B", fontSize: 13, marginTop: 2 },
  chevWrap: { padding: 4 },
  chev: { fontSize: 22, color: "#94A3B8", fontWeight: "300" },
  emptyText: { color: "#64748B", fontSize: 14, textAlign: "center", paddingVertical: 8 },

  statsRow: { flexDirection: "row", marginTop: 10, marginBottom: 16 },
  statCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#6347C7",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  statDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#22C55E", marginBottom: 6 },
  statLabel: { fontSize: 11, fontWeight: "700", color: "#64748B", letterSpacing: 0.5 },
  statValue: { fontWeight: "800", fontSize: 30, color: "#0F172A", marginTop: 4 },
  statTrend: { fontSize: 12, color: "#22C55E", fontWeight: "600", marginTop: 2 },

  guideCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: "#EDE9FB",
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginTop: 4,
  },
  guideIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#EDE9FB",
    alignItems: "center",
    justifyContent: "center",
  },
  guideIconText: { fontSize: 20 },
  guideText: { flex: 1 },
  guideTitle: { fontWeight: "700", color: "#0F172A", fontSize: 15 },
  guideSub: { color: "#64748B", fontSize: 13, marginTop: 2 },
});
