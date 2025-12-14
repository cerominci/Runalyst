// components/composite/History/MetricCard.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import BodyText from "../../atomic/Typography/BodyText";
import Subtitle from "../../atomic/Typography/Subtitle";

type TrendType = "up" | "down" | "neutral";

interface MetricCardProps {
  label: string;          // örn: "Cadence"
  value: string;          // "172"
  unit?: string;          // "steps/min"
  trend?: TrendType;
  trendText?: string;     // "Better than last run"
  style?: ViewStyle;
}

const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  unit,
  trend = "neutral",
  trendText,
  style,
}) => {
  const { iconName, iconColor } = getTrendIcon(trend);

  return (
    <View style={[styles.card, style]}>
      <Subtitle style={styles.label}>{label}</Subtitle>

      <View style={styles.row}>
        <Text style={styles.value}>{value}</Text>
        {unit && <Text style={styles.unit}>{unit}</Text>}
      </View>

      {trend !== "neutral" && trendText && (
        <View style={styles.trendRow}>
          <Ionicons name={iconName} size={16} color={iconColor} />
          <BodyText style={[styles.trendText, { color: iconColor }]}>
            {trendText}
          </BodyText>
        </View>
      )}
    </View>
  );
};

// 🔧 BURASI ÖNEMLİ: iconName tipi net tanımlanıyor
function getTrendIcon(
  trend: TrendType
): { iconName: keyof typeof Ionicons.glyphMap; iconColor: string } {
  switch (trend) {
    case "up":
      return {
        iconName: "arrow-up-circle",
        iconColor: "#16A34A",
      };
    case "down":
      return {
        iconName: "arrow-down-circle",
        iconColor: "#DC2626",
      };
    default:
      return {
        iconName: "remove-circle-outline",
        iconColor: "#6B7280",
      };
  }
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 18,
    boxShadow: "0px 4px 10px 0px rgba(0, 0, 0, 0.06)",
    elevation: 3,
  },
  label: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginTop: 8,
  },
  value: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: -0.5,
  },
  unit: {
    marginLeft: 6,
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 2,
  },
  trendRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    gap: 6,
  },
  trendText: {
    fontSize: 12,
  },
});

export default MetricCard;
