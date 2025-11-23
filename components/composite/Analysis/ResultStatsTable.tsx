// components/composite/Analysis/ResultStatsTable.tsx
import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import BodyText from "../../atomic/Typography/BodyText";
import Subtitle from "../../atomic/Typography/Subtitle";

export interface StatRow {
  label: string;   // "Cadence"
  value: string;   // "172"
  unit?: string;   // "steps/min"
}

interface ResultStatsTableProps {
  title?: string;
  rows: StatRow[];
  style?: ViewStyle;
}

const ResultStatsTable: React.FC<ResultStatsTableProps> = ({
  title = "Key metrics",
  rows,
  style,
}) => {
  if (!rows || rows.length === 0) return null;

  return (
    <View style={[styles.card, style]}>
      <Subtitle>{title}</Subtitle>

      <View style={styles.table}>
        {rows.map((row) => (
          <View key={row.label} style={styles.row}>
            <BodyText style={styles.label}>{row.label}</BodyText>
            <View style={styles.valueWrapper}>
              <Text style={styles.value}>{row.value}</Text>
              {row.unit && <Text style={styles.unit}>{row.unit}</Text>}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    boxShadow: "0px 3px 8px 0px rgba(0, 0, 0, 0.04)",
    elevation: 1,
    marginBottom: 16,
  },
  table: {
    marginTop: 10,
    gap: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  label: {
    color: "#6B7280",
  },
  valueWrapper: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  value: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  unit: {
    marginLeft: 4,
    fontSize: 12,
    color: "#6B7280",
  },
});

export default ResultStatsTable;
