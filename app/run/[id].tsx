import Banner from "@/components/atomic/Layout/Banner";
import Column from "@/components/atomic/Layout/Column";
import ScreenContainer from "@/components/atomic/Layout/ScreenContainer";
import ScrollScreen from "@/components/atomic/Layout/ScrollScreen";
import Subtitle from "@/components/atomic/Typography/Subtitle";
import Title from "@/components/atomic/Typography/Title";
import { getAnalysis, getRun } from "@/utils/endpoints";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

type JsonRecord = Record<string, unknown>;

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "-";
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

export default function RunDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const runId = useMemo(() => Number(id), [id]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [run, setRun] = useState<JsonRecord | null>(null);
  const [analysis, setAnalysis] = useState<JsonRecord | null>(null);

  const load = useCallback(async () => {
    if (!Number.isFinite(runId)) {
      setError("Invalid run id");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [runPayload, analysisPayload] = await Promise.all([
        getRun(runId).catch(() => null),
        getAnalysis(runId).catch((e: unknown) => {
          throw e;
        }),
      ]);
      setRun((runPayload ?? null) as JsonRecord | null);
      setAnalysis((analysisPayload ?? null) as JsonRecord | null);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      const notReady =
        /404\b/.test(message) ||
        /not found/i.test(message) ||
        /analysis/i.test(message);
      if (notReady) {
        setAnalysis(null);
        setError("Analysis is still processing. Please check again in a moment.");
      } else {
        setError(message || "Failed to load analysis");
      }
    } finally {
      setLoading(false);
    }
  }, [runId]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <ScreenContainer>
      <ScrollScreen>
        <Column style={styles.content}>
          <Banner title="Run Result" onBackPress={() => router.back()} />

          <Title style={styles.title}>Run #{Number.isFinite(runId) ? runId : "?"}</Title>

          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator size="small" color="#3B82F6" />
              <Subtitle style={styles.muted}>Loading run analysis...</Subtitle>
            </View>
          ) : error ? (
            <View style={styles.card}>
              <Subtitle style={styles.error}>{error}</Subtitle>
            </View>
          ) : (
            <>
              {run && (
                <View style={styles.card}>
                  <Subtitle style={styles.cardTitle}>Run Info</Subtitle>
                  <Text style={styles.row}>Video: {formatValue(run.video_path)}</Text>
                  <Text style={styles.row}>Created: {formatValue(run.created_at)}</Text>
                </View>
              )}

              <View style={styles.card}>
                <Subtitle style={styles.cardTitle}>Analysis Result</Subtitle>
                <Text style={styles.jsonText}>
                  {analysis ? JSON.stringify(analysis, null, 2) : "No analysis found yet."}
                </Text>
              </View>
            </>
          )}
        </Column>
      </ScrollScreen>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 12,
    paddingBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0F172A",
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 20,
  },
  muted: {
    color: "#64748B",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
  },
  cardTitle: {
    fontSize: 16,
    marginBottom: 8,
  },
  row: {
    color: "#334155",
    marginBottom: 4,
  },
  error: {
    color: "#DC2626",
  },
  jsonText: {
    color: "#334155",
    fontFamily: "Courier",
    fontSize: 12,
  },
});
