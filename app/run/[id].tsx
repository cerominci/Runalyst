import Banner from "@/components/atomic/Layout/Banner";
import Column from "@/components/atomic/Layout/Column";
import ScreenContainer from "@/components/atomic/Layout/ScreenContainer";
import ScrollScreen from "@/components/atomic/Layout/ScrollScreen";
import Subtitle from "@/components/atomic/Typography/Subtitle";
import Title from "@/components/atomic/Typography/Title";
import ContactTrendMiniChart, {
  ContactTrendPoint,
} from "@/components/composite/Analysis/ContactTrendMiniChart";
import EventPairsTable from "@/components/composite/Analysis/EventPairsTable";
import KeyValueGrid, {
  KeyValueItem,
} from "@/components/composite/Analysis/KeyValueGrid";
import ResultExplanationText from "@/components/composite/Analysis/ResultExplanationText";
import ResultGraph from "@/components/composite/Analysis/ResultGraph";
import ResultSection from "@/components/composite/Analysis/ResultSection";
import ResultStatsTable from "@/components/composite/Analysis/ResultStatsTable";
import StrideDonutComparison from "@/components/composite/Analysis/StrideDonutComparison";
import { MOCK_ANALYSIS_MODULES } from "@/constants/mockAnalysis";
import {
  AnalysisModulesPayload,
  AnalysisResult,
  getAnalysis,
  getAnalysisHistory,
  getRun,
  KneeEvents,
  Run,
} from "@/utils/endpoints";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

type ResolvedAnalysis = {
  id: number | string;
  fps: number | string;
  created_at: string;
  modules: AnalysisModulesPayload;
  source: "analysis_get" | "history_fallback" | "run_fallback";
};

const USE_STATIC_ANALYSIS_PREVIEW = true;

type DebugInfo = {
  runId: number;
  source?: ResolvedAnalysis["source"];
  lastError?: string;
  historyChecked?: boolean;
  historyCount?: number;
  historyMatchFound?: boolean;
};

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "-";
  if (typeof value === "number") return value.toFixed(2);
  if (typeof value === "boolean") return String(value);
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function formatInteger(value: unknown): string {
  const parsed = asNumber(value);
  if (parsed === null) return "-";
  return `${Math.round(parsed)}`;
}

function formatDegrees(value: unknown): string {
  const formatted = formatValue(value);
  return formatted === "-" ? "-" : `${formatted}°`;
}

function averagePair(left: number | null, right: number | null): number | null {
  if (left === null && right === null) return null;
  return ((left ?? 0) + (right ?? 0)) / 2;
}

