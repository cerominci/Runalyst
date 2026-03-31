import React from "react";
import { StyleSheet, Text, TouchableOpacity, ViewStyle } from "react-native";

interface SecondaryButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
}

const SecondaryButton: React.FC<SecondaryButtonProps> = ({ title, onPress, style }) => {
  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderColor: "#6366F1",
    borderWidth: 1.5,
    paddingVertical: 16,
    borderRadius: 50,
    alignItems: "center",
    backgroundColor: "transparent",
  },
  text: {
    color: "#6366F1",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
});

export default SecondaryButton;
