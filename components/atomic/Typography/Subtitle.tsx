import React, { ReactNode } from "react";
import { StyleProp, StyleSheet, Text, TextStyle } from "react-native";

interface SubtitleProps {
  children: ReactNode;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
}

const Subtitle: React.FC<SubtitleProps> = ({ children, style, numberOfLines }) => {
  return (
    <Text
      style={[styles.subtitle, style]}
      numberOfLines={numberOfLines}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E293B",
  },
});

export default Subtitle;
