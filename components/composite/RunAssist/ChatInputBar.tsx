// components/composite/RunAssist/ChatInputBar.tsx
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

interface ChatInputBarProps {
  onSend: (text: string) => void;
}

const ChatInputBar: React.FC<ChatInputBarProps> = ({ onSend }) => {
  const [value, setValue] = useState("");

  const send = () => {
    if (!value.trim()) return;
    onSend(value.trim());
    setValue("");
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={setValue}
        placeholder="Ask something..."
        placeholderTextColor="#94A3B8"
        multiline
      />

      <TouchableOpacity style={styles.sendBtn} onPress={send} activeOpacity={0.7}>
        <Ionicons name="send" size={20} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    alignItems: "flex-end",
  },
  input: {
    flex: 1,
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 15,
    maxHeight: 120,
    color: "#0F172A",
  },
  sendBtn: {
    marginLeft: 10,
    backgroundColor: "#3B82F6",
    padding: 10,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ChatInputBar;
