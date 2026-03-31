// components/composite/History/LineChart.tsx
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import BodyText from "../../atomic/Typography/BodyText";
import Subtitle from "../../atomic/Typography/Subtitle";

export interface TimeSeriesDataPoint {
  date: string; // "10 Aug", "12 Aug"
  cadence: number;
  strideLength: number;
  groundContact: number;
  speed: number;
}

interface LineChartProps {
  title?: string;
  description?: string;
  data: TimeSeriesDataPoint[];
  selectedMetric?: "cadence" | "strideLength" | "groundContact" | "speed";
}

const CHART_HEIGHT = 200;
const CHART_PADDING = 40;
const CHART_WIDTH = 300; // Will be adjusted based on container

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

  // Get all metrics to show, or just the selected one
  const metricsToShow = selectedMetric
    ? [selectedMetric]
    : ["cadence", "strideLength", "groundContact", "speed"];

  // Calculate max values for normalization
  const maxCadence = Math.max(...data.map((d) => d.cadence)) || 1;
  const maxStride = Math.max(...data.map((d) => d.strideLength)) || 1;
  const maxGroundContact = Math.max(...data.map((d) => d.groundContact)) || 1;
  const maxSpeed = Math.max(...data.map((d) => d.speed)) || 1;

  const colors = {
    cadence: "#3B82F6",
    strideLength: "#10B981",
    groundContact: "#F59E0B",
    speed: "#EF4444",
  };

  const units = {
    cadence: "steps/min",
    strideLength: "m",
    groundContact: "ms",
    speed: "m/s",
  };

  const labels = {
    cadence: "Cadence",
    strideLength: "Stride Length",
    groundContact: "Ground Contact",
    speed: "Speed",
  };

  // Calculate points for each metric
  const getPoints = (metric: string) => {
    const maxValue =
      metric === "cadence"
        ? maxCadence
        : metric === "strideLength"
        ? maxStride
        : metric === "groundContact"
        ? maxGroundContact
        : maxSpeed;

    return data.map((point, index) => {
      const value =
        metric === "cadence"
          ? point.cadence
          : metric === "strideLength"
          ? point.strideLength
          : metric === "groundContact"
          ? point.groundContact
          : point.speed;

      const x = (index / (data.length - 1 || 1)) * (CHART_WIDTH - CHART_PADDING * 2) + CHART_PADDING;
      const y =
        CHART_HEIGHT - CHART_PADDING - (value / maxValue) * (CHART_HEIGHT - CHART_PADDING * 2);
      return { x, y, value };
    });
  };

  // Simple line chart using View components (fallback if SVG not available)
  const renderSimpleChart = () => {
    return (
      <View style={styles.simpleChartContainer}>
        {metricsToShow.map((metric) => {
          const points = getPoints(metric);
          const maxValue =
            metric === "cadence"
              ? maxCadence
              : metric === "strideLength"
              ? maxStride
              : metric === "groundContact"
              ? maxGroundContact
              : maxSpeed;

          return (
            <View key={metric} style={styles.metricLine}>
              <View style={styles.metricHeader}>
                <View
                  style={[styles.colorIndicator, { backgroundColor: colors[metric as keyof typeof colors] }]}
                />
                <Text style={styles.metricLabel}>
                  {labels[metric as keyof typeof labels]} ({units[metric as keyof typeof units]})
                </Text>
              </View>
              <View style={styles.chartContainer}>
                {/* Y-axis labels */}
                <View style={styles.yAxis}>
                  <Text style={styles.axisLabel}>{Math.round(maxValue)}</Text>
                  <Text style={styles.axisLabel}>{Math.round(maxValue / 2)}</Text>
                  <Text style={styles.axisLabel}>0</Text>
                </View>

                {/* Chart area */}
                <View style={styles.chartArea}>
                  {/* Grid lines */}
                  <View style={styles.gridLine} />
                  <View style={[styles.gridLine, { top: "50%" }]} />
                  <View style={[styles.gridLine, { bottom: 0 }]} />

                  {/* Line path and data points */}
                  <View style={styles.lineContainer}>
                    {points.map((point, index) => {
                      if (index === 0) {
                        // First point - just render the circle
                        return (
                          <View
                            key={index}
                            style={[
                              styles.dataPoint,
                              {
                                left: point.x - CHART_PADDING - 4,
                                top: point.y - 4,
                                backgroundColor: colors[metric as keyof typeof colors],
                              },
                            ]}
                          />
                        );
                      }

                      const prevPoint = points[index - 1];
                      const dx = point.x - prevPoint.x;
                      const dy = point.y - prevPoint.y;
                      const distance = Math.sqrt(dx * dx + dy * dy);
                      const angle = Math.atan2(dy, dx) * (180 / Math.PI);

                      return (
                        <React.Fragment key={index}>
                          {/* Line segment */}
                          <View
                            style={[
                              styles.lineSegment,
                              {
                                left: prevPoint.x - CHART_PADDING,
                                top: prevPoint.y - 1,
                                width: distance,
                                height: 2.5,
                                transform: [{ rotate: `${angle}deg` }],
                                backgroundColor: colors[metric as keyof typeof colors],
                              },
                            ]}
                          />
                          {/* Data point */}
                          <View
                            style={[
                              styles.dataPoint,
                              {
                                left: point.x - CHART_PADDING - 4,
                                top: point.y - 4,
                                backgroundColor: colors[metric as keyof typeof colors],
                              },
                            ]}
                          />
                        </React.Fragment>
                      );
                    })}
                  </View>

                  {/* X-axis labels */}
                  <View style={styles.xAxis}>
                    {data.map((point, index) => (
                      <Text key={index} style={styles.xAxisLabel}>
                        {point.date}
                      </Text>
                    ))}
                  </View>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.card}>
      <Subtitle>{title}</Subtitle>
      <BodyText style={styles.description}>{description}</BodyText>
      {renderSimpleChart()}
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
  simpleChartContainer: {
    marginTop: 8,
  },
  metricLine: {
    marginBottom: 32,
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
  chartContainer: {
    flexDirection: "row",
    height: CHART_HEIGHT,
  },
  yAxis: {
    width: 35,
    justifyContent: "space-between",
    paddingRight: 8,
  },
  axisLabel: {
    fontSize: 10,
    color: "#6B7280",
  },
  chartArea: {
    flex: 1,
    position: "relative",
    paddingLeft: 8,
  },
  gridLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "#E5E7EB",
    opacity: 0.5,
  },
  lineContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 30,
  },
  lineSegment: {
    position: "absolute",
    height: 2.5,
    borderRadius: 1.25,
    zIndex: 1,
  },
  dataPoint: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    zIndex: 2,
  },
  xAxis: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  xAxisLabel: {
    fontSize: 9,
    color: "#6B7280",
    textAlign: "center",
    flex: 1,
  },
});

export default LineChart;

