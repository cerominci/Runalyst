import ScreenContainer from "@/components/atomic/Layout/ScreenContainer";
import ScrollScreen from "@/components/atomic/Layout/ScrollScreen";
import LineChart, { TimeSeriesDataPoint } from "@/components/composite/History/LineChart";
import MetricCard from "@/components/composite/History/MetricCard";
import { AnalysisEntry, getAnalysisHistory } from "@/utils/devAuth";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

// ─── Types ───────────────────────────────────────────────────────────────────

type MetricKey = "cadence" | "strideLength" | "groundContact" | "speed";

const METRIC_CONFIG: Record<
  MetricKey,
  { label: string; unit: string; color: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  speed:         { label: "Speed",          unit: "m/s",      color: "#6366F1", icon: "speedometer"       },
  cadence:       { label: "Cadence",        unit: "spm",      color: "#3B82F6", icon: "walk"              },
  strideLength:  { label: "Stride",         unit: "m",        color: "#10B981", icon: "resize"            },
  groundContact: { label: "Ground Contact", unit: "ms",       color: "#F59E0B", icon: "footsteps"         },
};

const INTERVALS = [
  { label: "4 Runs",   value: "4 videos"  },
  { label: "2 Days",   value: "2 days"    },
  { label: "10 Days",  value: "10 days"   },
  { label: "1 Month",  value: "1 month"   },
];

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toChartPoint(entry: AnalysisEntry): TimeSeriesDataPoint {
  const d = new Date(entry.created_at);
  return {
    date:          `${d.getDate()} ${MONTHS[d.getMonth()]}`,
    cadence:       entry.avg_cadence,
    strideLength:  entry.avg_stride_length,
    groundContact: entry.avg_gct,
    speed:         entry.avg_speed,
  };
}

function filterByInterval(analyses: AnalysisEntry[], interval: string): AnalysisEntry[] {
  if (interval.includes("4 videos")) return analyses.slice(-4);
  const days = interval.includes("2 days") ? 2 : interval.includes("10 days") ? 10 : 30;
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return analyses.filter((a) => new Date(a.created_at).getTime() >= cutoff);
}

