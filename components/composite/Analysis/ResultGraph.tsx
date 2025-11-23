// components/composite/Analysis/ResultGraph.tsx
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import BodyText from "../../atomic/Typography/BodyText";
import Subtitle from "../../atomic/Typography/Subtitle";

export interface ResultDataPoint {
  label: string;  // "Stride 1"
  value: number;  // 165
}

interface ResultGraphProps {
  title?: string;
  description?: string;
  data: ResultDataPoint[];
  unit?: string;
}

const ResultGraph: React.FC<ResultGraphProps> = ({
  title = "Graph",
  description,
  data,
  unit,
}) => {
  if (!data || data.length === 0) {
    return (
      <View style={styles.card}>
        <Subtitle>{title}</Subtitle>
        {description && (
          <BodyText style={styles.description}>{description}</BodyText>
        )}
        <BodyText style={styles.empty}>No graph data available.</BodyText>
      </View>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value)) || 1;

  return (
    <View style={styles.card}>
      <Subtitle>{title}</Subtitle>
      {description && (
        <BodyText style={styles.description}>{description}</BodyText>
      )}

      <View style={styles.chartArea}>
        {data.map((point) => {
          const barHeight = (point.value / maxValue) * 110;
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
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 14,
    boxShadow: "0px 3px 8px 0px rgba(0, 0, 0, 0.04)",
    elevation: 1,
    marginBottom: 16,
  },
  description: {
    marginTop: 4,
    color: "#64748B",
  },
  empty: {
    marginTop: 10,
    color: "#9CA3AF",
  },
  chartArea: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginTop: 14,
    minHeight: 130,
  },
  barItem: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 4,
  },
  bar: {
    width: 10,
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

export default ResultGraph;
