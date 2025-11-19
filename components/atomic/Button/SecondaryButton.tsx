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
    borderColor: "#3B82F6",
    borderWidth: 2,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  text: {
    color: "#3B82F6",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default SecondaryButton;
