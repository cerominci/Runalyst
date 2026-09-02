// components/composite/History/LineChart.tsx
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Line, Polyline, Text as SvgText } from "react-native-svg";
import BodyText from "../../atomic/Typography/BodyText";
import Subtitle from "../../atomic/Typography/Subtitle";

export interface TimeSeriesDataPoint {
  date: string; // "10 Aug", "12 Aug"
  cadence: number;
  strideLength: number;
  groundContact: number;
  verticalOscillation: number;
}

interface LineChartProps {
  title?: string;
  description?: string;
  data: TimeSeriesDataPoint[];
  selectedMetric?: "cadence" | "strideLength" | "groundContact" | "verticalOscillation";
}

const CHART_HEIGHT = 200;
const CHART_WIDTH = 330;
const CHART_PADDING_X = 34;
const CHART_PADDING_TOP = 16;
const CHART_PADDING_BOTTOM = 28;

const LineChart: React.FC<LineChartProps> = ({
  title = "Metrics Over Time",
  description = "Track your performance metrics across the selected time period.",
  data,
  selectedMetric,
}) => {
  if (!data || data.length === 0) {
    return (
      <View style={styles.card}>
        <Subtitle>{title}</Subtitle>
        <BodyText style={styles.description}>{description}</BodyText>
        <BodyText style={styles.empty}>No data available for this filter.</BodyText>
      </View>
    );
  }

  const metricKey = selectedMetric ?? "cadence";
  const values = data.map((point) => {
    if (metricKey === "strideLength") return point.strideLength;
    if (metricKey === "groundContact") return point.groundContact;
    if (metricKey === "verticalOscillation") return point.verticalOscillation;
    return point.cadence;
  });

  const colors = {
    cadence: "#3B82F6",
    strideLength: "#10B981",
    groundContact: "#F59E0B",
    verticalOscillation: "#EF4444",
  };

  const units = {
    cadence: "steps/min",
    strideLength: "m",
    groundContact: "ms",
    verticalOscillation: "cm",
  };

  const labels = {
    cadence: "Cadence",
    strideLength: "Stride Length",
    groundContact: "Ground Contact",
    verticalOscillation: "Vertical Oscillation",
  };

  const label = labels[metricKey];
  const unit = units[metricKey];
  const color = colors[metricKey];

  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  const range = Math.max(maxValue - minValue, 1);
  const plotWidth = CHART_WIDTH - CHART_PADDING_X * 2;
  const plotHeight = CHART_HEIGHT - CHART_PADDING_TOP - CHART_PADDING_BOTTOM;

  const points = values.map((value, index) => {
    const x = CHART_PADDING_X + (index / Math.max(values.length - 1, 1)) * plotWidth;
    const y =
      CHART_PADDING_TOP + ((maxValue - value) / range) * plotHeight;
    return { x, y, value };
  });
  const polylinePoints = points.map((point) => `${point.x},${point.y}`).join(" ");

  return (
    <View style={styles.card}>
      <Subtitle>{title}</Subtitle>
      <BodyText style={styles.description}>{description}</BodyText>
      <View style={styles.metricHeader}>
        <View style={[styles.colorIndicator, { backgroundColor: color }]} />
        <Text style={styles.metricLabel}>
          {label} ({unit})
        </Text>
      </View>
      <View style={styles.chartWrapper}>
        <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
          <Line
            x1={CHART_PADDING_X}
            y1={CHART_PADDING_TOP}
            x2={CHART_PADDING_X}
            y2={CHART_HEIGHT - CHART_PADDING_BOTTOM}
            stroke="#CBD5E1"
            strokeWidth={1}
          />
          <Line
            x1={CHART_PADDING_X}
            y1={CHART_HEIGHT - CHART_PADDING_BOTTOM}
            x2={CHART_WIDTH - CHART_PADDING_X}
            y2={CHART_HEIGHT - CHART_PADDING_BOTTOM}
            stroke="#CBD5E1"
            strokeWidth={1}
          />
          <Line
            x1={CHART_PADDING_X}
            y1={CHART_PADDING_TOP}
            x2={CHART_WIDTH - CHART_PADDING_X}
            y2={CHART_PADDING_TOP}
            stroke="#E2E8F0"
            strokeWidth={1}
            strokeDasharray="4 4"
          />
          <Line
            x1={CHART_PADDING_X}
            y1={CHART_PADDING_TOP + plotHeight / 2}
            x2={CHART_WIDTH - CHART_PADDING_X}
            y2={CHART_PADDING_TOP + plotHeight / 2}
            stroke="#E2E8F0"
            strokeWidth={1}
            strokeDasharray="4 4"
          />
          <Polyline
            points={polylinePoints}
            fill="none"
            stroke={color}
            strokeWidth={3}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {points.map((point, index) => (
            <Circle
              key={`${metricKey}-${index}`}
              cx={point.x}
              cy={point.y}
              r={3.5}
              fill={color}
              stroke="#FFFFFF"
              strokeWidth={1.2}
            />
          ))}
          <SvgText x={4} y={CHART_PADDING_TOP + 4} fontSize={10} fill="#64748B">
            {maxValue.toFixed(1)}
          </SvgText>
          <SvgText
            x={4}
            y={CHART_PADDING_TOP + plotHeight / 2 + 4}
            fontSize={10}
            fill="#64748B"
          >
            {(maxValue - range / 2).toFixed(1)}
          </SvgText>
          <SvgText
            x={4}
            y={CHART_HEIGHT - CHART_PADDING_BOTTOM + 4}
            fontSize={10}
            fill="#64748B"
          >
            {minValue.toFixed(1)}
          </SvgText>
          {data.map((point, index) => {
            const x = CHART_PADDING_X + (index / Math.max(data.length - 1, 1)) * plotWidth;
            return (
              <SvgText
                key={`${point.date}-${index}`}
                x={x}
                y={CHART_HEIGHT - 8}
                fontSize={9}
                fill="#64748B"
                textAnchor="middle"
              >
                {point.date}
              </SvgText>
            );
          })}
        </Svg>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 20,
    boxShadow: "0px 6px 12px 0px rgba(0, 0, 0, 0.08)",
    elevation: 4,
    marginTop: 16,
    marginBottom: 12,
    marginHorizontal: 0,
  },
  description: {
    marginTop: 8,
    color: "#64748B",
    lineHeight: 20,
    marginBottom: 20,
  },
  empty: {
    marginTop: 16,
    color: "#9CA3AF",
    fontSize: 14,
  },
  metricHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  metricLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1E293B",
  },
  chartWrapper: {
    marginTop: 4,
    alignItems: "center",
  },
});

export default LineChart;

