// components/composite/Upload/VideoSourceCard.tsx
import React from "react";
import { StyleSheet, View } from "react-native";
import BodyText from "../../atomic/Typography/BodyText";
import Subtitle from "../../atomic/Typography/Subtitle";

interface VideoSourceCardProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

const VideoSourceCard: React.FC<VideoSourceCardProps> = ({
  children,
  title = "Choose Video Source",
  description = "Select a method to upload your running video",
}) => {
  return (
    <View style={styles.card}>
      <Subtitle>{title}</Subtitle>
      <BodyText style={styles.description}>{description}</BodyText>
      <View style={styles.buttons}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 22,
    paddingHorizontal: 18,
    boxShadow: "0px 4px 10px 0px rgba(0, 0, 0, 0.08)",
    elevation: 3,
    marginBottom: 20,
  },
  description: {
    marginTop: 4,
    marginBottom: 18,
  },
  buttons: {
    gap: 12,
  },
});

export default VideoSourceCard;
