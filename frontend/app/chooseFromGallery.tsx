import AppTopBar from "@/components/composite/Layout/AppTopBar";
import { Ionicons } from "@expo/vector-icons";
import { binaryUpload, createRunRecord, generateUploadUrl } from "@/utils/endpoints";
import * as ImagePicker from "expo-image-picker";
import * as VideoThumbnails from "expo-video-thumbnails";
import { useRouter } from "expo-router";
import { VideoView, useVideoPlayer } from "expo-video";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function GalleryPressScreen() {
  const router = useRouter();

  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const player = useVideoPlayer(selectedVideo ?? "", (p) => {
    p.loop = true;
    p.play();
  });

  const pickVideoAsync = async () => {
    setError(null);
    setSuccess(false);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "videos",
        allowsEditing: false,
        quality: 1,
      });
      if (!result.canceled) {
        setSelectedVideo(result.assets?.[0]?.uri ?? null);
      }
    } catch (e: any) {
      const msg: string = e?.message ?? "";
      if (msg.includes("3164") || msg.includes("iCloud") || msg.includes("PHPhotos")) {
        setError("This video is stored in iCloud and not downloaded. Open the Photos app, download the video to your device, then try again.");
      } else {
        setError(msg || "Failed to pick video. Please try again.");
      }
    }
  };

  const trimVideoAsync = async () => {
    setError(null);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "videos",
        allowsEditing: true,
        quality: 1,
      });
      if (!result.canceled) {
        setSelectedVideo(result.assets?.[0]?.uri ?? null);
      }
    } catch (e: any) {
      const msg: string = e?.message ?? "";
      if (msg.includes("3164") || msg.includes("iCloud") || msg.includes("PHPhotos")) {
        setError("This video is stored in iCloud and not downloaded. Open the Photos app, download the video to your device, then try again.");
      } else {
        setError(msg || "Failed to pick video. Please try again.");
      }
    }
  };

  const fileInfo = useMemo(() => {
    if (!selectedVideo) return null;
    const uri = selectedVideo;
    const name = (uri.split("/").pop() || "video.mp4").toLowerCase();
    const type = name.endsWith(".mov")
      ? "video/quicktime"
      : name.endsWith(".webm")
        ? "video/webm"
        : name.endsWith(".mkv")
          ? "video/x-matroska"
          : "video/mp4";
    return { uri, name, type };
  }, [selectedVideo]);

  const handleStartAnalysis = async () => {
    if (!fileInfo) { setError("Pick a video first."); return; }
    (player as any).pause?.();
    (player as any).muted = true;
    setIsUploading(true);
    setError(null);
    try {
      const { video, thumbnail } = await generateUploadUrl();
      await binaryUpload(fileInfo.uri, video.upload_url, fileInfo.type);
      if (thumbnail.upload_url) {
        const { uri: thumbnailUri } = await VideoThumbnails.getThumbnailAsync(fileInfo.uri, { time: 1000 });
        await binaryUpload(thumbnailUri, thumbnail.upload_url, "image/jpeg");
      }
      await createRunRecord(video.path, "run");
      setSuccess(true);
      setSelectedVideo(null);
    } catch (e: any) {
      setError(e?.message ?? "Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <AppTopBar title="From Gallery" sub="Select a clip to analyse" back />

        {isUploading ? (
          <View style={styles.uploadingCard}>
            <ActivityIndicator size="large" color="#6347C7" />
            <Text style={styles.uploadingTitle}>Uploading…</Text>
            <Text style={styles.uploadingSub}>Hang tight while we send your clip.</Text>
          </View>
        ) : success ? (
          <View style={styles.successCard}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark" size={30} color="#fff" />
            </View>
            <Text style={styles.successTitle}>Upload complete</Text>
            <Text style={styles.successSub}>
              We're analysing your gait. Results will be ready in ~45 seconds.
            </Text>
            <TouchableOpacity
              style={styles.successBtn}
              onPress={() => router.push("/analysis-history" as any)}
              activeOpacity={0.85}
            >
              <Text style={styles.successBtnText}>View analysis</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setSuccess(false); }} style={styles.successLink}>
              <Text style={styles.successLinkText}>Upload another clip</Text>
            </TouchableOpacity>
          </View>
        ) : selectedVideo ? (
          <>
            {/* Video preview */}
            <View style={styles.previewCard}>
              <VideoView
                player={player}
                style={styles.videoPreview}
                allowsFullscreen
                allowsPictureInPicture
              />
              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.actionBtn} onPress={trimVideoAsync} activeOpacity={0.8}>
                  <Ionicons name="cut-outline" size={16} color="#6347C7" />
                  <Text style={styles.actionBtnText}>Trim clip</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={pickVideoAsync} activeOpacity={0.8}>
                  <Ionicons name="refresh-outline" size={16} color="#6347C7" />
                  <Text style={styles.actionBtnText}>Change</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.hintRow}>
                <Ionicons name="information-circle-outline" size={14} color="#6347C7" />
                <Text style={styles.hintText}>Trim to a 5–15 s side-on clip for best results</Text>
              </View>
            </View>

            {error && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle-outline" size={16} color="#EF4444" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <TouchableOpacity style={styles.primaryBtn} onPress={handleStartAnalysis} activeOpacity={0.85}>
              <Text style={styles.primaryBtnText}>Start Analysis →</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            {/* Empty state */}
            <TouchableOpacity style={styles.emptyCard} onPress={pickVideoAsync} activeOpacity={0.8}>
              <View style={styles.emptyIcon}>
                <Ionicons name="cloud-upload-outline" size={32} color="#6347C7" />
              </View>
              <Text style={styles.emptyTitle}>Tap to pick a video</Text>
              <Text style={styles.emptySub}>MP4, MOV, or WEBM · 5–15 seconds recommended</Text>
            </TouchableOpacity>

            {error && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle-outline" size={16} color="#EF4444" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F5F3FF" },
  scroll: { paddingHorizontal: 16, paddingBottom: 40 },

  uploadingCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 36,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 10,
    marginTop: 8,
  },
  uploadingTitle: { fontSize: 18, fontWeight: "800", color: "#0F172A", marginTop: 8 },
  uploadingSub: { fontSize: 14, color: "#64748B", textAlign: "center" },

  successCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginTop: 8,
    gap: 8,
  },
  successIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#22C55E",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  successTitle: { fontSize: 20, fontWeight: "800", color: "#0F172A" },
  successSub: { fontSize: 14, color: "#64748B", textAlign: "center", lineHeight: 20 },
  successBtn: {
    marginTop: 12,
    backgroundColor: "#6347C7",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 32,
    width: "100%",
    alignItems: "center",
  },
  successBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  successLink: { marginTop: 4, paddingVertical: 8 },
  successLinkText: { color: "#6347C7", fontWeight: "600", fontSize: 14 },

  previewCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginTop: 8,
    marginBottom: 14,
    shadowColor: "#6347C7",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  videoPreview: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#000",
  },
  actionRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 13,
    borderRightWidth: 1,
    borderRightColor: "#F1F5F9",
  },
  actionBtnText: { fontSize: 13, fontWeight: "700", color: "#6347C7" },
  hintRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#EDE9FB",
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  hintText: { fontSize: 12, color: "#4929B3", fontWeight: "500" },

  emptyCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#EDE9FB",
    borderStyle: "dashed",
    padding: 40,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 14,
    gap: 10,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "#EDE9FB",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  emptyTitle: { fontSize: 17, fontWeight: "700", color: "#0F172A" },
  emptySub: { fontSize: 13, color: "#64748B", textAlign: "center" },

  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  errorText: { color: "#EF4444", fontSize: 13, flex: 1 },

  primaryBtn: {
    backgroundColor: "#6347C7",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  primaryBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
