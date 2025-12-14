// components/composite/Analysis/ResultExplanationText.tsx
import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import BodyText from "../../atomic/Typography/BodyText";
import Subtitle from "../../atomic/Typography/Subtitle";

interface ResultExplanationTextProps {
  title?: string;
  points: string[];       // her madde 1 cümle/2 cümle kısa açıklama
  style?: ViewStyle;
}

const ResultExplanationText: React.FC<ResultExplanationTextProps> = ({
  title = "What this means",
  points,
  style,
}) => {
  if (!points || points.length === 0) return null;

  return (
    <View style={[styles.card, style]}>
      <Subtitle>{title}</Subtitle>

      <View style={styles.list}>
        {points.map((p, idx) => (
          <View key={idx} style={styles.listItem}>
            <Text style={styles.bullet}>•</Text>
            <BodyText style={styles.text}>{p}</BodyText>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 14,
    boxShadow: "0px 3px 8px 0px rgba(0, 0, 0, 0.04)",
    elevation: 1,
    marginBottom: 16,
  },
  list: {
    marginTop: 10,
    gap: 6,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  bullet: {
    fontSize: 14,
    marginRight: 6,
    color: "#4B5563",
    marginTop: 1,
  },
  text: {
    flex: 1,
  },
});

export default ResultExplanationText;
