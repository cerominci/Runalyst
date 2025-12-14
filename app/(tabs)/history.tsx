import Row from "@/components/atomic/Layout/Row";
import ScreenContainer from "@/components/atomic/Layout/ScreenContainer";
import ScrollScreen from "@/components/atomic/Layout/ScrollScreen";
import Title from "@/components/atomic/Typography/Title";
import BodyPartSelector from "@/components/composite/History/BodyPartSelector";
import HistoryChart, { HistoryDataPoint } from "@/components/composite/History/HistoryChart";
import IntervalSelector from "@/components/composite/History/IntervalSelector";
import LineChart, { TimeSeriesDataPoint } from "@/components/composite/History/LineChart";
import MetricCard from "@/components/composite/History/MetricCard";
import React, { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";

// TODO: Replace mock data with actual database fetch
// Example: const fetchHistoryData = async (interval: string, bodyPart: string | null) => { ... }

// Helper function to generate dates based on interval
const generateDates = (interval: string): string[] => {
  const today = new Date();
  const dates: string[] = [];
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  let daysCount = 7;
  if (interval.includes("2 days")) daysCount = 2;
  else if (interval.includes("10 days")) daysCount = 10;
  else if (interval.includes("month")) daysCount = 30;
  else if (interval.includes("videos")) daysCount = 4;

  for (let i = daysCount - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const day = date.getDate();
    const month = monthNames[date.getMonth()];
    dates.push(`${day} ${month}`);
  }

  return dates;
};

// Mock data generator - will be replaced with database queries
const generateMockData = (
  interval: string,
  bodyPart: string | null
): {
  chartData: HistoryDataPoint[];
  timeSeriesData: TimeSeriesDataPoint[];
  metrics: {
    cadence: { value: string; trend: "up" | "down" | "neutral" };
    strideLength: { value: string; trend: "up" | "down" | "neutral" };
    groundContact: { value: string; trend: "up" | "down" | "neutral" };
    verticalOscillation: { value: string; trend: "up" | "down" | "neutral" };
  };
} => {
  // Generate different data based on interval and body part
  const intervalMultiplier = interval.includes("2 days") ? 1 : interval.includes("10 days") ? 5 : 2;
  const bodyPartModifier = bodyPart === "Knees" ? 0.9 : bodyPart === "Hips" ? 1.1 : 1.0;

  const dates = generateDates(interval);
  const daysCount = dates.length;

  // Generate time series data with all metrics
  const timeSeriesData: TimeSeriesDataPoint[] = dates.map((date, index) => {
    // Create variation in values over time
    const variation = 1 + (Math.sin(index * 0.5) * 0.15); // Sine wave for natural variation
    const trend = 1 + (index / daysCount) * 0.1; // Slight upward trend

    return {
      date,
      cadence: Math.round(165 * variation * trend * bodyPartModifier),
      strideLength: Number((1.15 * variation * trend * bodyPartModifier).toFixed(2)),
      groundContact: Math.round(225 * (1 / variation) * (1 / trend) * bodyPartModifier),
      verticalOscillation: Number((8.2 * variation * (1 / trend) * bodyPartModifier).toFixed(1)),
    };
  });

  // Generate bar chart data (aggregated score)
  const baseValues = [85, 92, 78, 95, 88, 90, 87];
  const chartData: HistoryDataPoint[] = baseValues.slice(0, daysCount).map((val, index) => ({
    label: interval.includes("videos")
      ? `Run #${index + 1}`
      : dates[index] || `Day ${index + 1}`,
    value: Math.round(val * intervalMultiplier * bodyPartModifier),
  }));

  // Calculate average metrics for metric cards
  const avgCadence = Math.round(
    timeSeriesData.reduce((sum, d) => sum + d.cadence, 0) / timeSeriesData.length
  );
  const avgStride = Number(
    (timeSeriesData.reduce((sum, d) => sum + d.strideLength, 0) / timeSeriesData.length).toFixed(2)
  );
  const avgGroundContact = Math.round(
    timeSeriesData.reduce((sum, d) => sum + d.groundContact, 0) / timeSeriesData.length
  );
  const avgVerticalOsc = Number(
    (timeSeriesData.reduce((sum, d) => sum + d.verticalOscillation, 0) / timeSeriesData.length).toFixed(1)
  );

  // Determine trends based on first vs last value
  const first = timeSeriesData[0];
  const last = timeSeriesData[timeSeriesData.length - 1];

  return {
    chartData,
    timeSeriesData,
    metrics: {
      cadence: {
        value: avgCadence.toString(),
        trend: last.cadence > first.cadence ? "up" : last.cadence < first.cadence ? "down" : "neutral",
      },
      strideLength: {
        value: avgStride.toString(),
        trend: last.strideLength > first.strideLength ? "up" : "neutral",
      },
      groundContact: {
        value: avgGroundContact.toString(),
        trend: last.groundContact < first.groundContact ? "down" : "neutral",
      },
      verticalOscillation: {
        value: avgVerticalOsc.toString(),
        trend: last.verticalOscillation < first.verticalOscillation ? "down" : "neutral",
      },
    },
  };
};

export default function HistoryScreen() {
  const [selectedInterval, setSelectedInterval] = useState<string | null>(null);
  const [selectedBodyPart, setSelectedBodyPart] = useState<string | null>(null);

  // TODO: Replace with actual database query
  // const { data, loading, error } = useQuery(GET_HISTORY_DATA, {
  //   variables: { interval: selectedInterval, bodyPart: selectedBodyPart }
  // });

  // Generate mock data based on selections
  const { chartData, timeSeriesData, metrics } = useMemo(() => {
    if (!selectedInterval) {
      return {
        chartData: [],
        timeSeriesData: [],
        metrics: {
          cadence: { value: "--", trend: "neutral" as const },
          strideLength: { value: "--", trend: "neutral" as const },
          groundContact: { value: "--", trend: "neutral" as const },
          verticalOscillation: { value: "--", trend: "neutral" as const },
        },
      };
    }
    return generateMockData(selectedInterval, selectedBodyPart);
  }, [selectedInterval, selectedBodyPart]);

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

        {/* Body Part Selector */}
        {selectedInterval && (
          <BodyPartSelector
            selectedPart={selectedBodyPart}
            onSelect={setSelectedBodyPart}
          />
        )}

        {/* Metrics Cards */}
        {selectedInterval && (
          <View style={styles.metricsContainer}>
            <Row style={styles.metricsRow}>
              <MetricCard
                label="Cadence"
                value={metrics.cadence.value}
                unit="steps/min"
                trend={metrics.cadence.trend}
                trendText={
                  metrics.cadence.trend === "up"
                    ? "Better than last run"
                    : metrics.cadence.trend === "down"
                    ? "Lower than last run"
                    : undefined
                }
                style={styles.metricCard}
              />
              <MetricCard
                label="Stride Length"
                value={metrics.strideLength.value}
                unit="m"
                trend={metrics.strideLength.trend}
                trendText={
                  metrics.strideLength.trend === "up"
                    ? "Improved"
                    : undefined
                }
                style={styles.metricCard}
              />
            </Row>

            <Row style={styles.metricsRow}>
              <MetricCard
                label="Ground Contact"
                value={metrics.groundContact.value}
                unit="ms"
                trend={metrics.groundContact.trend}
                trendText={
                  metrics.groundContact.trend === "down"
                    ? "Improved"
                    : undefined
                }
                style={styles.metricCard}
              />
              <MetricCard
                label="Vertical Oscillation"
                value={metrics.verticalOscillation.value}
                unit="cm"
                trend={metrics.verticalOscillation.trend}
                trendText={
                  metrics.verticalOscillation.trend === "down"
                    ? "Improved"
                    : undefined
                }
                style={styles.metricCard}
              />
            </Row>
          </View>
        )}

        {/* Line Chart - All Metrics Over Time */}
        {selectedInterval && timeSeriesData.length > 0 && (
          <LineChart
            title="Metrics Over Time"
            description={`Track all your performance metrics across ${selectedInterval.toLowerCase()}.`}
            data={timeSeriesData}
          />
        )}

        {/* History Chart - Aggregated Score */}
        {selectedInterval && (
          <HistoryChart
            title="Performance Score"
            description={`Overall performance score for ${selectedBodyPart || "all body parts"} over ${selectedInterval.toLowerCase()}.`}
            data={chartData}
            unit="score"
          />
        )}

        {/* Empty State */}
        {!selectedInterval && (
          <View style={styles.emptyState}>
            {/* Empty state can be enhanced with an icon or illustration */}
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
  emptyState: {
    marginTop: 60,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 240,
    paddingHorizontal: 20,
  },
});