function toIntegerString(value: unknown): string {
  const parsed = asNumber(value);
  if (parsed === null) return "-";
  return `${Math.round(parsed)}`;
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function asObject(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function normalizeModules(value: unknown): AnalysisModulesPayload {
  const obj = asObject(value);
  return (obj ?? {}) as AnalysisModulesPayload;
}

function normalizeFromAnalysisResult(payload: AnalysisResult): ResolvedAnalysis {
  return {
    id: formatValue(payload.id),
    fps: formatValue(payload.fps),
    created_at: formatValue(payload.created_at),
    modules: normalizeModules(payload.modules),
    source: "analysis_get",
  };
}

function normalizeFromHistoryResult(payload: AnalysisResult): ResolvedAnalysis {
  return {
    id: formatValue(payload.id),
    fps: formatValue(payload.fps),
    created_at: formatValue(payload.created_at),
    modules: normalizeModules(payload.modules),
    source: "history_fallback",
  };
}

function normalizeFromRun(payload: Run): ResolvedAnalysis {
  const analysisResults = asObject(payload.analysis_results);
  const modulesFromRun =
    normalizeModules(analysisResults?.modules) || normalizeModules(payload.analysis_results);
  return {
    id: formatValue(payload.id),
    fps: formatValue(analysisResults?.fps),
    created_at: formatValue(payload.created_at),
    modules: modulesFromRun,
    source: "run_fallback",
  };
}

function isAccessDeniedError(message: string): boolean {
  return (
    /do not have access/i.test(message) ||
    /do not have acces/i.test(message) ||
    /forbidden/i.test(message)
  );
}

function isNotReadyError(message: string): boolean {
  return (
    /404\b/.test(message) ||
    /not found/i.test(message) ||
    /not ready/i.test(message) ||
    /processing/i.test(message) ||
    /still processing/i.test(message)
  );
}

function toStatsRows(obj: Record<string, unknown>, skipKeys: string[] = []) {
  return Object.entries(obj)
    .filter(([key]) => !skipKeys.includes(key))
    .map(([key, value]) => ({ label: key, value: formatValue(value) }));
}

function toEventRows(event: unknown): [number, number][] {
  if (!Array.isArray(event)) return [];
  return event
    .filter((item): item is [unknown, unknown] => Array.isArray(item) && item.length >= 2)
    .map((item) => {
      const frame = asNumber(item[0]) ?? 0;
      const degree = asNumber(item[1]) ?? 0;
      return [frame, degree];
    });
}

function renderKneeEvents(title: string, events?: KneeEvents) {
  if (!events) return null;
  return (
    <View style={styles.kneeBlock}>
      <Subtitle style={styles.subsectionTitle}>{title}</Subtitle>
      <EventPairsTable title="Foot Strike" rows={toEventRows(events.foot_strike)} />
      <EventPairsTable title="Mid Stance" rows={toEventRows(events.mid_stance)} />
      <EventPairsTable title="Toe Off" rows={toEventRows(events.toe_off)} />
      <EventPairsTable title="Mid Swing" rows={toEventRows(events.mid_swing)} />
    </View>
  );
}

export default function RunDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const runId = useMemo(() => Number(id), [id]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resolved, setResolved] = useState<ResolvedAnalysis | null>(null);
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);

  const load = useCallback(async () => {
    if (!Number.isFinite(runId)) {
      setError("Invalid run id");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setDebugInfo({ runId });

    if (USE_STATIC_ANALYSIS_PREVIEW) {
      const mockResolved: ResolvedAnalysis = {
        id: runId,
        fps: 57,
        created_at: new Date().toISOString(),
        modules: MOCK_ANALYSIS_MODULES,
        source: "run_fallback",
      };
      console.log("[AnalysisFlow] Using static preview payload", {
        run_id: runId,
        modules: Object.keys(MOCK_ANALYSIS_MODULES),
      });
      setResolved(mockResolved);
      setDebugInfo({ runId, source: mockResolved.source });
      setLoading(false);
      return;
    }

    console.log("[AnalysisFlow] Expected /analysis/get response schema", {
      id: "number",
      fps: "number",
      created_at: "string (ISO datetime)",
      modules: "object",
    });
    console.log("[AnalysisFlow] Sending request to backend", {
      method: "GET",
      endpoint: "/analysis/get",
      query: { run_id: runId },
    });

    try {
      const response = await getAnalysis(runId);
      console.log("[AnalysisFlow] /analysis/get response", response);
      const normalized = normalizeFromAnalysisResult(response);
      setResolved(normalized);
      setDebugInfo({ runId, source: normalized.source });
      return;
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      console.log("[AnalysisFlow] /analysis/get error", { run_id: runId, message });

      if (!isAccessDeniedError(message)) {
        if (isNotReadyError(message)) {
          setResolved(null);
          setError("Analysis is not ready at the moment. Please try again.");
          return;
        }
        setResolved(null);
        setError(message || "Failed to load analysis");
        return;
      }

      try {
        console.log("[AnalysisFlow] Trying fallback /analysis/history", { run_id: runId });
        const history = await getAnalysisHistory();
        const matched = history.find((item) => {
          const candidateRunId =
            (item as { run_id?: unknown }).run_id ?? (item as { runId?: unknown }).runId;
          return Number(candidateRunId) === runId;
        });
        setDebugInfo({
          runId,
          lastError: message,
          historyChecked: true,
          historyCount: history.length,
          historyMatchFound: !!matched,
        });
        if (matched) {
          const normalized = normalizeFromHistoryResult(matched);
          setResolved(normalized);
          setDebugInfo((prev) => ({ ...(prev ?? { runId }), source: normalized.source }));
          return;
        }
      } catch (historyError) {
        console.log("[AnalysisFlow] /analysis/history fallback error", historyError);
      }

      try {
        console.log("[AnalysisFlow] Trying fallback /runs/get", { run_id: runId });
        const runPayload = await getRun(runId);
        console.log("[AnalysisFlow] /runs/get response", runPayload);
        const normalized = normalizeFromRun(runPayload);
        setResolved(normalized);
        setDebugInfo((prev) => ({ ...(prev ?? { runId }), source: normalized.source }));
        return;
      } catch (runError) {
        console.log("[AnalysisFlow] /runs/get fallback error", runError);
      }

      setResolved(null);
      setError(message || "Failed to load analysis");
    } finally {
      setLoading(false);
    }
  }, [runId]);

  useEffect(() => {
    load();
  }, [load]);

  const modules = resolved?.modules ?? {};
  const pelvis = asObject(modules.pelvis_analysis);
  const pelvisSummary = asObject(pelvis?.summary);
  const overstride1 = asObject(modules.overstride_metric_1);
  const overstride2 = asObject(modules.overstride_metric_2);
  const strike = asObject(modules.strike_analysis_new);
  const trunk = asObject(modules.trunk_lean_analysis);
  const knee = asObject(modules.knee_flexion_analysis);
  const swing = asObject(modules.swing_stance_analysis);

  const overstrideTrendData: ContactTrendPoint[] = Array.isArray(overstride2?.per_contact)
    ? overstride2.per_contact
        .map((point) => asObject(point))
        .filter(Boolean)
        .map((point, index) => ({
          label: `#${index + 1}`,
          value: asNumber(point?.overstride_index_deg) ?? 0,
        }))
    : [];

  const swingAverages = asObject(swing?.overall_averages);
  const swingData = [
    { label: "Left", value: asNumber(swingAverages?.avg_left_flight) ?? 0 },
    { label: "Right", value: asNumber(swingAverages?.avg_right_flight) ?? 0 },
    { label: "Double", value: asNumber(swingAverages?.avg_double_flight) ?? 0 },
  ];
  const trunkMeanData = [
    { label: "Global", value: asNumber(trunk?.mean_global) ?? 0 },
    { label: "Upper", value: asNumber(trunk?.mean_upper) ?? 0 },
    { label: "Lower", value: asNumber(trunk?.mean_lower) ?? 0 },
  ];

  const strikeSummaryItems: KeyValueItem[] = [
    { keyLabel: "Overall", value: formatValue(strike?.overall) },
    { keyLabel: "Confidence", value: formatValue(strike?.confidence) },
  ];

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
              {debugInfo && (
                <Text style={styles.debugText}>
                  run_id={debugInfo.runId} | source={debugInfo.source ?? "-"} | history_checked=
                  {String(!!debugInfo.historyChecked)} | history_count=
                  {debugInfo.historyCount ?? "-"} | history_match=
                  {String(!!debugInfo.historyMatchFound)}
                </Text>
              )}
            </View>
          ) : (
            <>
              {/* Temporarily hidden per UX request.
              <View style={styles.card}>
                <Subtitle style={styles.cardTitle}>Analysis Metadata</Subtitle>
                <Text style={styles.row}>ID: {resolved?.id ?? "-"}</Text>
                <Text style={styles.row}>FPS: {resolved?.fps ?? "-"}</Text>
                <Text style={styles.row}>Created At: {resolved?.created_at ?? "-"}</Text>
                <Text style={styles.sourceText}>Data source: {resolved?.source ?? "-"}</Text>
              </View>
              */}

              {pelvis && (
                <View style={styles.pelvisSectionCard}>
                  <View style={styles.cadenceCard}>
                    <Text style={styles.cadenceTitle}>Cadence</Text>
                    <Text style={styles.cadenceSubtitle}>Steps per minute</Text>
                    <Text style={styles.cadenceValue}>
                      {formatInteger(pelvis.cadence_steps_per_min)}
                    </Text>
                  </View>
                  <View style={styles.strideCompareCard}>
                    <Text style={styles.strideCompareTitle}>
                      Vertical Oscillation Comparison
                    </Text>
                    {(() => {
                      const left = asNumber(pelvisSummary?.avg_excursion_L);
                      const right = asNumber(pelvisSummary?.avg_excursion_R);
                      return (
                        <StrideDonutComparison
                          leftValue={left}
                          rightValue={right}
                          leftLabel="Left"
                          rightLabel="Right"
                          extraDotLabel="Average (All)"
                          extraDotValue={averagePair(left, right)}
                        />
                      );
                    })()}
                  </View>
                  <View style={styles.strideCompareCard}>
                    <Text style={styles.strideCompareTitle}>Stride Length Comparison</Text>
                    {(() => {
                      const left = asNumber(pelvis.mean_stride_L);
                      const right = asNumber(pelvis.mean_stride_R);
                      return (
                        <StrideDonutComparison
                          leftValue={left}
                          rightValue={right}
                          extraDotLabel="Average (All)"
                          extraDotValue={averagePair(left, right)}
                        />
                      );
                    })()}
                  </View>
                  <View style={styles.strideCompareCard}>
                    <Text style={styles.strideCompareTitle}>
                      Stride Cycle Duration Comparison
                    </Text>
                    {(() => {
                      const left = asNumber(pelvisSummary?.avg_half_cycle_L_s);
                      const right = asNumber(pelvisSummary?.avg_half_cycle_R_s);
                      return (
                        <StrideDonutComparison
                          leftValue={left}
                          rightValue={right}
                          unit=" s"
                          extraDotLabel="Average (All)"
                          extraDotValue={averagePair(left, right)}
                        />
                      );
                    })()}
                  </View>
                  <ResultGraph
                    title="Step Durations"
                    unit="s"
                    orientation="horizontal"
                    data={
                      Array.isArray(pelvis.step_durations_s)
                        ? pelvis.step_durations_s.map((value, index) => ({
                            label: `S${index + 1}`,
                            value: asNumber(value) ?? 0,
                          }))
                        : []
                    }
                  />
                </View>
              )}

              {overstride1 && (
                <ResultSection
                  title="Overstride"
                  description={formatValue(overstride1.description)}
                >
                  <View style={styles.cadenceCard}>
                    <Text style={styles.cadenceTitle}>
                      Pelvis to Initial Contact Distance
                    </Text>
                    <Text style={styles.cadenceValue}>
                      {(() => {
                        const meanAbs = Array.isArray(overstride1.overstride)
                          ? asNumber(overstride1.overstride[0])
                          : null;
                        if (meanAbs === null) return "-";
                        return `${(meanAbs / 10).toFixed(2)} cm`;
                      })()}
                    </Text>
                  </View>
                  <View style={styles.cadenceCard}>
                    <Text style={styles.cadenceTitle}>Overstrides Detected</Text>
                    <Text style={styles.cadenceSubtitle}>
                      overstride steps/total step count
                    </Text>
                    <Text style={styles.cadenceValue}>
                      {(() => {
                        const nOver = Array.isArray(overstride1.overstride)
                          ? toIntegerString(overstride1.overstride[2])
                          : "-";
                        const nTot = Array.isArray(overstride1.overstride)
                          ? toIntegerString(overstride1.overstride[3])
                          : "-";
                        return `${nOver}/${nTot}`;
                      })()}
                    </Text>
                  </View>
                </ResultSection>
              )}

              {overstride2 && (
                <ResultSection
                  title="Overstride Index"
                  description="The overstride index is a weighted combination of the alpha angle (pelvis-to-contact angle) and the lean forward angle (pelvis-to-head angle). It provides a measure of how far the foot lands ahead of the pelvis, adjusted for the runner's forward lean."
                >
                  <View style={styles.cadenceCard}>
                    <Text style={styles.cadenceTitle}>Overstride Index</Text>
                    <Text style={styles.cadenceSubtitle}>
                      Thresholds: acceptable &lt; 5, mild &lt; 10, overstride &gt;= 10
                    </Text>
                    <Text style={styles.cadenceValue}>
                      {formatDegrees(overstride2.mean_overstride_index_deg)}
                    </Text>
                    <Text style={styles.overstrideCommentText}>
                      {formatValue(overstride2.comment)}
                    </Text>
                  </View>
                  <ContactTrendMiniChart
                    title="Per Contact Overstride Index"
                    data={overstrideTrendData}
                    unit="°"
                  />
                </ResultSection>
              )}

              {strike && (
                <ResultSection
                  title="Strike Analysis"
                  description={formatValue(strike.description)}
                >
                  <KeyValueGrid items={strikeSummaryItems} columns={2} />
                </ResultSection>
              )}

              {trunk && (
                <ResultSection title="Trunk Lean Analysis">
                  <Text style={styles.trunkDescription}>
                    Details of thoracic and lumbar lean
                  </Text>

                  <View style={styles.trunkRegionCard}>
                    <Text style={styles.trunkRegionTitle}>Thoracic Spine Region</Text>
                    <Text style={styles.trunkRegionSubtitle}>Upper back lean</Text>
                    <View style={styles.trunkMetricsGrid}>
                      <View style={styles.trunkMetricItem}>
                        <Text style={styles.trunkMetricLabel}>Min</Text>
                        <Text style={styles.trunkMetricValue}>
                          {formatDegrees(trunk.min_upper)}
                        </Text>
                      </View>
                      <View style={styles.trunkMetricItem}>
                        <Text style={styles.trunkMetricLabel}>Max</Text>
                        <Text style={styles.trunkMetricValue}>
                          {formatDegrees(trunk.max_upper)}
                        </Text>
                      </View>
                      <View style={styles.trunkMetricItem}>
                        <Text style={styles.trunkMetricLabel}>Mean</Text>
                        <Text style={styles.trunkMetricValue}>
                          {formatDegrees(trunk.mean_upper)}
                        </Text>
                      </View>
                      <View style={styles.trunkMetricItem}>
                        <Text style={styles.trunkMetricLabel}>Std</Text>
                        <Text style={styles.trunkMetricValue}>
                          {formatDegrees(trunk.std_upper)}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.trunkRegionCard}>
                    <Text style={styles.trunkRegionTitle}>Lumbar Spine Region</Text>
                    <Text style={styles.trunkRegionSubtitle}>Lower back lean</Text>
                    <View style={styles.trunkMetricsGrid}>
                      <View style={styles.trunkMetricItem}>
                        <Text style={styles.trunkMetricLabel}>Min</Text>
                        <Text style={styles.trunkMetricValue}>
                          {formatDegrees(trunk.min_lower)}
                        </Text>
                      </View>
                      <View style={styles.trunkMetricItem}>
                        <Text style={styles.trunkMetricLabel}>Max</Text>
                        <Text style={styles.trunkMetricValue}>
                          {formatDegrees(trunk.max_lower)}
                        </Text>
                      </View>
                      <View style={styles.trunkMetricItem}>
                        <Text style={styles.trunkMetricLabel}>Mean</Text>
                        <Text style={styles.trunkMetricValue}>
                          {formatDegrees(trunk.mean_lower)}
                        </Text>
                      </View>
                      <View style={styles.trunkMetricItem}>
                        <Text style={styles.trunkMetricLabel}>Std</Text>
                        <Text style={styles.trunkMetricValue}>
                          {formatDegrees(trunk.std_lower)}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <ResultGraph title="Mean Lean Comparison" unit="°" data={trunkMeanData} />
                </ResultSection>
              )}

              {knee && (
                <ResultSection
                  title="Knee Flexion Analysis"
                  description={formatValue(knee.description)}
                >
                  {renderKneeEvents(
                    "Left Events",
                    (asObject(knee.left_events) as KneeEvents | null) ?? undefined,
                  )}
                  {renderKneeEvents(
                    "Right Events",
                    (asObject(knee.right_events) as KneeEvents | null) ?? undefined,
                  )}
                </ResultSection>
              )}

              {swing && (
                <ResultSection
                  title="Swing Stance Analysis"
                  description={formatValue(swing.description)}
                >
                  <View style={styles.strideCompareCard}>
                    <Text style={styles.strideCompareTitle}>Left/Right Swing Phase</Text>
                    <StrideDonutComparison
                      leftValue={asNumber(swingAverages?.avg_left_flight)}
                      rightValue={asNumber(swingAverages?.avg_right_flight)}
                      unit="%"
                      extraDotLabel="Average (All)"
                      extraDotValue={averagePair(
                        asNumber(swingAverages?.avg_left_flight),
                        asNumber(swingAverages?.avg_right_flight),
                      )}
                    />
                  </View>
                  <View style={styles.cadenceCard}>
                    <Text style={styles.cadenceTitle}>Aerial Phase</Text>
                    <Text style={styles.cadenceSubtitle}>Both feet in the air</Text>
                    <Text style={styles.cadenceValue}>
                      {formatValue(swingAverages?.avg_double_flight)}
                    </Text>
                  </View>
                </ResultSection>
              )}

              {Object.keys(modules).length === 0 && (
                <ResultExplanationText
                  title="No Module Data"
                  points={["This run does not contain detailed module results yet."]}
                />
              )}
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
  sourceText: {
    marginTop: 6,
    color: "#64748B",
    fontSize: 12,
  },
  error: {
    color: "#DC2626",
  },
  debugText: {
    marginTop: 8,
    color: "#64748B",
    fontSize: 12,
  },
  kneeBlock: {
    gap: 8,
  },
  subsectionTitle: {
    fontSize: 15,
    marginBottom: 2,
  },
  cadenceCard: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    padding: 12,
  },
  cadenceTitle: {
    color: "#0F172A",
    fontSize: 16,
    fontWeight: "700",
  },
  cadenceSubtitle: {
    color: "#64748B",
    fontSize: 12,
    marginTop: 2,
  },
  cadenceValue: {
    marginTop: 6,
    color: "#0F172A",
    fontSize: 28,
    fontWeight: "800",
  },
  strideCompareCard: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    padding: 12,
  },
  strideCompareTitle: {
    color: "#0F172A",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 8,
  },
  pelvisSectionCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 14,
    boxShadow: "0px 3px 8px 0px rgba(0, 0, 0, 0.04)",
    elevation: 1,
    marginBottom: 16,
    gap: 12,
  },
  trunkDescription: {
    color: "#475569",
    fontSize: 14,
  },
  trunkRegionCard: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    padding: 12,
    gap: 8,
  },
  trunkRegionTitle: {
    color: "#0F172A",
    fontSize: 15,
    fontWeight: "700",
  },
  trunkRegionSubtitle: {
    color: "#64748B",
    fontSize: 12,
  },
  trunkMetricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -4,
    rowGap: 8,
  },
  trunkMetricItem: {
    width: "50%",
    paddingHorizontal: 4,
  },
  trunkMetricLabel: {
    color: "#64748B",
    fontSize: 12,
    marginBottom: 2,
  },
  trunkMetricValue: {
    color: "#0F172A",
    fontSize: 17,
    fontWeight: "700",
  },
  overstrideCommentText: {
    marginTop: 8,
    color: "#475569",
    fontSize: 13,
  },
});
