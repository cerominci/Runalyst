import React, { useEffect, useRef, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View, ScrollView } from "react-native";
import ScreenContainer from "@/components/atomic/Layout/ScreenContainer";
import Column from "@/components/atomic/Layout/Column";
import ChatInputBar from "@/components/composite/RunAssist/ChatInputBar";
import ChatMessageBot from "@/components/composite/RunAssist/ChatMessageBot";
import ChatMessageUser from "@/components/composite/RunAssist/ChatMessageUser";

type Message = { id: string; sender: "user" | "bot"; text: string };
type VideoItem = { id: string; title: string; thumbnailUrl?: string };

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { id: "m1", sender: "bot", text: "Hi — choose a video below and ask me about it." },
  ]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        // Replace this fetch with your actual DB/API endpoint
        const res = await fetch("/api/videos");
        if (!mounted) return;
        if (res.ok) {
          const json = await res.json();
          // Expecting array of { id, title, thumbnailUrl }
          setVideos(json || []);
          if ((json || []).length > 0) setSelectedVideo((json || [])[0].id);
        } else {
          // Fallback sample videos when API not available
          setVideos([
            { id: "v1", title: "Treadmill Run" },
            { id: "v2", title: "Park Interval" },
            { id: "v3", title: "Track Sprint" },
          ]);
          setSelectedVideo("v1");
        }
      } catch (e) {
        setVideos([
          { id: "v1", title: "Treadmill Run" },
          { id: "v2", title: "Park Interval" },
          { id: "v3", title: "Track Sprint" },
        ]);
        setSelectedVideo("v1");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const addMessage = (m: Message) => {
    setMessages((s) => [...s, m]);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
  };

  const handleSend = (text: string) => {
    const userMsg: Message = { id: `u_${Date.now()}`, sender: "user", text };
    addMessage(userMsg);

    // Placeholder reply: you can replace with real model/analysis call
    setTimeout(() => {
      const reply = `I will analyze ${selectedVideo ?? "the selected video"} and get back to you. (placeholder)`;
      addMessage({ id: `b_${Date.now()}`, sender: "bot", text: reply });
    }, 800);
  };

  const handleSelectVideo = (id: string) => {
    setSelectedVideo(id);
    addMessage({ id: `sel_${Date.now()}`, sender: "bot", text: `Selected video: ${videos.find((v) => v.id === id)?.title}` });
    // Here you could call an API to fetch analysis context for the selected video
  };

  return (
    <ScreenContainer>
      <Column style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>RunAssist Chat</Text>
        </View>

        <ScrollView ref={scrollRef} style={styles.messages} contentContainerStyle={styles.messagesContent}>
          {messages.map((m) => (m.sender === "user" ? <ChatMessageUser key={m.id} text={m.text} /> : <ChatMessageBot key={m.id} text={m.text} />))}
        </ScrollView>

        <View style={styles.selectorWrap}>
          <Text style={styles.selectorLabel}>Select video</Text>
          <FlatList
            horizontal
            data={videos}
            keyExtractor={(i) => i.id}
            showsHorizontalScrollIndicator={false}
            style={styles.slider}
            renderItem={({ item }) => {
              const selected = item.id === selectedVideo;
              return (
                <TouchableOpacity onPress={() => handleSelectVideo(item.id)} style={[styles.card, selected && styles.cardSelected]}>
                  <View style={styles.thumbPlaceholder} />
                  <Text numberOfLines={1} style={[styles.cardTitle, selected && styles.cardTitleSelected]}>{item.title}</Text>
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
  container: { flex: 1, justifyContent: "flex-end" },
  header: { paddingTop: 20, paddingBottom: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: "#E6EEF8", backgroundColor: "#FFFFFF" },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#0F172A" },
  messages: { flex: 1 },
  messagesContent: { padding: 12, paddingBottom: 6 },
  selectorWrap: { borderTopWidth: 1, borderTopColor: "#F1F5F9", backgroundColor: "#FFFFFF", paddingVertical: 8 },
  selectorLabel: { paddingHorizontal: 12, fontSize: 13, color: "#64748B", marginBottom: 6 },
  slider: { paddingHorizontal: 8 },
  card: { width: 120, marginHorizontal: 8, alignItems: "center" },
  cardSelected: { transform: [{ scale: 1.03 }] },
  thumbPlaceholder: { width: 120, height: 70, backgroundColor: "#E2E8F0", borderRadius: 8, marginBottom: 6 },
  cardTitle: { fontSize: 13, color: "#1E293B" },
  cardTitleSelected: { color: "#3B82F6", fontWeight: "600" },
});
