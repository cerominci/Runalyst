// components/composite/Upload/UploadCompletedCard.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import BodyText from "../../atomic/Typography/BodyText";
import Subtitle from "../../atomic/Typography/Subtitle";

interface UploadCompletedCardProps {
  videoName?: string;
}

const UploadCompletedCard: React.FC<UploadCompletedCardProps> = ({ videoName }) => {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.iconWrapper}>
          <Ionicons name="checkmark-circle" size={28} color="#16A34A" />
        </View>
        <View style={styles.textWrapper}>
          <Subtitle>Upload complete</Subtitle>
          <BodyText style={styles.description}>
            Your video has been uploaded successfully. You can now start the analysis.
          </BodyText>
          {videoName && (
            <Text style={styles.videoName} numberOfLines={1}>
              {videoName}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: "100%",
    backgroundColor: "#ECFDF3",
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#BBF7D0",
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  iconWrapper: {
    marginRight: 12,
    marginTop: 4,
  },
  textWrapper: {
    flex: 1,
  },
  description: {
    marginTop: 4,
    color: "#16A34A",
  },
  videoName: {
    marginTop: 6,
    fontSize: 13,
    color: "#15803D",
    fontWeight: "600",
  },
});

export default UploadCompletedCard;
