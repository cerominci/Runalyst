import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";

interface ProgressBarProps {
  progress: number; // 0–1 arası
  style?: ViewStyle;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, style }) => {
  return (
    <View style={[styles.container, style]}>
      <View style={[styles.fill, { width: `${progress * 100}%` }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 12,
    width: "100%",
    backgroundColor: "#E2E8F0",
    borderRadius: 100,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    backgroundColor: "#3B82F6",
    borderRadius: 100,
  },
});

export default ProgressBar;
