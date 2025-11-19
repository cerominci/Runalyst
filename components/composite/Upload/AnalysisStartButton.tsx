// components/composite/Upload/AnalysisStartButton.tsx
import React from "react";
import { StyleSheet, View } from "react-native";
import PrimaryButton from "../../atomic/Button/PrimaryButton";
import InfoAlert from "../../atomic/Feedback/InfoAlert";
import BodyText from "../../atomic/Typography/BodyText";

interface AnalysisStartButtonProps {
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

const AnalysisStartButton: React.FC<AnalysisStartButtonProps> = ({
  onPress,
  loading = false,
  disabled = false,
}) => {
  return (
    <View style={styles.container}>
      <InfoAlert
        message="Make sure the full running motion is visible in the video for best analysis quality."
      />
      <BodyText style={styles.info}>
        When you start, we will process your video and extract your running form using SMPL.
      </BodyText>
      <PrimaryButton
        title="Start VIBE Analysis"
        onPress={onPress}
        loading={loading}
        disabled={disabled}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    gap: 12,
    marginTop: 8,
  },
  info: {
    color: "#475569",
  },
});

export default AnalysisStartButton;
