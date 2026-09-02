// components/atomic/Typography/BodyText.tsx
import React, { ReactNode } from "react";
import { StyleProp, StyleSheet, Text, TextStyle } from "react-native";

interface BodyTextProps {
  children: ReactNode;
  style?: StyleProp<TextStyle>;   // ✅ TextStyle yerine StyleProp<TextStyle>
  numberOfLines?: number;
}

const BodyText: React.FC<BodyTextProps> = ({ children, style, numberOfLines }) => {
  return (
    <Text
      style={[styles.body, style]} 
      numberOfLines={numberOfLines}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  body: {
    fontSize: 14,
    color: "#4B5563",
  },
});

export default BodyText;
