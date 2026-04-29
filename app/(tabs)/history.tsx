import BodyText from "@/components/atomic/Typography/BodyText";
import ScreenContainer from "@/components/atomic/Layout/ScreenContainer";
import ScrollScreen from "@/components/atomic/Layout/ScrollScreen";
import Title from "@/components/atomic/Typography/Title";
import HistoryChart, { HistoryDataPoint } from "@/components/composite/History/HistoryChart";
import IntervalSelector from "@/components/composite/History/IntervalSelector";
import LineChart, { TimeSeriesDataPoint } from "@/components/composite/History/LineChart";
import MetricCard from "@/components/composite/History/MetricCard";
import { AnalysisResult, getAnalysisHistory } from "@/utils/endpoints";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

type IntervalOption = "last_2_days" | "last_week" | "last_month" | "custom";

type ExtractedPoint = {
  id: string;
  createdAt: Date;
  dateLabel: string;
  cadence: number;
  strideLength: number;
  verticalOscillation: number;
  overstrideIndex: number;
  leanDegree: number;
  modulesCount: number;
};

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function safeRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function dateLabel(date: Date) {
  return date.toLocaleDateString("en-US", { day: "2-digit", month: "short" });
}

function trendFromLatestVsOthers(
  points: ExtractedPoint[],
  selector: (p: ExtractedPoint) => number,
  lowerIsBetter = false,
) {
  if (points.length < 2) return { trend: "neutral" as const, latest: null as number | null, baseline: null as number | null };
  const latest = selector(points[points.length - 1]);
  const others = points.slice(0, -1).map(selector);
  const baseline = others.reduce((sum, v) => sum + v, 0) / others.length;
  if (Math.abs(latest - baseline) < 1e-6) {
    return { trend: "neutral" as const, latest, baseline };
  }
  if (lowerIsBetter) {
    return { trend: latest < baseline ? ("down" as const) : ("up" as const), latest, baseline };
  }
  return { trend: latest > baseline ? ("up" as const) : ("down" as const), latest, baseline };
}

