import React from "react";
import { StyleSheet, Text, View } from "react-native";

export type KeyValueItem = {
  keyLabel: string;
  value: string;
};

interface KeyValueGridProps {
  items: KeyValueItem[];
  columns?: number;
}

const KeyValueGrid: React.FC<KeyValueGridProps> = ({ items, columns = 2 }) => {
  if (!items.length) return null;

  return (
    <View style={styles.container}>
      {items.map((item, index) => (
        <View
          key={`${item.keyLabel}-${index}`}
          style={[styles.cell, { width: `${100 / columns}%` }]}
        >
          <Text style={styles.label}>{item.keyLabel}</Text>
          <Text style={styles.value}>{item.value}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -4,
  },
  cell: {
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
  label: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 2,
  },
  value: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
  },
});

export default KeyValueGrid;
