import RecommendationsSection from "@/components/composite/Analysis/RecommendationsSection";
import ContactTrendMiniChart, {
  ContactTrendPoint,
} from "@/components/composite/Analysis/ContactTrendMiniChart";
import EventDegreeLineChart, {
  EventDegreePoint,
} from "@/components/composite/Analysis/EventDegreeLineChart";
import EventPairsTable from "@/components/composite/Analysis/EventPairsTable";
import ResultGraph from "@/components/composite/Analysis/ResultGraph";
import StrideDonutComparison from "@/components/composite/Analysis/StrideDonutComparison";
import {
  AnalysisModulesPayload,
  AnalysisResult,
  getAnalysis,
  getAnalysisHistory,
  getRun,
  KneeEvents,
  Run,
} from "@/utils/endpoints";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type AnalysisTab = "overview" | "details" | "coach";

type ResolvedAnalysis = {
  id: number | string;
  fps: number | string;
  created_at: string;
  modules: AnalysisModulesPayload;
  source: "analysis_get" | "history_fallback" | "run_fallback";
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

function buildSortedKneeSeries(events?: KneeEvents): EventDegreePoint[] {
  if (!events) return [];
  const allPoints = [
    ...toEventRows(events.foot_strike),
    ...toEventRows(events.mid_stance),
    ...toEventRows(events.toe_off),
    ...toEventRows(events.mid_swing),
  ];
  return allPoints
    .map(([frame, degree]) => ({ frame, degree }))
    .sort((a, b) => a.frame - b.frame);
}

function formatRunDate(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  const time = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 0) return `Today · ${time}`;
  if (diffDays === 1) return `Yesterday · ${time}`;
  return (
    d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) +
    ` · ${time}`
  );
}

