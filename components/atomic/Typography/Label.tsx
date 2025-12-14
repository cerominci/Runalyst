import React, { ReactNode } from "react";
import { StyleSheet, Text, TextStyle } from "react-native";

interface LabelProps {
  children: ReactNode;
  style?: TextStyle;
}

const Label: React.FC<LabelProps> = ({ children, style }) => {
  return <Text style={[styles.label, style]}>{children}</Text>;
};

const styles = StyleSheet.create({
  label: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
    marginBottom: 4,
  },
});

export default Label;
