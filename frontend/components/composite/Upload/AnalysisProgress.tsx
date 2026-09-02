// components/composite/Upload/AnalysisProgress.tsx
import React from "react";
import { StyleSheet, View } from "react-native";
import LoadingSpinner from "../../atomic/Feedback/LoadingSpinner";
import ProgressBar from "../../atomic/Feedback/ProgressBar";
import BodyText from "../../atomic/Typography/BodyText";
import Subtitle from "../../atomic/Typography/Subtitle";

interface AnalysisProgressProps {
  progress: number; // 0–1
  stageText?: string; // örn: "Running SMPL inference..."
}

const AnalysisProgress: React.FC<AnalysisProgressProps> = ({
  progress,
  stageText,
}) => {
  const percentage = Math.round(progress * 100);

  return (
    <View style={styles.card}>
      <Subtitle>Analyzing your run...</Subtitle>
      <BodyText style={styles.text}>
        {stageText || "Please keep the app open while we process your video."}
      </BodyText>

      <View style={styles.row}>
        <View style={styles.progressWrapper}>
          <ProgressBar progress={progress} />
          <BodyText style={styles.percentText}>{percentage}%</BodyText>
        </View>
        <LoadingSpinner size="small" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 16,
    boxShadow: "0px 4px 10px 0px rgba(0, 0, 0, 0.06)",
    elevation: 2,
    gap: 10,
  },
  text: {
    color: "#475569",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  progressWrapper: {
    flex: 1,
    gap: 4,
  },
  percentText: {
    fontSize: 13,
    color: "#64748B",
  },
});

export default AnalysisProgress;
