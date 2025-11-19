// components/composite/Analysis/VideoListItem.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface VideoListItemProps {
  thumbnailUri: string;     // videodan alınan frame veya gif
  date: string;             // örn: "Oct 5, 2025"
  score?: number;           // örn: 84
  onPress: () => void;
}

const VideoListItem: React.FC<VideoListItemProps> = ({
  thumbnailUri,
  date,
  score,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <Image source={{ uri: thumbnailUri }} style={styles.thumbnail} />

      <View style={styles.info}>
        <Text style={styles.date}>{date}</Text>

        {score !== undefined && (
          <View style={styles.scoreContainer}>
            <Ionicons name="fitness-outline" size={16} color="#2563EB" />
            <Text style={styles.scoreText}>{score}</Text>
          </View>
        )}
      </View>

      <Ionicons name="chevron-forward" size={20} color="#64748B" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
    marginBottom: 12,
  },
  thumbnail: {
    width: 70,
    height: 70,
    borderRadius: 10,
    backgroundColor: "#E2E8F0",
  },
  info: {
    flex: 1,
  },
  date: {
    fontSize: 14,
    color: "#334155",
    fontWeight: "600",
  },
  scoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  scoreText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1D4ED8",
  },
});

export default VideoListItem;
