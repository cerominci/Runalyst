// components/composite/Upload/AnalysisSummaryCard.tsx
import React from "react";
import { StyleSheet, View } from "react-native";
import BodyText from "../../atomic/Typography/BodyText";
import Subtitle from "../../atomic/Typography/Subtitle";

interface MetricItem {
  label: string;
  value: string;
}

interface AnalysisSummaryCardProps {
  title?: string;
  summaryText?: string;
  metrics?: MetricItem[];
}

const AnalysisSummaryCard: React.FC<AnalysisSummaryCardProps> = ({
  title = "Analysis summary",
  summaryText = "Your overall running form looks solid. Here are some key metrics from this session.",
  metrics = [],
}) => {
  return (
    <View style={styles.card}>
      <Subtitle>{title}</Subtitle>
      <BodyText style={styles.summary}>{summaryText}</BodyText>

      {metrics.length > 0 && (
        <View style={styles.metricsContainer}>
          {metrics.map((m) => (
            <View key={m.label} style={styles.metricRow}>
              <BodyText style={styles.metricLabel}>{m.label}</BodyText>
              <BodyText style={styles.metricValue}>{m.value}</BodyText>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    gap: 10,
  },
  summary: {
    marginTop: 4,
    color: "#475569",
  },
  metricsContainer: {
    marginTop: 10,
    gap: 6,
  },
  metricRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metricLabel: {
    color: "#6B7280",
  },
  metricValue: {
    fontWeight: "600",
    color: "#111827",
  },
});

export default AnalysisSummaryCard;
