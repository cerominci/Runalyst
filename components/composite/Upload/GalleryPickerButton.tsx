// components/composite/Upload/GalleryPickerButton.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface GalleryPickerButtonProps {
  onPress: () => void;
}

const GalleryPickerButton: React.FC<GalleryPickerButtonProps> = ({ onPress }) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.iconWrapper}>
        <Ionicons name="image-outline" size={22} color="#2563EB" />
      </View>
      <Text style={styles.text}>Select from Gallery</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    backgroundColor: "#EFF6FF",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  iconWrapper: {
    backgroundColor: "#DBEAFE",
    padding: 10,
    borderRadius: 999,
    marginRight: 12,
  },
  text: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1D4ED8",
  },
});

export default GalleryPickerButton;
