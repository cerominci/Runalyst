// components/composite/Analysis/ResultSection.tsx
import React from "react";
import { StyleSheet, View } from "react-native";
import BodyText from "../../atomic/Typography/BodyText";
import Subtitle from "../../atomic/Typography/Subtitle";

interface ResultSectionProps {
  title: string;
  description?: string;
  children?: React.ReactNode; // charts, metric cards vs.
}

const ResultSection: React.FC<ResultSectionProps> = ({
  title,
  description,
  children,
}) => {
  return (
    <View style={styles.card}>
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
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 14,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
    marginBottom: 16,
  },
  description: {
    marginTop: 4,
    color: "#64748B",
  },
  content: {
    marginTop: 12,
    gap: 12,
  },
});

export default ResultSection;