export default function RunDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const runId = useMemo(() => Number(id), [id]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resolved, setResolved] = useState<ResolvedAnalysis | null>(null);
  const [runInfo, setRunInfo] = useState<Run | null>(null);
  const [activeTab, setActiveTab] = useState<AnalysisTab>("overview");

  const load = useCallback(async () => {
    if (!Number.isFinite(runId)) {
      setError("Invalid run id");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Load run metadata for header (non-blocking)
    getRun(runId)
      .then((r) => setRunInfo(r))
      .catch(() => {});

    try {
      const response = await getAnalysis(runId);
      setResolved(normalizeFromAnalysisResult(response));
      return;
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);

      if (!isAccessDeniedError(message)) {
        if (isNotReadyError(message)) {
          setError("Analysis is not ready yet. Please try again later.");
        } else {
          setError(message || "Failed to load analysis");
        }
        return;
      }

      // History fallback
      try {
        const history = await getAnalysisHistory();
        const matched = history.find((item) => Number(item.run_id) === runId);
        if (matched) {
          setResolved(normalizeFromHistoryResult(matched));
          return;
        }
      } catch {}

      // Run fallback
      try {
        const runPayload = await getRun(runId);
        setResolved(normalizeFromRun(runPayload));
      } catch {
        setError(message || "Failed to load analysis");
      }
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
  const trunkMeanData = [
    { label: "Global", value: asNumber(trunk?.mean_global) ?? 0 },
    { label: "Upper", value: asNumber(trunk?.mean_upper) ?? 0 },
    { label: "Lower", value: asNumber(trunk?.mean_lower) ?? 0 },
  ];

  const cadenceValue = asNumber(pelvis?.cadence_steps_per_min);
  const cadenceTarget = { min: 170, max: 180 };
  const cadenceStatus =
    cadenceValue === null
      ? null
      : cadenceValue < cadenceTarget.min
        ? "below"
        : cadenceValue > cadenceTarget.max
          ? "above"
          : "ideal";

  // ----------- Tab: Overview -----------
  function renderOverview() {
    if (!pelvis && !strike) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="analytics-outline" size={40} color="#D1C9F0" />
          <Text style={styles.emptyTitle}>No overview data</Text>
          <Text style={styles.emptyText}>Module data not available for this run.</Text>
        </View>
      );
    }

    return (
      <View style={styles.tabContent}>
        {/* Cadence */}
        {pelvis && (
          <View style={styles.metricCard}>
            <View style={styles.metricCardHeader}>
              <Text style={styles.metricCardTitle}>Cadence</Text>
              <Text style={styles.metricCardUnit}>Steps per minute</Text>
            </View>
            <Text style={styles.metricCardValue}>{formatInteger(pelvis.cadence_steps_per_min)}</Text>
            <Text style={styles.metricCardSub}>
              Target {cadenceTarget.min}–{cadenceTarget.max} spm
            </Text>
            {cadenceStatus && (
              <View
                style={[
                  styles.statusBadge,
                  cadenceStatus === "ideal" ? styles.statusIdeal : styles.statusWarn,
                ]}
              >
                <Text
                  style={[
                    styles.statusBadgeText,
                    cadenceStatus === "ideal" ? styles.statusIdealText : styles.statusWarnText,
                  ]}
                >
                  {cadenceStatus === "ideal"
                    ? "ON TARGET"
                    : cadenceStatus === "below"
                      ? "BELOW IDEAL"
                      : "ABOVE IDEAL"}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Vertical Oscillation */}
        {pelvisSummary && (
          <View style={styles.comparisonCard}>
            <Text style={styles.comparisonTitle}>Vertical Oscillation</Text>
            <StrideDonutComparison
              leftValue={asNumber(pelvisSummary.avg_excursion_L)}
              rightValue={asNumber(pelvisSummary.avg_excursion_R)}
              leftLabel="Left"
              rightLabel="Right"
              extraDotLabel="Average (All)"
              extraDotValue={averagePair(
                asNumber(pelvisSummary.avg_excursion_L),
                asNumber(pelvisSummary.avg_excursion_R),
              )}
            />
          </View>
        )}

        {/* Stride Length */}
        {pelvis && (
          <View style={styles.comparisonCard}>
            <Text style={styles.comparisonTitle}>Stride Length</Text>
            <StrideDonutComparison
              leftValue={asNumber(pelvis.mean_stride_L)}
              rightValue={asNumber(pelvis.mean_stride_R)}
              extraDotLabel="Average (All)"
              extraDotValue={averagePair(
                asNumber(pelvis.mean_stride_L),
                asNumber(pelvis.mean_stride_R),
              )}
            />
          </View>
        )}

        {/* Stride Cycle Duration */}
        {pelvisSummary && (
          <View style={styles.comparisonCard}>
            <Text style={styles.comparisonTitle}>Stride Cycle Duration</Text>
            <StrideDonutComparison
              leftValue={asNumber(pelvisSummary.avg_half_cycle_L_s)}
              rightValue={asNumber(pelvisSummary.avg_half_cycle_R_s)}
              unit=" s"
              extraDotLabel="Average (All)"
              extraDotValue={averagePair(
                asNumber(pelvisSummary.avg_half_cycle_L_s),
                asNumber(pelvisSummary.avg_half_cycle_R_s),
              )}
            />
          </View>
        )}

        {/* Strike Pattern */}
        {strike && (
          <View style={styles.metricCard}>
            <Text style={styles.metricCardTitle}>Strike Pattern</Text>
            <View style={styles.strikeRow}>
              <View style={styles.strikeItem}>
                <Text style={styles.strikeLabel}>Pattern</Text>
                <Text style={styles.strikeValue}>{formatValue(strike.overall)}</Text>
              </View>
              <View style={[styles.strikeItem, styles.strikeItemBorder]}>
                <Text style={styles.strikeLabel}>Confidence</Text>
                <Text style={styles.strikeValue}>{formatValue(strike.confidence)}</Text>
              </View>
            </View>
            {typeof strike.description === "string" && (
              <Text style={styles.strikeDescription}>{strike.description}</Text>
            )}
          </View>
        )}
      </View>
    );
  }

  // ----------- Tab: Details -----------
  function renderDetails() {
    const hasDetails = overstride1 || overstride2 || trunk || knee || swing || pelvis;
    if (!hasDetails) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="analytics-outline" size={40} color="#D1C9F0" />
          <Text style={styles.emptyTitle}>No detailed data</Text>
          <Text style={styles.emptyText}>Detailed biomechanical data not available.</Text>
        </View>
      );
    }

    return (
      <View style={styles.tabContent}>
        {/* Step Durations */}
        {pelvis && Array.isArray(pelvis.step_durations_s) && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Step Durations</Text>
            <ResultGraph
              title="Step Durations"
              unit="s"
              orientation="horizontal"
              data={pelvis.step_durations_s.map((value, index) => ({
                label: `S${index + 1}`,
                value: asNumber(value) ?? 0,
              }))}
            />
          </View>
        )}

        {/* Overstride */}
        {overstride1 && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Overstride</Text>
            {typeof overstride1.description === "string" && (
              <Text style={styles.sectionDescription}>{overstride1.description}</Text>
            )}
            <View style={styles.inlineMetric}>
              <Text style={styles.inlineMetricLabel}>Pelvis to Contact Distance</Text>
              <Text style={styles.inlineMetricValue}>
                {(() => {
                  const meanAbs = Array.isArray(overstride1.overstride)
                    ? asNumber(overstride1.overstride[0])
                    : null;
                  return meanAbs === null ? "-" : `${(meanAbs / 10).toFixed(2)} cm`;
                })()}
              </Text>
            </View>
            <View style={styles.inlineMetric}>
              <View>
                <Text style={styles.inlineMetricLabel}>Overstrides Detected</Text>
                <Text style={styles.inlineMetricSub}>overstride / total steps</Text>
              </View>
              <Text style={styles.inlineMetricValue}>
                {Array.isArray(overstride1.overstride)
                  ? `${toIntegerString(overstride1.overstride[2])}/${toIntegerString(overstride1.overstride[3])}`
                  : "-"}
              </Text>
            </View>
          </View>
        )}

        {/* Overstride Index */}
        {overstride2 && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Overstride Index</Text>
            <Text style={styles.sectionDescription}>
              Weighted combination of alpha angle and lean forward. Thresholds: acceptable &lt; 5°,
              mild &lt; 10°, overstride ≥ 10°.
            </Text>
            <View style={styles.inlineMetric}>
              <Text style={styles.inlineMetricLabel}>Mean Index</Text>
              <Text style={styles.inlineMetricValue}>
                {formatDegrees(overstride2.mean_overstride_index_deg)}
              </Text>
            </View>
            {typeof overstride2.comment === "string" && (
              <Text style={styles.commentText}>{overstride2.comment}</Text>
            )}
            {overstrideTrendData.length > 0 && (
              <ContactTrendMiniChart
                title="Per Contact Overstride Index"
                data={overstrideTrendData}
                unit="°"
              />
            )}
          </View>
        )}

        {/* Trunk Lean */}
        {trunk && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Trunk Lean Analysis</Text>
            {typeof trunk.description === "string" && (
              <Text style={styles.sectionDescription}>{trunk.description}</Text>
            )}

            <View style={styles.regionCard}>
              <Text style={styles.regionTitle}>Thoracic Spine (Upper Back)</Text>
              <View style={styles.metricsGrid}>
                {[
                  { label: "Min", value: formatDegrees(trunk.min_upper) },
                  { label: "Max", value: formatDegrees(trunk.max_upper) },
                  { label: "Mean", value: formatDegrees(trunk.mean_upper) },
                  { label: "Std", value: formatDegrees(trunk.std_upper) },
                ].map((m) => (
                  <View key={m.label} style={styles.metricGridItem}>
                    <Text style={styles.metricGridLabel}>{m.label}</Text>
                    <Text style={styles.metricGridValue}>{m.value}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.regionCard}>
              <Text style={styles.regionTitle}>Lumbar Spine (Lower Back)</Text>
              <View style={styles.metricsGrid}>
                {[
                  { label: "Min", value: formatDegrees(trunk.min_lower) },
                  { label: "Max", value: formatDegrees(trunk.max_lower) },
                  { label: "Mean", value: formatDegrees(trunk.mean_lower) },
                  { label: "Std", value: formatDegrees(trunk.std_lower) },
                ].map((m) => (
                  <View key={m.label} style={styles.metricGridItem}>
                    <Text style={styles.metricGridLabel}>{m.label}</Text>
                    <Text style={styles.metricGridValue}>{m.value}</Text>
                  </View>
                ))}
              </View>
            </View>

            <ResultGraph title="Mean Lean Comparison" unit="°" data={trunkMeanData} />
          </View>
        )}

        {/* Knee Flexion */}
        {knee && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Knee Flexion Analysis</Text>
            {typeof knee.description === "string" && (
              <Text style={styles.sectionDescription}>{knee.description}</Text>
            )}
            {renderKneeSide("Left Knee", asObject(knee.left_events) as KneeEvents | null)}
            {renderKneeSide("Right Knee", asObject(knee.right_events) as KneeEvents | null)}
          </View>
        )}

        {/* Swing / Stance */}
        {swing && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Swing & Stance Analysis</Text>
            {typeof swing.description === "string" && (
              <Text style={styles.sectionDescription}>{swing.description}</Text>
            )}
            {swingAverages && (
              <>
                <View style={styles.comparisonCard}>
                  <Text style={styles.comparisonTitle}>Left / Right Swing Phase</Text>
                  <StrideDonutComparison
                    leftValue={asNumber(swingAverages.avg_left_flight)}
                    rightValue={asNumber(swingAverages.avg_right_flight)}
                    unit="%"
                    extraDotLabel="Average (All)"
                    extraDotValue={averagePair(
                      asNumber(swingAverages.avg_left_flight),
                      asNumber(swingAverages.avg_right_flight),
                    )}
                  />
                </View>
                <View style={styles.inlineMetric}>
                  <View>
                    <Text style={styles.inlineMetricLabel}>Aerial Phase</Text>
                    <Text style={styles.inlineMetricSub}>Both feet off the ground</Text>
                  </View>
                  <Text style={styles.inlineMetricValue}>
                    {formatValue(swingAverages.avg_double_flight)}
                  </Text>
                </View>
              </>
            )}
          </View>
        )}
      </View>
    );
  }

  function renderKneeSide(title: string, events: KneeEvents | null) {
    if (!events) return null;
    const sortedSeries = buildSortedKneeSeries(events);
    return (
      <View style={styles.kneeBlock}>
        <Text style={styles.kneeSideTitle}>{title}</Text>
        <EventDegreeLineChart title={`${title} Degree Trend`} data={sortedSeries} />
        <EventPairsTable title="Foot Strike" rows={toEventRows(events.foot_strike)} />
        <EventPairsTable title="Mid Stance" rows={toEventRows(events.mid_stance)} />
        <EventPairsTable title="Toe Off" rows={toEventRows(events.toe_off)} />
        <EventPairsTable title="Mid Swing" rows={toEventRows(events.mid_swing)} />
      </View>
    );
  }

  // ----------- Tab: AI Coach -----------
  function renderCoach() {
    return (
      <View style={styles.tabContent}>
        {Object.keys(modules).length > 0 ? (
          <RecommendationsSection runId={runId} />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="sparkles-outline" size={40} color="#D1C9F0" />
            <Text style={styles.emptyTitle}>No analysis data yet</Text>
            <Text style={styles.emptyText}>
              AI recommendations will appear once the analysis is complete.
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.coachBtn}
          onPress={() => router.push({ pathname: "/(tabs)/chat", params: { runId: String(runId) } })}
          activeOpacity={0.85}
        >
          <View style={styles.coachBtnIcon}>
            <Ionicons name="sparkles" size={18} color="#fff" />
          </View>
          <Text style={styles.coachBtnText}>Ask AI Coach about this run</Text>
          <Ionicons name="chevron-forward" size={18} color="#6347C7" />
        </TouchableOpacity>
      </View>
    );
  }

  const runTitle = runInfo?.title ?? null;
  const runDateStr = formatRunDate(runInfo?.created_at);

  const tabs: { key: AnalysisTab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "details", label: "Details" },
    { key: "coach", label: "AI Coach" },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {runTitle ? runTitle : `Run #${Number.isFinite(runId) ? runId : "?"}`}
          </Text>
          {runDateStr ? <Text style={styles.headerSub}>{runDateStr}</Text> : null}
        </View>
        <View style={styles.backBtn} />
      </View>

      {/* Tab bar */}
      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabPill, activeTab === tab.key && styles.tabPillActive]}
            onPress={() => setActiveTab(tab.key)}
            activeOpacity={0.75}
          >
            <Text style={[styles.tabPillText, activeTab === tab.key && styles.tabPillTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#6347C7" />
          <Text style={styles.mutedText}>Loading analysis…</Text>
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <View style={styles.errorCard}>
            <Ionicons name="alert-circle-outline" size={24} color="#EF4444" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={load} activeOpacity={0.8}>
              <Text style={styles.retryText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {activeTab === "overview" && renderOverview()}
          {activeTab === "details" && renderDetails()}
          {activeTab === "coach" && renderCoach()}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F5F3FF" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: { flex: 1, alignItems: "center" },
  headerTitle: { fontSize: 17, fontWeight: "800", color: "#0F172A" },
  headerSub: { fontSize: 12, color: "#64748B", marginTop: 2 },

  tabBar: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  tabPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 999,
    alignItems: "center",
    backgroundColor: "#F1F5F9",
  },
  tabPillActive: {
    backgroundColor: "#6347C7",
  },
  tabPillText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#64748B",
  },
  tabPillTextActive: {
    color: "#fff",
  },

  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 40 },

  tabContent: {
    padding: 16,
    gap: 14,
  },

  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  mutedText: { color: "#64748B", fontSize: 14, marginTop: 12 },

  errorCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "#FEE2E2",
    width: "100%",
  },
  errorText: { color: "#EF4444", fontSize: 14, textAlign: "center" },
  retryBtn: {
    marginTop: 8,
    backgroundColor: "#6347C7",
    borderRadius: 999,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  retryText: { color: "#fff", fontWeight: "700", fontSize: 14 },

  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
    gap: 8,
  },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: "#0F172A" },
  emptyText: { fontSize: 13, color: "#64748B", textAlign: "center", lineHeight: 19 },

  // Metric card (cadence, strike)
  metricCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#6347C7",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
    gap: 4,
  },
  metricCardHeader: { flexDirection: "row", alignItems: "baseline", gap: 8 },
  metricCardTitle: { fontSize: 16, fontWeight: "700", color: "#0F172A" },
  metricCardUnit: { fontSize: 12, color: "#64748B" },
  metricCardValue: { fontSize: 44, fontWeight: "800", color: "#0F172A", marginTop: 4 },
  metricCardSub: { fontSize: 13, color: "#64748B" },

  statusBadge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop: 8,
  },
  statusIdeal: { backgroundColor: "#F0FDF4" },
  statusWarn: { backgroundColor: "#FFF0E8" },
  statusBadgeText: { fontSize: 11, fontWeight: "700", letterSpacing: 0.5 },
  statusIdealText: { color: "#16A34A" },
  statusWarnText: { color: "#EA580C" },

  comparisonCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#6347C7",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  comparisonTitle: { fontSize: 15, fontWeight: "700", color: "#0F172A", marginBottom: 10 },

  strikeRow: { flexDirection: "row", marginTop: 12 },
  strikeItem: { flex: 1, gap: 4 },
  strikeItemBorder: { paddingLeft: 16, borderLeftWidth: 1, borderLeftColor: "#E2E8F0" },
  strikeLabel: { fontSize: 11, fontWeight: "600", color: "#64748B", letterSpacing: 0.4 },
  strikeValue: { fontSize: 18, fontWeight: "700", color: "#0F172A", textTransform: "capitalize" },
  strikeDescription: { fontSize: 13, color: "#64748B", marginTop: 10, lineHeight: 19 },

  // Section card (details tab)
  sectionCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#6347C7",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
    gap: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: "#0F172A" },
  sectionDescription: { fontSize: 13, color: "#64748B", lineHeight: 19 },

  inlineMetric: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  inlineMetricLabel: { fontSize: 14, fontWeight: "600", color: "#334155" },
  inlineMetricSub: { fontSize: 11, color: "#94A3B8", marginTop: 2 },
  inlineMetricValue: { fontSize: 20, fontWeight: "800", color: "#0F172A" },

  commentText: {
    fontSize: 13,
    color: "#475569",
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    padding: 10,
    lineHeight: 19,
  },

  regionCard: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  regionTitle: { fontSize: 14, fontWeight: "700", color: "#0F172A" },
  metricsGrid: { flexDirection: "row", flexWrap: "wrap" },
  metricGridItem: { width: "50%", paddingVertical: 4 },
  metricGridLabel: { fontSize: 11, color: "#94A3B8", fontWeight: "600" },
  metricGridValue: { fontSize: 18, fontWeight: "700", color: "#0F172A", marginTop: 2 },

  kneeBlock: { gap: 8 },
  kneeSideTitle: { fontSize: 14, fontWeight: "700", color: "#4929B3", marginBottom: 4 },

  // AI Coach tab
  coachBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: "#EDE9FB",
    shadowColor: "#6347C7",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    marginTop: 4,
  },
  coachBtnIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#6347C7",
    alignItems: "center",
    justifyContent: "center",
  },
  coachBtnText: { flex: 1, fontSize: 15, fontWeight: "700", color: "#0F172A" },
});
