import React from "react";
import { StyleSheet, Text, View } from "react-native";

export type ContactTrendPoint = {
  label: string;
  value: number;
};

interface ContactTrendMiniChartProps {
  title: string;
  data: ContactTrendPoint[];
  unit?: string;
}

const ContactTrendMiniChart: React.FC<ContactTrendMiniChartProps> = ({
  title,
  data,
  unit = "",
}) => {
  if (!data.length) return null;

  const max = Math.max(...data.map((point) => point.value), 1);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.chartRow}>
        {data.map((point) => (
          <View key={point.label} style={styles.item}>
            <View style={[styles.bar, { height: Math.max((point.value / max) * 96, 2) }]} />
            <Text numberOfLines={1} style={styles.label}>
              {point.label}
            </Text>
            <Text style={styles.value}>
              {point.value.toFixed(2)}
              {unit}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    padding: 10,
  },
  title: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 10,
  },
  chartRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    minHeight: 130,
  },
  item: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 3,
  },
  bar: {
    width: 8,
    borderRadius: 99,
    backgroundColor: "#3B82F6",
  },
  label: {
    marginTop: 6,
    color: "#64748B",
    fontSize: 10,
  },
  value: {
    marginTop: 2,
    color: "#0F172A",
    fontSize: 10,
    fontWeight: "600",
  },
});

export default ContactTrendMiniChart;
