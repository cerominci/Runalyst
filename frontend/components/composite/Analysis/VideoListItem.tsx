import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface VideoListItemProps {
  runId: string;
  title?: string | null;
  thumbnailUri?: string;
  date: string;
  score?: number;
  onPress: () => void;
}

const VideoListItem: React.FC<VideoListItemProps> = ({
  runId,
  title,
  thumbnailUri,
  date,
  score,
  onPress,
}) => {
  const scoreColor =
    score === undefined
      ? "#64748B"
      : score >= 80
        ? "#22C55E"
        : score >= 60
          ? "#FF8A4C"
          : "#EF4444";

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      {/* Thumbnail or fallback badge */}
      {thumbnailUri ? (
        <Image source={{ uri: thumbnailUri }} style={styles.thumbnail} resizeMode="cover" />
      ) : (
        <View style={styles.badge}>
          <Ionicons name="walk-outline" size={18} color="#6347C7" />
        </View>
      )}

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.runId}>Run #{runId}</Text>
        {title ? (
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        ) : null}
        <Text style={styles.date}>{date}</Text>
      </View>

      {/* Score */}
      {score !== undefined ? (
        <View style={[styles.scoreBadge, { borderColor: scoreColor }]}>
          <Text style={[styles.scoreValue, { color: scoreColor }]}>{Math.round(score)}</Text>
          <Text style={styles.scoreLabel}>/100</Text>
        </View>
      ) : null}

      <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#6347C7",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
    marginBottom: 10,
  },
  badge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#EDE9FB",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  thumbnail: {
    width: 48,
    height: 48,
    borderRadius: 14,
    flexShrink: 0,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  runId: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
  },
  title: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
  },
  date: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 1,
  },
  scoreBadge: {
    flexDirection: "row",
    alignItems: "baseline",
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 1,
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: "800",
  },
  scoreLabel: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "600",
  },
});

export default VideoListItem;
