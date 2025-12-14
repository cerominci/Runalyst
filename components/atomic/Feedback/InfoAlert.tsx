import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";

interface InfoAlertProps {
  message: string;
  style?: ViewStyle;
}

const InfoAlert: React.FC<InfoAlertProps> = ({ message, style }) => {
  return (
    <View style={[styles.alert, style]}>
      <Ionicons name="information-circle-outline" size={20} color="#2563EB" />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  alert: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DBEAFE",
    borderLeftWidth: 4,
    borderLeftColor: "#2563EB",
    padding: 12,
    borderRadius: 8,
  },
  text: {
    marginLeft: 8,
    color: "#1E3A8A",
    fontSize: 14,
    flexShrink: 1,
  },
});

export default InfoAlert;
