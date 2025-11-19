// components/composite/Upload/CameraRecordButton.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface CameraRecordButtonProps {
  onPress: () => void;
}

const CameraRecordButton: React.FC<CameraRecordButtonProps> = ({ onPress }) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.iconWrapper}>
        <Ionicons name="camera-outline" size={22} color="#DC2626" />
      </View>
      <Text style={styles.text}>Record with Camera</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    backgroundColor: "#FEF2F2",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  iconWrapper: {
    backgroundColor: "#FEE2E2",
    padding: 10,
    borderRadius: 999,
    marginRight: 12,
  },
  text: {
    fontSize: 15,
    fontWeight: "600",
    color: "#DC2626",
  },
});

export default CameraRecordButton;
