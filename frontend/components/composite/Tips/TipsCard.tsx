// components/composite/Tips/TipsCard.tsx
import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import BodyText from "../../atomic/Typography/BodyText";
import Subtitle from "../../atomic/Typography/Subtitle";

interface TipsCardProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  style?: ViewStyle;
}

const TipsCard: React.FC<TipsCardProps> = ({
  title,
  description,
  children,
  style,
}) => {
  return (
    <View style={[styles.card, style]}>
      <Subtitle>{title}</Subtitle>
      {description && (
        <BodyText style={styles.description}>{description}</BodyText>
      )}

      {children && <View style={styles.content}>{children}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 14,
    boxShadow: "0px 3px 8px 0px rgba(0, 0, 0, 0.04)",
    elevation: 1,
    marginBottom: 14,
  },
  description: {
    marginTop: 4,
    color: "#64748B",
  },
  content: {
    marginTop: 10,
    gap: 8,
  },
});

export default TipsCard;
