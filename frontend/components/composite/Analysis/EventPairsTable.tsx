import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export type EventPair = [number, number];

interface EventPairsTableProps {
  title: string;
  rows: EventPair[];
  initialVisible?: number;
}

const EventPairsTable: React.FC<EventPairsTableProps> = ({
  title,
  rows,
  initialVisible = 6,
}) => {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const visibleRows = useMemo(
    () => (expanded ? rows : rows.slice(0, initialVisible)),
    [expanded, initialVisible, rows],
  );
  const canExpand = rows.length > initialVisible;

  if (!rows.length) return null;

  return (
    <View style={styles.container}>
      <Pressable style={styles.topBar} onPress={() => setOpen((prev) => !prev)}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.toggleIcon}>{open ? "▾" : "▸"}</Text>
      </Pressable>
      {!open ? null : (
        <>
          <View style={styles.headerRow}>
            <Text style={[styles.headerText, styles.frameColumn]}>Frame</Text>
            <Text style={[styles.headerText, styles.degreeColumn]}>Degree</Text>
          </View>
          {visibleRows.map(([frame, degree], index) => (
            <View key={`${title}-${frame}-${index}`} style={styles.row}>
              <Text style={[styles.cellText, styles.frameColumn]}>{frame}</Text>
              <Text style={[styles.cellText, styles.degreeColumn]}>
                {Number(degree).toFixed(2)}
              </Text>
            </View>
          ))}
          {canExpand && (
            <Pressable onPress={() => setExpanded((prev) => !prev)}>
              <Text style={styles.expandText}>
                {expanded ? "Show less" : `Show more (${rows.length - initialVisible} more)`}
              </Text>
            </Pressable>
          )}
        </>
      )}
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
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  toggleIcon: {
    color: "#64748B",
    fontSize: 13,
    fontWeight: "700",
  },
  headerRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    paddingBottom: 6,
    marginBottom: 6,
  },
  row: {
    flexDirection: "row",
    paddingVertical: 4,
  },
  frameColumn: {
    flex: 1,
  },
  degreeColumn: {
    flex: 1,
    textAlign: "right",
  },
  headerText: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
  },
  cellText: {
    fontSize: 13,
    color: "#0F172A",
  },
  expandText: {
    marginTop: 6,
    color: "#2563EB",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "right",
  },
});

export default EventPairsTable;