function getTrend(entries: AnalysisEntry[], key: keyof AnalysisEntry): "up" | "down" | "neutral" {
  if (entries.length < 2) return "neutral";
  const first = entries[0][key] as number;
  const last  = entries[entries.length - 1][key] as number;
  return last > first ? "up" : last < first ? "down" : "neutral";
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function HistoryScreen() {
  const [analyses, setAnalyses]   = useState<AnalysisEntry[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [interval, setInterval]   = useState("4 videos");
  const [metric, setMetric]       = useState<MetricKey>("speed");

  useEffect(() => {
    getAnalysisHistory()
      .then((data) => setAnalyses(data.analyses))
      .catch((e)   => setError(e.message ?? "Failed to load history"))
      .finally(()  => setLoading(false));
  }, []);

  const filtered  = useMemo(() => filterByInterval(analyses, interval), [analyses, interval]);
  const chartData = useMemo(() => filtered.map(toChartPoint), [filtered]);
  const latest    = filtered[filtered.length - 1];

  return (
    <ScreenContainer>
      <ScrollScreen>

        {/* ── Header ── */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Performance</Text>
          <Text style={styles.headerSub}>Track your running progress</Text>
        </View>

        {/* ── Hero card ── */}
        <View style={styles.heroCard}>
          <View style={styles.heroLeft}>
            <Text style={styles.heroNumber}>{analyses.length}</Text>
            <Text style={styles.heroLabel}>Runs Recorded</Text>
          </View>
          <View style={styles.heroDivider} />
          <View style={styles.heroRight}>
            <Ionicons name="calendar-outline" size={16} color="#94A3B8" style={{ marginBottom: 4 }} />
            <Text style={styles.heroLabel}>Last Run</Text>
            <Text style={styles.heroDate}>
              {analyses.length > 0 ? formatDate(analyses[analyses.length - 1].created_at) : "—"}
            </Text>
          </View>
        </View>

        {/* ── Interval tabs ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsScroll}
          contentContainerStyle={styles.tabsContent}
        >
          {INTERVALS.map((item) => (
            <Pressable
              key={item.value}
              style={[styles.tab, interval === item.value && styles.tabActive]}
              onPress={() => setInterval(item.value)}
            >
              <Text style={[styles.tabLabel, interval === item.value && styles.tabLabelActive]}>
                {item.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* ── Loading / Error / Empty ── */}
        {loading && (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#6366F1" />
          </View>
        )}

        {!loading && error && (
          <View style={styles.centered}>
            <Ionicons name="cloud-offline-outline" size={40} color="#CBD5E1" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {!loading && !error && filtered.length === 0 && (
          <View style={styles.centered}>
            <Ionicons name="analytics-outline" size={48} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No runs yet</Text>
            <Text style={styles.emptyText}>Upload a video to start tracking your form.</Text>
          </View>
        )}

        {/* ── Content ── */}
        {!loading && !error && filtered.length > 0 && (
          <>
            {/* Metric cards 2×2 */}
            <View style={styles.grid}>
              {(Object.keys(METRIC_CONFIG) as MetricKey[]).map((key) => {
                const cfg = METRIC_CONFIG[key];
                const fieldMap: Record<MetricKey, keyof AnalysisEntry> = {
                  speed:         "avg_speed",
                  cadence:       "avg_cadence",
                  strideLength:  "avg_stride_length",
                  groundContact: "avg_gct",
                };
                const field = fieldMap[key];
                const raw   = latest ? (latest[field] as number) : null;
                const value = raw === null ? "--"
                  : key === "cadence" || key === "groundContact"
                  ? String(Math.round(raw))
                  : raw.toFixed(2);
                const trend = getTrend(filtered, field);
                const trendText = trend === "up" ? "Improved"
                  : trend === "down" ? "Declined" : undefined;

                return (
                  <MetricCard
                    key={key}
                    label={cfg.label}
                    value={value}
                    unit={cfg.unit}
                    trend={trend}
                    trendText={trendText}
                    accentColor={cfg.color}
                    style={styles.card}
                  />
                );
              })}
            </View>

            {/* Metric switcher */}
            <View style={styles.segmentWrapper}>
              <View style={styles.segment}>
                {(Object.keys(METRIC_CONFIG) as MetricKey[]).map((key) => (
                  <Pressable
                    key={key}
                    style={[
                      styles.segmentItem,
                      metric === key && { backgroundColor: METRIC_CONFIG[key].color },
                    ]}
                    onPress={() => setMetric(key)}
                  >
                    <Ionicons
                      name={METRIC_CONFIG[key].icon}
                      size={14}
                      color={metric === key ? "#fff" : "#64748B"}
                      style={{ marginRight: 5 }}
                    />
                    <Text style={[styles.segmentLabel, metric === key && styles.segmentLabelActive]}>
                      {METRIC_CONFIG[key].label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Chart */}
            <LineChart
              title={`${METRIC_CONFIG[metric].label} Over Time`}
              description={`${METRIC_CONFIG[metric].unit} · ${filtered.length} run${filtered.length !== 1 ? "s" : ""}`}
              data={chartData}
              selectedMetric={metric}
            />
          </>
        )}

        <View style={{ height: 32 }} />
      </ScrollScreen>
    </ScreenContainer>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  header: {
    paddingTop: 12,
    paddingBottom: 4,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 14,
    color: "#94A3B8",
    marginTop: 2,
    fontWeight: "400",
  },

  // Hero
  heroCard: {
    flexDirection: "row",
    backgroundColor: "#1E293B",
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 24,
    marginBottom: 20,
    alignItems: "center",
  },
  heroLeft: {
    flex: 1,
    alignItems: "center",
  },
  heroRight: {
    flex: 1,
    alignItems: "center",
  },
  heroDivider: {
    width: 1,
    height: 48,
    backgroundColor: "#334155",
    marginHorizontal: 8,
  },
  heroNumber: {
    fontSize: 36,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -1,
  },
  heroLabel: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 2,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  heroDate: {
    fontSize: 13,
    color: "#E2E8F0",
    fontWeight: "600",
    marginTop: 4,
  },

  // Interval tabs
  tabsScroll: {
    marginBottom: 20,
  },
  tabsContent: {
    gap: 8,
    paddingRight: 4,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  tabActive: {
    backgroundColor: "#0F172A",
    borderColor: "#0F172A",
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
  },
  tabLabelActive: {
    color: "#FFFFFF",
  },

  // States
  centered: {
    marginTop: 60,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    minHeight: 160,
  },
  errorText: {
    color: "#EF4444",
    textAlign: "center",
    fontSize: 14,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#475569",
  },
  emptyText: {
    fontSize: 14,
    color: "#94A3B8",
    textAlign: "center",
    paddingHorizontal: 32,
    lineHeight: 20,
  },

  // Metric grid
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  card: {
    flexBasis: "47%",
    flexGrow: 1,
  },

  // Segmented control
  segmentWrapper: {
    marginBottom: 8,
  },
  segment: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    borderRadius: 14,
    padding: 4,
    gap: 2,
  },
  segmentItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 10,
  },
  segmentLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748B",
  },
  segmentLabelActive: {
    color: "#FFFFFF",
  },
});
