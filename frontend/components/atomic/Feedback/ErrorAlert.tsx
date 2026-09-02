import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";

interface ErrorAlertProps {
  message: string;
  style?: ViewStyle;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({ message, style }) => {
  return (
    <View style={[styles.alert, style]}>
      <Ionicons name="alert-circle-outline" size={20} color="#DC2626" />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  alert: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    borderLeftWidth: 4,
    borderLeftColor: "#DC2626",
    padding: 12,
    borderRadius: 8,
  },
  text: {
    marginLeft: 8,
    color: "#7F1D1D",
    fontSize: 14,
    flexShrink: 1,
  },
});

export default ErrorAlert;
