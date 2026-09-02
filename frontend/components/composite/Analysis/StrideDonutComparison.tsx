import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

interface StrideDonutComparisonProps {
  leftValue: number | null;
  rightValue: number | null;
  leftLabel?: string;
  rightLabel?: string;
  unit?: string;
  extraDotLabel?: string;
  extraDotValue?: number | null;
  extraDotColor?: string;
}

const SIZE = 148;
const STROKE_WIDTH = 18;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const LEFT_START_OFFSET = -CIRCUMFERENCE / 2;

function formatTwoDecimals(value: number | null): string {
  if (value === null || Number.isNaN(value)) return "-";
  return value.toFixed(2);
}

const StrideDonutComparison: React.FC<StrideDonutComparisonProps> = ({
  leftValue,
  rightValue,
  leftLabel = "Left",
  rightLabel = "Right",
  unit = "",
  extraDotLabel,
  extraDotValue,
  extraDotColor = "#10B981",
}) => {
  if (leftValue === null && rightValue === null) {
    return <Text style={styles.emptyText}>Stride values are not available.</Text>;
  }

  const safeLeft = Math.max(leftValue ?? 0, 0);
  const safeRight = Math.max(rightValue ?? 0, 0);
  const total = safeLeft + safeRight;
  const leftRatio = total > 0 ? safeLeft / total : 0.5;
  const leftArc = leftRatio * CIRCUMFERENCE;

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <View style={styles.chartWrap}>
          <Svg width={SIZE} height={SIZE}>
            <Circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              stroke="#E2E8F0"
              strokeWidth={STROKE_WIDTH}
              fill="none"
            />
            <Circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              stroke="#F97316"
              strokeWidth={STROKE_WIDTH}
              fill="none"
              rotation={-90}
              originX={SIZE / 2}
              originY={SIZE / 2}
            />
            <Circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              stroke="#3B82F6"
              strokeWidth={STROKE_WIDTH}
              fill="none"
              strokeDasharray={`${leftArc} ${CIRCUMFERENCE}`}
              strokeDashoffset={LEFT_START_OFFSET}
              strokeLinecap="round"
              rotation={-90}
              originX={SIZE / 2}
              originY={SIZE / 2}
            />
          </Svg>
        </View>

        <View style={styles.legendColumn}>
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: "#3B82F6" }]} />
            <View>
              <Text style={styles.legendTitle}>{leftLabel}</Text>
              <Text style={styles.legendValue}>
                {formatTwoDecimals(leftValue)}
                {unit}
              </Text>
            </View>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: "#F97316" }]} />
            <View>
              <Text style={styles.legendTitle}>{rightLabel}</Text>
              <Text style={styles.legendValue}>
                {formatTwoDecimals(rightValue)}
                {unit}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {extraDotLabel && (
        <View style={styles.extraDotRow}>
          <View style={[styles.dot, { backgroundColor: extraDotColor }]} />
          <Text style={styles.extraDotText}>
            {extraDotLabel}: {formatTwoDecimals(extraDotValue)}
            {unit}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    gap: 8,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  chartWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  legendColumn: {
    flex: 1,
    gap: 10,
    alignItems: "flex-start",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 99,
  },
  legendTitle: {
    color: "#64748B",
    fontSize: 12,
  },
  legendValue: {
    color: "#0F172A",
    fontSize: 16,
    fontWeight: "700",
  },
  extraDotRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  extraDotText: {
    color: "#334155",
    fontSize: 12,
    fontWeight: "600",
  },
  emptyText: {
    color: "#64748B",
    fontSize: 13,
  },
});

export default StrideDonutComparison;