export default function HistoryScreen() {
  const [selectedInterval, setSelectedInterval] = useState<IntervalOption>("last_week");
  const [customStartDate, setCustomStartDate] = useState<Date | null>(null);
  const [customEndDate, setCustomEndDate] = useState<Date | null>(null);
  const [pickerMode, setPickerMode] = useState<"start" | "end" | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<AnalysisResult[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const payload = await getAnalysisHistory();
        setHistory(payload);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load history";
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredPoints = useMemo<ExtractedPoint[]>(() => {
    const now = new Date();
    let start: Date | null = null;
    let end: Date | null = null;

    if (selectedInterval === "last_2_days") {
      start = new Date(now);
      start.setDate(now.getDate() - 2);
      end = now;
    } else if (selectedInterval === "last_week") {
      start = new Date(now);
      start.setDate(now.getDate() - 7);
      end = now;
    } else if (selectedInterval === "last_month") {
      start = new Date(now);
      start.setMonth(now.getMonth() - 1);
      end = now;
    } else if (selectedInterval === "custom") {
      if (!customStartDate || !customEndDate) return [];
      start = customStartDate;
      end = new Date(customEndDate);
      end.setHours(23, 59, 59, 999);
    }

    return history
      .map((item, index) => {
        const createdAt = new Date(item.created_at ?? "");
        if (Number.isNaN(createdAt.getTime())) return null;

        const modules = safeRecord(item.modules);
        const pelvis = safeRecord(modules?.pelvis_analysis);
        const pelvisSummary = safeRecord(pelvis?.summary);
        const overstride2 = safeRecord(modules?.overstride_metric_2);
        const trunk = safeRecord(modules?.trunk_lean_analysis);

        const strideLeft = asNumber(pelvis?.mean_stride_L);
        const strideRight = asNumber(pelvis?.mean_stride_R);
        const strideLength =
          strideLeft !== null && strideRight !== null
            ? (strideLeft + strideRight) / 2
            : strideLeft ?? strideRight ?? 0;

        const voLeft = asNumber(pelvisSummary?.avg_excursion_L);
        const voRight = asNumber(pelvisSummary?.avg_excursion_R);
        const verticalOscillation =
          voLeft !== null && voRight !== null
            ? (voLeft + voRight) / 2
            : voLeft ?? voRight ?? asNumber(pelvisSummary?.avg_excursion_all) ?? 0;

        return {
          id: `${String(item.id ?? item.run_id ?? "analysis")}-${createdAt.getTime()}-${index}`,
          createdAt,
          dateLabel: dateLabel(createdAt),
          cadence: asNumber(pelvis?.cadence_steps_per_min) ?? 0,
          strideLength,
          verticalOscillation,
          overstrideIndex: asNumber(overstride2?.mean_overstride_index_deg) ?? 0,
          leanDegree: asNumber(trunk?.mean_global) ?? 0,
          modulesCount: modules ? Object.keys(modules).length : 0,
        };
      })
      .filter((item): item is ExtractedPoint => !!item)
      .filter((item) => {
        if (!start || !end) return true;
        return item.createdAt >= start && item.createdAt <= end;
      })
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }, [history, selectedInterval, customStartDate, customEndDate]);

  const formatPickerDate = (date: Date | null) =>
    date
      ? date.toLocaleDateString("en-CA", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })
      : "Select date";

  const onDatePicked = (event: DateTimePickerEvent, selected?: Date) => {
    setPickerMode(null);
    if (event.type !== "set" || !selected) return;
    if (pickerMode === "start") {
      setCustomStartDate(selected);
      if (customEndDate && selected > customEndDate) {
        setCustomEndDate(selected);
      }
      return;
    }
    if (pickerMode === "end") {
      setCustomEndDate(selected);
      if (customStartDate && selected < customStartDate) {
        setCustomStartDate(selected);
      }
    }
  };

  const timeSeriesData = useMemo<TimeSeriesDataPoint[]>(
    () =>
      filteredPoints.map((point) => ({
        date: point.dateLabel,
        cadence: point.cadence,
        strideLength: Number(point.strideLength.toFixed(2)),
        // Reuse chart component's expected keys
        groundContact: Number(point.overstrideIndex.toFixed(2)),
        verticalOscillation: Number(point.verticalOscillation.toFixed(2)),
      })),
    [filteredPoints],
  );

  const overstrideTrend = useMemo<HistoryDataPoint[]>(
    () =>
      filteredPoints.map((point) => ({
        id: point.id,
        label: point.dateLabel,
        value: Number(point.overstrideIndex.toFixed(2)),
      })),
    [filteredPoints],
  );

  const metrics = useMemo(() => {
    if (!filteredPoints.length) {
      return {
        cadence: { value: "--", trend: "neutral" as const },
        strideLength: { value: "--", trend: "neutral" as const },
        verticalOscillation: { value: "--", trend: "neutral" as const },
        overstride: { value: "--", trend: "neutral" as const },
        leanDegree: { value: "--", trend: "neutral" as const },
      };
    }

    const latest = filteredPoints[filteredPoints.length - 1];
    const cadenceTrend = trendFromLatestVsOthers(filteredPoints, (p) => p.cadence);
    const strideTrend = trendFromLatestVsOthers(filteredPoints, (p) => p.strideLength);
    const verticalTrend = trendFromLatestVsOthers(filteredPoints, (p) => p.verticalOscillation, true);
    const overstrideTrend = trendFromLatestVsOthers(filteredPoints, (p) => p.overstrideIndex, true);
    const leanTrend = trendFromLatestVsOthers(filteredPoints, (p) => p.leanDegree, true);

    return {
      cadence: {
        value: String(Math.round(latest.cadence)),
        trend: cadenceTrend.trend,
      },
      strideLength: {
        value: latest.strideLength.toFixed(2),
        trend: strideTrend.trend,
      },
      verticalOscillation: {
        value: latest.verticalOscillation.toFixed(2),
        trend: verticalTrend.trend,
      },
      overstride: {
        value: latest.overstrideIndex.toFixed(2),
        trend: overstrideTrend.trend,
      },
      leanDegree: {
        value: latest.leanDegree.toFixed(2),
        trend: leanTrend.trend,
      },
    };
  }, [filteredPoints]);

  return (
    <ScreenContainer>
      <ScrollScreen>
        <View style={styles.headerContainer}>
          <Title style={styles.headerTitle}>History</Title>
        </View>

        <View style={styles.selectorContainer}>
          <IntervalSelector
            selectedValue={selectedInterval}
            onSelect={(value) => setSelectedInterval(value as IntervalOption)}
            options={[
              { label: "Last 2 days", value: "last_2_days" },
              { label: "Last week", value: "last_week" },
              { label: "Last month", value: "last_month" },
              { label: "Specific date range", value: "custom" },
            ]}
          />
        </View>

        {selectedInterval === "custom" && (
          <View style={styles.customDateContainer}>
            <BodyText style={styles.customDateLabel}>Start date</BodyText>
            <Pressable style={styles.dateButton} onPress={() => setPickerMode("start")}>
              <BodyText style={styles.dateButtonText}>
                {formatPickerDate(customStartDate)}
              </BodyText>
            </Pressable>
            <BodyText style={styles.customDateLabel}>End date</BodyText>
            <Pressable style={styles.dateButton} onPress={() => setPickerMode("end")}>
              <BodyText style={styles.dateButtonText}>{formatPickerDate(customEndDate)}</BodyText>
            </Pressable>
            {pickerMode && (
              <DateTimePicker
                value={
                  pickerMode === "start"
                    ? customStartDate ?? new Date()
                    : customEndDate ?? customStartDate ?? new Date()
                }
                mode="date"
                display="default"
                onChange={onDatePicked}
                maximumDate={new Date()}
              />
            )}
          </View>
        )}

        {loading ? (
          <BodyText style={styles.feedbackText}>Loading history...</BodyText>
        ) : error ? (
          <BodyText style={styles.errorText}>{error}</BodyText>
        ) : (
          <View style={styles.metricsContainer}>
            <View style={styles.metricsRow}>
              <MetricCard label="Cadence" value={metrics.cadence.value} unit="steps/min" trend={metrics.cadence.trend} style={styles.metricCard} />
              <MetricCard label="Stride Length" value={metrics.strideLength.value} unit="m" trend={metrics.strideLength.trend} style={styles.metricCard} />
            </View>
            <View style={styles.metricsRow}>
              <MetricCard label="Vertical Oscillation" value={metrics.verticalOscillation.value} unit="cm" trend={metrics.verticalOscillation.trend} style={styles.metricCard} />
              <MetricCard label="Overstride Index" value={metrics.overstride.value} unit="deg" trend={metrics.overstride.trend} style={styles.metricCard} />
            </View>
            <View style={styles.metricsRow}>
              <MetricCard
                label="Lean Degree"
                value={metrics.leanDegree.value}
                unit="deg"
                trend={metrics.leanDegree.trend}
                style={styles.metricCard}
              />
              <View style={styles.metricCard} />
            </View>
          </View>
        )}

        {timeSeriesData.length > 0 && (
          <LineChart
            title="Cadence Progress"
            description="Progress chart from your history endpoint results."
            data={timeSeriesData}
            selectedMetric="cadence"
          />
        )}

        {timeSeriesData.length > 0 && (
          <LineChart
            title="Stride Length Progress"
            description="Stride-length trend over selected interval."
            data={timeSeriesData}
            selectedMetric="strideLength"
          />
        )}

        {overstrideTrend.length > 0 && (
          <HistoryChart
            title="Overstride Index Trend"
            description="Lower values generally indicate reduced overstriding."
            data={overstrideTrend}
            unit="deg"
          />
        )}

        {filteredPoints.length > 0 && (
          <View style={styles.listContainer}>
            <Title style={styles.listTitle}>Filtered History List</Title>
            {filteredPoints.map((item) => (
              <View key={item.id} style={styles.listItem}>
                <BodyText style={styles.listItemDate}>
                  {item.createdAt.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </BodyText>
                <BodyText style={styles.listItemDetails}>
                  cadence {Math.round(item.cadence)} | stride {item.strideLength.toFixed(2)}m |
                  overstride {item.overstrideIndex.toFixed(2)} deg | modules {item.modulesCount}
                </BodyText>
              </View>
            ))}
          </View>
        )}

        {selectedInterval === "custom" &&
          !!customStartDate &&
          !!customEndDate &&
          filteredPoints.length === 0 &&
          !loading &&
          !error && (
            <View style={styles.emptyState}>
              <BodyText style={styles.feedbackText}>
                No history found in this specific date range.
              </BodyText>
            </View>
          )}

        {!loading && !error && filteredPoints.length === 0 && selectedInterval !== "custom" && (
          <View style={styles.emptyState}>
            <BodyText style={styles.feedbackText}>
              No history data found for this interval.
            </BodyText>
          </View>
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
  customDateContainer: {
    marginTop: 8,
    marginBottom: 4,
    gap: 6,
  },
  customDateLabel: {
    color: "#475569",
    fontSize: 13,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  dateButtonText: {
    color: "#0F172A",
    fontSize: 15,
  },
  metricsContainer: {
    marginTop: 20,
    gap: 16,
  },
  metricsRow: {
    flexDirection: "row",
    gap: 16,
  },
  metricCard: {
    flex: 1,
  },
  emptyState: {
    marginTop: 60,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 240,
    paddingHorizontal: 20,
  },
  feedbackText: {
    marginTop: 12,
    color: "#64748B",
  },
  errorText: {
    marginTop: 12,
    color: "#DC2626",
  },
  listContainer: {
    marginTop: 16,
    marginBottom: 20,
    gap: 10,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
  },
  listItem: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    padding: 12,
    gap: 4,
  },
  listItemDate: {
    fontSize: 13,
    color: "#334155",
    fontWeight: "600",
  },
  listItemDetails: {
    fontSize: 13,
    color: "#64748B",
  },
});
