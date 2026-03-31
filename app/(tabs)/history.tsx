import Row from "@/components/atomic/Layout/Row";
import ScreenContainer from "@/components/atomic/Layout/ScreenContainer";
import ScrollScreen from "@/components/atomic/Layout/ScrollScreen";
import Title from "@/components/atomic/Typography/Title";
import BodyText from "@/components/atomic/Typography/BodyText";
import LineChart, { TimeSeriesDataPoint } from "@/components/composite/History/LineChart";
import MetricCard from "@/components/composite/History/MetricCard";
import IntervalSelector from "@/components/composite/History/IntervalSelector";
import { AnalysisEntry, getAnalysisHistory } from "@/utils/devAuth";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

type MetricKey = "cadence" | "strideLength" | "groundContact" | "speed";

const METRIC_CONFIG: Record<MetricKey, { label: string; unit: string }> = {
  cadence:       { label: "Cadence",        unit: "steps/min" },
  strideLength:  { label: "Stride Length",  unit: "m"         },
  groundContact: { label: "Ground Contact", unit: "ms"        },
  speed:         { label: "Speed",          unit: "m/s"       },
};

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function toChartPoint(entry: AnalysisEntry): TimeSeriesDataPoint {
  const d = new Date(entry.created_at);
  return {
    date: `${d.getDate()} ${MONTHS[d.getMonth()]}`,
    cadence:       entry.avg_cadence,
    strideLength:  entry.avg_stride_length,
    groundContact: entry.avg_gct,
    speed:         entry.avg_speed,
  };
}

function filterByInterval(analyses: AnalysisEntry[], interval: string | null): AnalysisEntry[] {
  if (!interval) return analyses;
  if (interval.includes("4 videos")) return analyses.slice(-4);
  const days = interval.includes("2 days") ? 2 : interval.includes("10 days") ? 10 : 30;
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return analyses.filter((a) => new Date(a.created_at).getTime() >= cutoff);
}

function computeTrend(entries: AnalysisEntry[], key: keyof AnalysisEntry): "up" | "down" | "neutral" {
  if (entries.length < 2) return "neutral";
  const first = entries[0][key] as number;
  const last  = entries[entries.length - 1][key] as number;
  if (last > first) return "up";
  if (last < first) return "down";
  return "neutral";
}

