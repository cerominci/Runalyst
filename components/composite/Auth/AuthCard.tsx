import React, { ReactNode } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";

interface AuthCardProps {
  children: ReactNode;
  style?: ViewStyle;
}

const AuthCard: React.FC<AuthCardProps> = ({ children, style }) => {
  return <View style={[styles.card, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 20,
    boxShadow: "0px 4px 12px 0px rgba(0, 0, 0, 0.08)",
    elevation: 3,
  },
});

export default AuthCard;
