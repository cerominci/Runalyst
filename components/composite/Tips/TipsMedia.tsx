// components/composite/Tips/TipsMedia.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from "react-native";

type TipsMediaType = "image" | "video";

interface TipsMediaProps {
  type: TipsMediaType;
  uri: string;              // Image or thumbnail url
  caption?: string;
  style?: ViewStyle;
  onPressVideo?: () => void; // video için tıklandığında player açmak istersen
}

const TipsMedia: React.FC<TipsMediaProps> = ({
  type,
  uri,
  caption,
  style,
  onPressVideo,
}) => {
  if (type === "image") {
    return (
      <View style={[styles.container, style]}>
        <Image source={{ uri }} style={styles.image} resizeMode="cover" />
        {caption && <Text style={styles.caption}>{caption}</Text>}
      </View>
    );
  }

  // video
  return (
    <TouchableOpacity
      style={[styles.container, style]}
      activeOpacity={0.8}
      onPress={onPressVideo}
    >
      <Image source={{ uri }} style={styles.image} resizeMode="cover" />
      <View style={styles.overlay}>
        <View style={styles.playButton}>
          <Ionicons name="play" size={24} color="#FFFFFF" />
        </View>
      </View>
      {caption && <Text style={styles.caption}>{caption}</Text>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#0F172A",
  },
  image: {
    width: "100%",
    height: 180,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  playButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(15, 23, 42, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  caption: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 13,
    color: "#E5E7EB",
    backgroundColor: "#020617",
  },
});

export default TipsMedia;
