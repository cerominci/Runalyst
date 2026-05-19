import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { RecommendationIssue } from "@/utils/endpoints";

const SEVERITY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  high:     { bg: "#FEF2F2", text: "#DC2626", border: "#FECACA" },
  moderate: { bg: "#FFFBEB", text: "#D97706", border: "#FDE68A" },
  mild:     { bg: "#F0FDF4", text: "#16A34A", border: "#BBF7D0" },
};

interface Props {
  issue: RecommendationIssue;
}

export default function RecommendationCard({ issue }: Props) {
  const [expanded, setExpanded] = useState(false);
  const colors = SEVERITY_COLORS[issue.severity] ?? SEVERITY_COLORS.moderate;

  return (
    <View style={[styles.card, { borderColor: colors.border }]}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setExpanded((v) => !v)}
        activeOpacity={0.8}
      >
        <View style={styles.headerLeft}>
          <View style={[styles.severityBadge, { backgroundColor: colors.bg }]}>
            <Text style={[styles.severityText, { color: colors.text }]}>
              {issue.severity.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.issueName}>{issue.name}</Text>
        </View>
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={18}
          color="#94A3B8"
        />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.body}>
          <Text style={styles.impact}>{issue.impact}</Text>

          {issue.exercises.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="barbell-outline" size={14} color="#6347C7" />
                <Text style={styles.sectionTitle}>Exercises</Text>
              </View>
              {issue.exercises.map((ex, i) => (
                <View key={i} style={styles.item}>
                  <View style={styles.itemRow}>
                    <Text style={styles.itemName}>{ex.name}</Text>
                    <View style={styles.repsBadge}>
                      <Text style={styles.repsText}>{ex.duration_or_reps}</Text>
                    </View>
                  </View>
                  <Text style={styles.itemSub}>{ex.rationale}</Text>
                </View>
              ))}
            </View>
          )}

          {issue.drills.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="walk-outline" size={14} color="#6347C7" />
                <Text style={styles.sectionTitle}>Drills</Text>
              </View>
              {issue.drills.map((dr, i) => (
                <View key={i} style={styles.item}>
                  <View style={styles.itemRow}>
                    <Text style={styles.itemName}>{dr.name}</Text>
                    <View style={styles.repsBadge}>
                      <Text style={styles.repsText}>{dr.duration}</Text>
                    </View>
                  </View>
                  <Text style={styles.itemSub}>Cue: {dr.cue}</Text>
                </View>
              ))}
            </View>
          )}

          {issue.technique_cues.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="bulb-outline" size={14} color="#6347C7" />
                <Text style={styles.sectionTitle}>Technique Cues</Text>
              </View>
              {issue.technique_cues.map((cue, i) => (
                <View key={i} style={styles.cueRow}>
                  <View style={styles.cueDot} />
                  <Text style={styles.cueText}>{cue}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  severityText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  issueName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    flex: 1,
  },
  body: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    gap: 12,
  },
  impact: {
    fontSize: 13,
    color: "#475569",
    lineHeight: 19,
    marginTop: 12,
  },
  section: {
    gap: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6347C7",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  item: {
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    padding: 10,
    gap: 4,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
    flex: 1,
  },
  repsBadge: {
    backgroundColor: "#EDE9FB",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  repsText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#4929B3",
  },
  itemSub: {
    fontSize: 12,
    color: "#64748B",
    lineHeight: 17,
  },
  cueRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    paddingVertical: 2,
  },
  cueDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#6347C7",
    marginTop: 5,
  },
  cueText: {
    fontSize: 13,
    color: "#334155",
    lineHeight: 19,
    flex: 1,
  },
});
