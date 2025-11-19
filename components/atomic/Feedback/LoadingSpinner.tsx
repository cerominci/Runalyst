import React from "react";
import { ActivityIndicator, StyleSheet, View, ViewStyle } from "react-native";

interface LoadingSpinnerProps {
  size?: "small" | "large";
  style?: ViewStyle;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = "large", style }) => {
  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size={size} color="#3B82F6" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
});

export default LoadingSpinner;
