import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Line, Polyline, Text as SvgText } from "react-native-svg";

export type EventDegreePoint = {
  frame: number;
  degree: number;
};

interface EventDegreeLineChartProps {
  title: string;
  data: EventDegreePoint[];
}

const WIDTH = 320;
const HEIGHT = 180;
const PADDING = 26;

const EventDegreeLineChart: React.FC<EventDegreeLineChartProps> = ({ title, data }) => {
  if (!data.length) return null;

  const minFrame = Math.min(...data.map((d) => d.frame));
  const maxFrame = Math.max(...data.map((d) => d.frame));
  const minDeg = Math.min(...data.map((d) => d.degree));
  const maxDeg = Math.max(...data.map((d) => d.degree));

  const frameRange = Math.max(maxFrame - minFrame, 1);
  const degRange = Math.max(maxDeg - minDeg, 1);

  const toX = (frame: number) =>
    PADDING + ((frame - minFrame) / frameRange) * (WIDTH - PADDING * 2);
  const toY = (degree: number) =>
    HEIGHT - PADDING - ((degree - minDeg) / degRange) * (HEIGHT - PADDING * 2);

  const points = data.map((item) => `${toX(item.frame)},${toY(item.degree)}`).join(" ");

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Svg width={WIDTH} height={HEIGHT}>
        <Line
          x1={PADDING}
          y1={PADDING}
          x2={PADDING}
          y2={HEIGHT - PADDING}
          stroke="#CBD5E1"
          strokeWidth={1}
        />
        <Line
          x1={PADDING}
          y1={HEIGHT - PADDING}
          x2={WIDTH - PADDING}
          y2={HEIGHT - PADDING}
          stroke="#CBD5E1"
          strokeWidth={1}
        />
        <Polyline
          points={points}
          fill="none"
          stroke="#2563EB"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {data.map((item, index) => (
          <Circle
            key={`${item.frame}-${index}`}
            cx={toX(item.frame)}
            cy={toY(item.degree)}
            r={2.6}
            fill="#1D4ED8"
          />
        ))}
        <SvgText x={PADDING} y={HEIGHT - 8} fontSize={10} fill="#64748B">
          {minFrame}
        </SvgText>
        <SvgText x={WIDTH - PADDING - 18} y={HEIGHT - 8} fontSize={10} fill="#64748B">
          {maxFrame}
        </SvgText>
        <SvgText x={2} y={PADDING + 2} fontSize={10} fill="#64748B">
          {maxDeg.toFixed(1)}°
        </SvgText>
        <SvgText x={2} y={HEIGHT - PADDING + 4} fontSize={10} fill="#64748B">
          {minDeg.toFixed(1)}°
        </SvgText>
      </Svg>
      <Text style={styles.axisHint}>Frame (x) / Degree (y)</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    padding: 10,
  },
  title: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 8,
  },
  axisHint: {
    marginTop: 4,
    color: "#64748B",
    fontSize: 11,
  },
});

export default EventDegreeLineChart;
