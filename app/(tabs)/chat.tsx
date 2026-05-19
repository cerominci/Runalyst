import {
  ChatVideoSummary,
  getChatVideos,
  getRecommendations,
  selectChatVideo,
  sendChatMessage,
} from "@/utils/endpoints";
import { Ionicons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Message = { id: string; sender: "user" | "bot"; text: string };

const DEFAULT_SUGGESTIONS = ["Compare to last run", "Strike pattern?", "How can I improve?", "Pacing tips"];

function buildSuggestionsFromIssues(issueNames: string[]): string[] {
  if (issueNames.length === 0) return DEFAULT_SUGGESTIONS;
  const chips = issueNames.slice(0, 3).map((name) => `Fix my ${name.toLowerCase()}`);
  chips.push("Overall feedback");
  return chips;
}

export default function ChatPage() {
  const isFocused = useIsFocused();
  const scrollRef = useRef<ScrollView | null>(null);

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [videos, setVideos] = useState<ChatVideoSummary[]>([]);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>(DEFAULT_SUGGESTIONS);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "bot",
      text: "Hi — select one of your analysed videos below, then ask me anything about your running form.",
    },
  ]);
  const [videosError, setVideosError] = useState<string | null>(null);

  const scrollToBottom = () =>
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);

  const addMessage = (m: Message) => {
    setMessages((prev) => [...prev, m]);
    scrollToBottom();
  };

  const isFirstLoadRef = useRef(true);

  const loadVideos = useCallback(async () => {
    if (isFirstLoadRef.current) setLoadingVideos(true);
    setVideosError(null);
    try {
      const data = await getChatVideos();
      setSessionId(data.session_id);
      setVideos(data.videos);
    } catch (err: any) {
      setVideosError(err.message ?? "Failed to load videos");
    } finally {
      setLoadingVideos(false);
      isFirstLoadRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (isFocused) {
      loadVideos();
    }
  }, [isFocused, loadVideos]);

  const handleSelectVideo = async (videoId: string) => {
    if (!sessionId || videoId === selectedVideoId) return;
    try {
      await selectChatVideo(sessionId, videoId);
      setSelectedVideoId(videoId);
      const video = videos.find((v) => v.video_id === videoId);
      addMessage({
        id: `sel_${Date.now()}`,
        sender: "bot",
        text: `I've loaded "${video?.title ?? "this video"}". Ask me anything about your form, or tap a suggestion below.`,
      });
      // Fetch recommendations to build issue-specific suggestion chips
      const runIdNum = parseInt(videoId, 10);
      if (!isNaN(runIdNum)) {
        getRecommendations(runIdNum).then((recs) => {
          const issueNames = (recs?.issues ?? []).map((i) => i.name);
          setSuggestions(buildSuggestionsFromIssues(issueNames));
        }).catch(() => setSuggestions(DEFAULT_SUGGESTIONS));
      }
    } catch (err: any) {
      addMessage({
        id: `err_${Date.now()}`,
        sender: "bot",
        text: `Could not select video: ${err.message ?? "Unknown error"}`,
      });
    }
  };

  const handleSend = async (text?: string) => {
    const msg = (text ?? inputText).trim();
    if (!msg || !sessionId) return;
    if (!selectedVideoId) {
      addMessage({
        id: `warn_${Date.now()}`,
        sender: "bot",
        text: "Please select a video first by tapping one of the run pills below.",
      });
      return;
    }
    setInputText("");
    addMessage({ id: `u_${Date.now()}`, sender: "user", text: msg });
    setAiLoading(true);
    try {
      const { answer } = await sendChatMessage(sessionId, msg);
      addMessage({ id: `b_${Date.now()}`, sender: "bot", text: answer });
    } catch (err: any) {
      addMessage({
        id: `err_${Date.now()}`,
        sender: "bot",
        text: `Sorry, I ran into an error: ${err.message ?? "Unknown error"}`,
      });
    } finally {
      setAiLoading(false);
    }
  };

  const selectedVideo = videos.find((v) => v.video_id === selectedVideoId);
  const canSend = !!inputText.trim() && !aiLoading && !!sessionId;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.headerIcon}>
              <Ionicons name="sparkles" size={18} color="#fff" />
            </View>
            <View>
              <Text style={styles.headerTitle}>AI Coach</Text>
              <View style={styles.onlineRow}>
                <View style={styles.onlineDot} />
                <Text style={styles.onlineTxt}>AI form coach · online</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── Active video chip ── */}
        {selectedVideo ? (
          <View style={styles.activeChip}>
            <View style={styles.activeThumb}>
              <Ionicons name="play" size={14} color="#fff" />
            </View>
            <View style={styles.activeInfo}>
              <Text style={styles.activeLabel}>ACTIVE VIDEO</Text>
              <Text style={styles.activeTitle} numberOfLines={1}>
                {selectedVideo.title ?? `Run ${selectedVideo.video_id}`}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.changeBtn}
              onPress={() => setSelectedVideoId(null)}
            >
              <Text style={styles.changeBtnText}>Change</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.noVideoChip}>
            <Ionicons name="information-circle-outline" size={16} color="#6347C7" />
            <Text style={styles.noVideoText}>Select a video below to start chatting</Text>
          </View>
        )}

        {/* ── Messages ── */}
        <ScrollView
          ref={scrollRef}
          style={styles.messages}
          contentContainerStyle={styles.messagesContent}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map((m) =>
            m.sender === "user" ? (
              <View key={m.id} style={styles.userMsgWrap}>
                <View style={styles.userBubble}>
                  <Text style={styles.userBubbleText}>{m.text}</Text>
                </View>
              </View>
            ) : (
              <View key={m.id} style={styles.botMsgWrap}>
                <View style={styles.botAvatar}>
                  <Ionicons name="sparkles" size={12} color="#6347C7" />
                </View>
                <View style={styles.botBubble}>
                  <Text style={styles.botBubbleText}>{m.text}</Text>
                </View>
              </View>
            ),
          )}
          {aiLoading && (
            <View style={styles.botMsgWrap}>
              <View style={styles.botAvatar}>
                <ActivityIndicator size="small" color="#6347C7" />
              </View>
              <View style={styles.botBubble}>
                <Text style={styles.thinkingText}>Thinking…</Text>
              </View>
            </View>
          )}

          {/* Suggestion chips (show after video selected) */}
          {selectedVideo && !aiLoading && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.suggestionsScroll}
              contentContainerStyle={styles.suggestionsContent}
            >
              {suggestions.map((s) => (
                <TouchableOpacity key={s} style={styles.suggestionChip} onPress={() => handleSend(s)}>
                  <Text style={styles.suggestionChipText}>{s}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </ScrollView>

        {/* ── Bottom composer ── */}
        <View style={styles.composer}>
          {/* Video selector pills */}
          <View style={styles.videoSelectorHeader}>
            <Ionicons name="videocam-outline" size={13} color="#64748B" />
            <Text style={styles.videoSelectorLabel}>SELECT VIDEO</Text>
          </View>

          {loadingVideos ? (
            <ActivityIndicator size="small" color="#6347C7" style={styles.videosLoader} />
          ) : videosError ? (
            <TouchableOpacity onPress={loadVideos} style={styles.retryBtn}>
              <Text style={styles.retryText}>Retry loading videos</Text>
            </TouchableOpacity>
          ) : videos.length === 0 ? (
            <Text style={styles.noVideosText}>No analysed videos yet.</Text>
          ) : (
            <FlatList
              horizontal
              data={videos}
              keyExtractor={(v) => v.video_id}
              showsHorizontalScrollIndicator={false}
              style={styles.videoPills}
              contentContainerStyle={styles.videoPillsContent}
              renderItem={({ item }) => {
                const selected = item.video_id === selectedVideoId;
                return (
                  <TouchableOpacity
                    style={[styles.videoPill, selected && styles.videoPillSelected]}
                    onPress={() => handleSelectVideo(item.video_id)}
                    activeOpacity={0.75}
                  >
                    <Ionicons
                      name="play"
                      size={10}
                      color={selected ? "#fff" : "#6347C7"}
                    />
                    <Text style={[styles.videoPillText, selected && styles.videoPillTextSelected]} numberOfLines={1}>
                      {item.title ?? `Run ${item.video_id}`}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          )}

          {/* Text input row */}
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder={aiLoading ? "Waiting for response…" : "Ask about your form…"}
              placeholderTextColor="#94A3B8"
              multiline
              editable={!aiLoading}
              onSubmitEditing={() => handleSend()}
            />
            <TouchableOpacity
              style={[styles.sendBtn, !canSend && styles.sendBtnOff]}
              onPress={() => handleSend()}
              disabled={!canSend}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F5F3FF" },
  flex: { flex: 1 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    backgroundColor: "#fff",
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#6347C7",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#6347C7",
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  headerTitle: { fontWeight: "800", fontSize: 18, color: "#0F172A" },
  onlineRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 },
  onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#22C55E" },
  onlineTxt: { fontSize: 12, color: "#64748B" },

  activeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#4929B3",
    marginHorizontal: 12,
    marginTop: 10,
    marginBottom: 4,
    borderRadius: 16,
    padding: 12,
  },
  activeThumb: {
    width: 36,
    height: 44,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.25)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  activeInfo: { flex: 1 },
  activeLabel: { fontSize: 10, fontWeight: "700", color: "rgba(255,255,255,0.6)", letterSpacing: 0.5 },
  activeTitle: { fontWeight: "700", color: "#fff", fontSize: 14, marginTop: 2 },
  changeBtn: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  changeBtnText: { color: "#fff", fontWeight: "700", fontSize: 12 },

  noVideoChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#EDE9FB",
    marginHorizontal: 12,
    marginTop: 10,
    marginBottom: 4,
    borderRadius: 12,
    padding: 10,
  },
  noVideoText: { fontSize: 13, color: "#6347C7", fontWeight: "500" },

  messages: { flex: 1 },
  messagesContent: { padding: 12, paddingBottom: 4 },

  userMsgWrap: { alignItems: "flex-end", marginVertical: 5 },
  userBubble: {
    backgroundColor: "#0F172A",
    borderRadius: 18,
    borderBottomRightRadius: 4,
    paddingVertical: 11,
    paddingHorizontal: 14,
    maxWidth: "82%",
  },
  userBubbleText: { color: "#fff", fontSize: 14, lineHeight: 20 },

  botMsgWrap: { flexDirection: "row", alignItems: "flex-end", gap: 8, marginVertical: 5, maxWidth: "88%" },
  botAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#EDE9FB",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  botBubble: {
    backgroundColor: "#fff",
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    paddingVertical: 11,
    paddingHorizontal: 14,
    flex: 1,
    shadowColor: "#6347C7",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  botBubbleText: { color: "#0F172A", fontSize: 14, lineHeight: 21 },
  thinkingText: { color: "#94A3B8", fontSize: 14, fontStyle: "italic" },

  suggestionsScroll: { marginTop: 10 },
  suggestionsContent: { paddingHorizontal: 4, gap: 8, flexDirection: "row" },
  suggestionChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  suggestionChipText: { color: "#3B2A8A", fontSize: 13, fontWeight: "600" },

  composer: {
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    paddingTop: 10,
    paddingBottom: Platform.OS === "ios" ? 28 : 12,
    paddingHorizontal: 14,
  },
  videoSelectorHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  videoSelectorLabel: { fontSize: 11, fontWeight: "700", color: "#64748B", letterSpacing: 0.6 },
  videosLoader: { marginVertical: 8 },
  retryBtn: { paddingVertical: 6 },
  retryText: { color: "#6347C7", fontWeight: "600", fontSize: 13 },
  noVideosText: { color: "#94A3B8", fontSize: 13, marginBottom: 8 },
  videoPills: { marginBottom: 10 },
  videoPillsContent: { gap: 8, paddingRight: 8 },
  videoPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#EDE9FB",
    maxWidth: 180,
  },
  videoPillSelected: { backgroundColor: "#6347C7" },
  videoPillText: { fontSize: 13, fontWeight: "700", color: "#3B2A8A", flexShrink: 1 },
  videoPillTextSelected: { color: "#fff" },

  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    backgroundColor: "#F5F3FF",
    borderRadius: 999,
    paddingLeft: 16,
    paddingRight: 6,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  input: {
    flex: 1,
    minWidth: 0,
    fontSize: 15,
    color: "#0F172A",
    maxHeight: 100,
    paddingVertical: 6,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FF8A4C",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#FF8A4C",
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  sendBtnOff: { backgroundColor: "#D1C9F0", shadowOpacity: 0 },
});
