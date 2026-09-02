// components/composite/RunAssist/ChatMessageUser.tsx
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface ChatMessageUserProps {
  text: string;
}

const ChatMessageUser: React.FC<ChatMessageUserProps> = ({ text }) => {
  return (
    <View style={styles.container}>
      <View style={styles.bubble}>
        <Text style={styles.text}>{text}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "flex-end",
    marginVertical: 6,
    paddingHorizontal: 6,
  },
  bubble: {
    maxWidth: "80%",
    backgroundColor: "#3B82F6",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderTopRightRadius: 4,
  },
  text: {
    color: "#FFFFFF",
    fontSize: 14,
  },
});

export default ChatMessageUser;
