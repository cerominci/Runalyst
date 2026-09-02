import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface SwitchAuthLinkProps {
  text: string;
  actionText: string;
  onPress: () => void;
}

const SwitchAuthLink: React.FC<SwitchAuthLinkProps> = ({
  text,
  actionText,
  onPress,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{text} </Text>
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <Text style={styles.action}>{actionText}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 18,
  },
  text: {
    color: "#475569",
    fontSize: 14,
  },
  action: {
    color: "#3B82F6",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default SwitchAuthLink;
