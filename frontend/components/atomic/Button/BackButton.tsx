import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, ViewStyle } from "react-native";

interface BackButtonProps {
  onPress: () => void;
  color?: string;
  style?: ViewStyle;
}

const BackButton: React.FC<BackButtonProps> = ({
  onPress,
  color = "#1E293B",
  style,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.button, style]}
      activeOpacity={0.7}
      accessibilityLabel="Go back"
      accessibilityRole="button"
    >
      <Ionicons name="arrow-back" size={24} color={color} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 8,
    borderRadius: 8,
    marginLeft: -8, // Compensate for padding to align with content
  },
});

export default BackButton;

