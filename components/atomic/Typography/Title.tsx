import React, { ReactNode } from "react";
import { StyleSheet, Text, TextStyle } from "react-native";

interface TitleProps {
  children: ReactNode;
  style?: TextStyle;
  numberOfLines?: number;
}

const Title: React.FC<TitleProps> = ({ children, style, numberOfLines }) => {
  return (
    <Text
      style={[styles.title, style]}
      numberOfLines={numberOfLines}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0F172A", // koyu lacivert ton
  },
});

export default Title;