export default function HistoryScreen() {
  const [analyses, setAnalyses]             = useState<AnalysisEntry[]>([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState<string | null>(null);
  const [selectedInterval, setSelectedInterval] = useState<string | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>("speed");

  useEffect(() => {
    getAnalysisHistory()
      .then((data) => setAnalyses(data.analyses))
      .catch((e) => setError(e.message ?? "Failed to load history"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () => filterByInterval(analyses, selectedInterval),
    [analyses, selectedInterval]
  );

  const chartData: TimeSeriesDataPoint[] = useMemo(
    () => filtered.map(toChartPoint),
    [filtered]
  );

  const latest = filtered[filtered.length - 1];

  return (
    <ScreenContainer>
      <ScrollScreen>
        <View style={styles.headerContainer}>
          <Title style={styles.headerTitle}>History</Title>
        </View>

        {/* Interval Selector */}
        <View style={styles.selectorContainer}>
          <IntervalSelector
            selectedValue={selectedInterval}
            onSelect={setSelectedInterval}
          />
        </View>

        {/* Loading / Error */}
        {loading && (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#3B82F6" />
          </View>
        )}

        {!loading && error && (
          <View style={styles.centered}>
            <BodyText style={styles.errorText}>{error}</BodyText>
          </View>
        )}

        {/* Empty state */}
        {!loading && !error && filtered.length === 0 && (
          <View style={styles.centered}>
            <BodyText style={styles.emptyText}>
              No runs found for this period. Upload a video to get started.
            </BodyText>
          </View>
        )}

        {/* Content */}
        {!loading && !error && filtered.length > 0 && (
          <>
            {/* Metric Cards */}
            <View style={styles.metricsContainer}>
              <Row style={styles.metricsRow}>
                <MetricCard
                  label="Cadence"
                  value={latest ? String(Math.round(latest.avg_cadence)) : "--"}
                  unit="steps/min"
                  trend={computeTrend(filtered, "avg_cadence")}
                  trendText={
                    computeTrend(filtered, "avg_cadence") === "up" ? "Improved" :
                    computeTrend(filtered, "avg_cadence") === "down" ? "Declined" : undefined
                  }
                  style={styles.metricCard}
                />
                <MetricCard
                  label="Stride Length"
                  value={latest ? latest.avg_stride_length.toFixed(2) : "--"}
                  unit="m"
                  trend={computeTrend(filtered, "avg_stride_length")}
                  trendText={
                    computeTrend(filtered, "avg_stride_length") === "up" ? "Improved" :
                    computeTrend(filtered, "avg_stride_length") === "down" ? "Declined" : undefined
                  }
                  style={styles.metricCard}
                />
              </Row>
              <Row style={styles.metricsRow}>
                <MetricCard
                  label="Ground Contact"
                  value={latest ? String(Math.round(latest.avg_gct)) : "--"}
                  unit="ms"
                  trend={computeTrend(filtered, "avg_gct")}
                  trendText={
                    computeTrend(filtered, "avg_gct") === "down" ? "Improved" :
                    computeTrend(filtered, "avg_gct") === "up" ? "Declined" : undefined
                  }
                  style={styles.metricCard}
                />
                <MetricCard
                  label="Speed"
                  value={latest ? latest.avg_speed.toFixed(2) : "--"}
                  unit="m/s"
                  trend={computeTrend(filtered, "avg_speed")}
                  trendText={
                    computeTrend(filtered, "avg_speed") === "up" ? "Improved" :
                    computeTrend(filtered, "avg_speed") === "down" ? "Declined" : undefined
                  }
                  style={styles.metricCard}
                />
              </Row>
            </View>

            {/* Metric Switcher */}
            <View style={styles.switcherContainer}>
              <Row style={styles.switcherRow}>
                {(Object.keys(METRIC_CONFIG) as MetricKey[]).map((key) => (
                  <Pressable
                    key={key}
                    style={[
                      styles.switcherChip,
                      selectedMetric === key && styles.switcherChipActive,
                    ]}
                    onPress={() => setSelectedMetric(key)}
                  >
                    <Text
                      style={[
                        styles.switcherLabel,
                        selectedMetric === key && styles.switcherLabelActive,
                      ]}
                    >
                      {METRIC_CONFIG[key].label}
                    </Text>
                  </Pressable>
                ))}
              </Row>
            </View>

            {/* Line Chart */}
            <LineChart
              title={`${METRIC_CONFIG[selectedMetric].label} Over Time`}
              description={`${METRIC_CONFIG[selectedMetric].label} (${METRIC_CONFIG[selectedMetric].unit}) across your recorded runs.`}
              data={chartData}
              selectedMetric={selectedMetric}
            />
          </>
        )}
      </ScrollScreen>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingTop: 8,
    paddingBottom: 12,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0F172A",
  },
  selectorContainer: {
    marginTop: 12,
    marginBottom: 8,
  },
  centered: {
    marginTop: 60,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 120,
  },
  errorText: {
    color: "#DC2626",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  emptyText: {
    color: "#9CA3AF",
    textAlign: "center",
    paddingHorizontal: 32,
    lineHeight: 22,
  },
  metricsContainer: {
    marginTop: 20,
    gap: 16,
  },
  metricsRow: {
    gap: 16,
  },
  metricCard: {
    flex: 1,
  },
  switcherContainer: {
    marginTop: 24,
    marginBottom: 4,
  },
  switcherRow: {
    gap: 8,
    flexWrap: "wrap",
  },
  switcherChip: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  switcherChipActive: {
    backgroundColor: "#3B82F6",
    borderColor: "#3B82F6",
  },
  switcherLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#64748B",
  },
  switcherLabelActive: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
