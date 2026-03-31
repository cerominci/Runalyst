import Column from "@/components/atomic/Layout/Column";
import ScreenContainer from "@/components/atomic/Layout/ScreenContainer";
import ChatInputBar from "@/components/composite/RunAssist/ChatInputBar";
import ChatMessageBot from "@/components/composite/RunAssist/ChatMessageBot";
import ChatMessageUser from "@/components/composite/RunAssist/ChatMessageUser";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Message  = { id: string; sender: "user" | "bot"; text: string };
type VideoItem = { id: string; title: string };

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { id: "m1", sender: "bot", text: "Hi! Select a video below and ask me anything about your running form." },
  ]);
  const [videos, setVideos]               = useState<VideoItem[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/videos");
        if (res.ok) {
          const json = await res.json();
          setVideos(json || []);
          if ((json || []).length > 0) setSelectedVideo((json || [])[0].id);
          return;
        }
      } catch {}
      const fallback = [
        { id: "v1", title: "Treadmill Run" },
        { id: "v2", title: "Park Interval" },
        { id: "v3", title: "Track Sprint" },
      ];
      setVideos(fallback);
      setSelectedVideo("v1");
    };
    load();
  }, []);

  const addMessage = (m: Message) => {
    setMessages((s) => [...s, m]);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
  };

  const handleSend = (text: string) => {
    addMessage({ id: `u_${Date.now()}`, sender: "user", text });
    setTimeout(() => {
      addMessage({
        id: `b_${Date.now()}`,
        sender: "bot",
        text: `I'll analyze ${selectedVideo ? videos.find((v) => v.id === selectedVideo)?.title : "your video"} based on your question. (placeholder)`,
      });
    }, 800);
  };

  const handleSelectVideo = (id: string) => {
    setSelectedVideo(id);
    const title = videos.find((v) => v.id === id)?.title;
    addMessage({ id: `sel_${Date.now()}`, sender: "bot", text: `Switched to "${title}". What would you like to know?` });
  };

  return (
    <ScreenContainer>
      <Column style={styles.container}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerIconWrap}>
            <Ionicons name="sparkles" size={18} color="#6366F1" />
          </View>
          <View>
            <Text style={styles.headerTitle}>RunAssist</Text>
            <Text style={styles.headerSub}>AI running coach</Text>
          </View>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          style={styles.messages}
          contentContainerStyle={styles.messagesContent}
        >
          {messages.map((m) =>
            m.sender === "user"
              ? <ChatMessageUser key={m.id} text={m.text} />
              : <ChatMessageBot key={m.id} text={m.text} />
          )}
        </ScrollView>

        {/* Video selector */}
        <View style={styles.selector}>
          <Text style={styles.selectorLabel}>
            <Ionicons name="film-outline" size={12} /> Select video
          </Text>
          <FlatList
            horizontal
            data={videos}
            keyExtractor={(i) => i.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.selectorList}
            renderItem={({ item }) => {
              const selected = item.id === selectedVideo;
              return (
                <TouchableOpacity
                  onPress={() => handleSelectVideo(item.id)}
                  style={[styles.videoChip, selected && styles.videoChipActive]}
                >
                  <Ionicons
                    name="videocam-outline"
                    size={13}
                    color={selected ? "#fff" : "#64748B"}
                    style={{ marginRight: 5 }}
                  />
                  <Text style={[styles.videoChipText, selected && styles.videoChipTextActive]}>
                    {item.title}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>

        <ChatInputBar onSend={handleSend} />
      </Column>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingTop: 12,
    paddingBottom: 16,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  headerIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  headerSub: {
    fontSize: 12,
    color: "#94A3B8",
  },

  messages: { flex: 1 },
  messagesContent: { padding: 8, paddingBottom: 12, gap: 4 },

  selector: {
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingTop: 10,
    paddingBottom: 6,
    backgroundColor: "#FFFFFF",
  },
  selectorLabel: {
    paddingHorizontal: 12,
    fontSize: 12,
    fontWeight: "600",
    color: "#94A3B8",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  selectorList: {
    paddingHorizontal: 12,
    gap: 8,
  },
  videoChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  videoChipActive: {
    backgroundColor: "#6366F1",
    borderColor: "#6366F1",
  },
  videoChipText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#475569",
  },
  videoChipTextActive: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
