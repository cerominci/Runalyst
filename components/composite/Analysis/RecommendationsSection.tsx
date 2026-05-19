import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import type { Recommendations } from "@/utils/endpoints";
import { getRecommendations } from "@/utils/endpoints";
import RecommendationCard from "./RecommendationCard";

interface Props {
  runId: number;
}

export default function RecommendationsSection({ runId }: Props) {
  const [data, setData] = useState<Recommendations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getRecommendations(runId).then((result) => {
      if (cancelled) return;
      setData(result);
      setLoading(false);
    }).catch((err) => {
      if (cancelled) return;
      setError(err?.message ?? "Failed to load recommendations");
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [runId]);

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <Ionicons name="fitness-outline" size={18} color="#6347C7" />
        <Text style={styles.title}>Recommendations</Text>
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color="#6347C7" />
          <Text style={styles.loadingText}>Analysing your gait with AI…</Text>
        </View>
      ) : error ? (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle-outline" size={16} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : !data || data.issues.length === 0 ? (
        <View style={styles.emptyBox}>
          <Ionicons name="checkmark-circle-outline" size={28} color="#22C55E" />
          <Text style={styles.emptyTitle}>Great form!</Text>
          <Text style={styles.emptyText}>
            {data?.summary ?? "No significant gait issues detected."}
          </Text>
        </View>
      ) : (
        <>
          <Text style={styles.summary}>{data.summary}</Text>
          {data.issues.map((issue) => (
            <RecommendationCard key={issue.issue_key} issue={issue} />
          ))}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 12,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
  },
  loadingBox: {
    alignItems: "center",
    paddingVertical: 20,
    gap: 10,
  },
  loadingText: {
    fontSize: 13,
    color: "#64748B",
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FEF2F2",
    borderRadius: 10,
    padding: 12,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 13,
    flex: 1,
  },
  emptyBox: {
    alignItems: "center",
    paddingVertical: 16,
    gap: 6,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  emptyText: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 19,
  },
  summary: {
    fontSize: 14,
    color: "#334155",
    lineHeight: 21,
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    padding: 12,
  },
});
