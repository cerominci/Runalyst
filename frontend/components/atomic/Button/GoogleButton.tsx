import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, ViewStyle } from "react-native";

interface GoogleButtonProps {
  onPress: () => void;
  style?: ViewStyle;
}

const GoogleButton: React.FC<GoogleButtonProps> = ({ onPress, style }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.button, style]}
      activeOpacity={0.7}
    >
      <Image
        source={{
          uri: "https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg",
        }}
        style={styles.icon}
      />
      <Text style={styles.text}>Continue with Google</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: "center",
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  text: {
    fontSize: 15,
    color: "#444",
    fontWeight: "500",
  },
});

export default GoogleButton;
