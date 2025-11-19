// components/composite/History/HistoryChart.tsx
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import BodyText from "../../atomic/Typography/BodyText";
import Subtitle from "../../atomic/Typography/Subtitle";

export interface HistoryDataPoint {
  label: string; // örn: "Mon", "Run #3"
  value: number; // numeric metric
}

interface HistoryChartProps {
  title?: string;
  description?: string;
  data: HistoryDataPoint[];
  unit?: string; // örn: "steps/min", "score"
}

const HistoryChart: React.FC<HistoryChartProps> = ({
  title = "History",
  description = "Recent values over your selected time interval.",
  data,
  unit,
}) => {
  if (!data || data.length === 0) {
    return (
      <View style={styles.card}>
        <Subtitle>{title}</Subtitle>
        <BodyText style={styles.description}>{description}</BodyText>
        <BodyText style={styles.empty}>No data available for this filter.</BodyText>
      </View>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value)) || 1;

  return (
    <View style={styles.card}>
      <Subtitle>{title}</Subtitle>
      <BodyText style={styles.description}>{description}</BodyText>

      <View style={styles.chartArea}>
        {data.map((point) => {
          const barHeight = (point.value / maxValue) * 120; // max 120 px
          return (
            <View key={point.label} style={styles.barItem}>
              <View style={[styles.bar, { height: barHeight }]} />
              <Text style={styles.barLabel} numberOfLines={1}>
                {point.label}
              </Text>
              <Text style={styles.barValue}>
                {point.value}
                {unit ? ` ${unit}` : ""}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    marginTop: 12,
  },
  description: {
    marginTop: 4,
    color: "#64748B",
  },
  empty: {
    marginTop: 12,
    color: "#9CA3AF",
  },
  chartArea: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginTop: 16,
    minHeight: 140,
  },
  barItem: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 4,
  },
  bar: {
    width: 14,
    borderRadius: 999,
    backgroundColor: "#3B82F6",
  },
  barLabel: {
    marginTop: 6,
    fontSize: 10,
    color: "#6B7280",
  },
  barValue: {
    marginTop: 2,
    fontSize: 11,
    color: "#111827",
    fontWeight: "500",
  },
});

export default HistoryChart;
