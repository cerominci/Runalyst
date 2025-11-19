// components/composite/RunAssist/ChatMessageBot.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface ChatMessageBotProps {
  text: string;
}

const ChatMessageBot: React.FC<ChatMessageBotProps> = ({ text }) => {
  return (
    <View style={styles.container}>
      <Ionicons name="fitness-outline" size={20} color="#64748B" style={styles.icon} />

      <View style={styles.bubble}>
        <Text style={styles.text}>{text}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "flex-start",
    flexDirection: "row",
    marginVertical: 6,
    paddingHorizontal: 6,
  },
  icon: {
    marginRight: 6,
    marginTop: 4,
  },
  bubble: {
    maxWidth: "80%",
    backgroundColor: "#E2E8F0",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderTopLeftRadius: 4,
  },
  text: {
    color: "#1E293B",
    fontSize: 14,
  },
});

export default ChatMessageBot;
