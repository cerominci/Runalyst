import PrimaryButton from "@/components/atomic/Button/PrimaryButton";
import ErrorAlert from "@/components/atomic/Feedback/ErrorAlert";
import InfoAlert from "@/components/atomic/Feedback/InfoAlert";
import LoadingSpinner from "@/components/atomic/Feedback/LoadingSpinner";
import Banner from "@/components/atomic/Layout/Banner";
import Column from "@/components/atomic/Layout/Column";
import ScreenContainer from "@/components/atomic/Layout/ScreenContainer";
import ScrollScreen from "@/components/atomic/Layout/ScrollScreen";
import BodyText from "@/components/atomic/Typography/BodyText";
import Subtitle from "@/components/atomic/Typography/Subtitle";
import { getToken } from "@/utils/devAuth";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { VideoView, useVideoPlayer } from "expo-video";
import React, { useMemo, useState } from "react";
import { Modal, Platform, Pressable, StyleSheet, View } from "react-native";

export default function GalleryPressScreen() {
  const router = useRouter();

  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // ✅ Cross-platform popup helper
  type PopupTone = "info" | "success" | "error";

  const [popup, setPopup] = useState<{
    visible: boolean;
    title: string;
    message?: string;
    tone: PopupTone;
  }>({ visible: false, title: "", message: "", tone: "info" });

  const showPopup = (title: string, message?: string, tone: PopupTone = "info") => {
    setPopup({ visible: true, title, message, tone });
  };

  const hidePopup = () => setPopup((p) => ({ ...p, visible: false }));
  function PopupModal({
    visible,
    title,
    message,
    tone,
    onClose,
  }: {
    visible: boolean;
    title: string;
    message?: string;
    tone: "info" | "success" | "error";
    onClose: () => void;
  }) {
    return (
      <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
        <Pressable style={popupStyles.backdrop} onPress={onClose}>
          <Pressable style={popupStyles.card} onPress={() => {}}>
            <View style={[popupStyles.accent, tone === "success" ? popupStyles.success : tone === "error" ? popupStyles.error : popupStyles.info]} />
            <View style={popupStyles.content}>
              <Subtitle style={popupStyles.title}>{title}</Subtitle>
              {!!message && <BodyText style={popupStyles.message}>{message}</BodyText>}

              <PrimaryButton title="OK" onPress={onClose} style={popupStyles.okButton} />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    );
  }

  const popupStyles = StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.45)",
      alignItems: "center",
      justifyContent: "center",
      padding: 16,
    },
    card: {
      width: "100%",
      maxWidth: 420,
      borderRadius: 16,
      overflow: "hidden",
      backgroundColor: "#FFFFFF",
    },
    accent: { height: 6 },
    info: { backgroundColor: "#3B82F6" },
    success: { backgroundColor: "#22C55E" },
    error: { backgroundColor: "#EF4444" },

    content: { padding: 16, gap: 10 },
    title: { fontSize: 18 },
    message: { color: "#64748B", lineHeight: 20 },
    okButton: { width: "100%", paddingVertical: 14, marginTop: 6 },
  });


  const player = useVideoPlayer(selectedVideo ?? "", (p) => {
    p.loop = true;
    p.play();
  });

  const API_BASE = "https://runalyst-backend.onrender.com";
  const GENERATE_URL_ENDPOINT = `${API_BASE}/auth/generate-upload-url`;

  const fetchUploadUrlAsync = async (name?: string, type?: string): Promise<string> => {
    const TOKEN = await getToken();

    const res = await fetch(GENERATE_URL_ENDPOINT, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: "Bearer " + TOKEN,
      },
      // If backend expects metadata, you can add:
      // body: JSON.stringify({ name, type }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`generate-url failed (${res.status}): ${text}`);
    }

    const json = await res.json().catch(() => ({}));
    const url: unknown = (json as any)?.upload_url;

    if (typeof url !== "string" || url.length === 0) {
      throw new Error('Missing "upload_url" in response');
    }

    return url;
  };

  const pickVideoAsync = async () => {
    setError(null);
    setSuccess(null);

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "videos",
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedVideo(result.assets?.[0]?.uri ?? null);
      showPopup("Selected", "Video selected successfully!");
    } else {
      showPopup("No video selected");
    }
  };

  const fileInfo = useMemo(() => {
    if (!selectedVideo) return null;

    const uri = selectedVideo;
    const name = (uri.split("/").pop() || "video.mp4").toLowerCase();

    const type =
      name.endsWith(".mov")
        ? "video/quicktime"
        : name.endsWith(".webm")
        ? "video/webm"
        : name.endsWith(".mkv")
        ? "video/x-matroska"
        : "video/mp4";

    return { uri, name, type };
  }, [selectedVideo]);

  const uploadVideoAsync = async () => {
    const TOKEN = await getToken();

    if (!fileInfo) {
      setError("Pick a video first");
      showPopup("Missing video", "Pick a video first.");
      return;
    }

    setIsUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const uploadUrl = await fetchUploadUrlAsync(fileInfo.name, fileInfo.type);

      // ✅ Web: blob + PUT
      if (Platform.OS === "web") {
        const videoBlob = await (await fetch(fileInfo.uri)).blob();

        const res = await fetch(uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": fileInfo.type },
          body: videoBlob,
        });

        if (!res.ok) {
          throw new Error(`Upload failed (${res.status}): ${await res.text()}`);
        }

        setSuccess("Video uploaded successfully!");
        showPopup("Success", "Video uploaded successfully!");
        return;
      }

      // ✅ Native: keep your current approach
      const form = new FormData();
      // @ts-ignore
      form.append("video", { uri: fileInfo.uri, name: fileInfo.name, type: fileInfo.type });

      const res = await fetch(uploadUrl, {
        method: "PUT",
        headers: { Authorization: "Bearer " + TOKEN },
        body: form,
      });

      if (!res.ok) {
        throw new Error(`Upload failed (${res.status}): ${await res.text()}`);
      }

      setSuccess("Video uploaded successfully!");
      showPopup("Success", "Video uploaded successfully!");
    } catch (e: any) {
      const msg = e?.message ?? "Unknown error";
      setError(msg);
      showPopup("Upload error", msg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleStartAnalysis = async () => {
    if (!selectedVideo) {
      setError("Please select a video first.");
      showPopup("No Video", "Please select a video first.");
      return;
    }

    await uploadVideoAsync();
    console.log("Starting analysis for:", selectedVideo);
  };

  return (
    <ScreenContainer>
    <PopupModal
      visible={popup.visible}
      title={popup.title}
      message={popup.message}
      tone={popup.tone}
      onClose={hidePopup}
    />

      <ScrollScreen>
        <Column style={styles.content}>
          <Banner title="Select from Gallery" onBackPress={() => router.back()} />

          <Subtitle style={styles.subtitle}>
            Choose a video from your gallery to analyze your running form.
          </Subtitle>

          {/* Inline banners still useful even if popups are blocked */}
          {error && <ErrorAlert message={error} />}
          {success && <InfoAlert message={success} />}

          {isUploading ? (
            <View style={styles.centerContainer}>
              <LoadingSpinner size="large" />
              <BodyText style={styles.loadingText}>Uploading Video...</BodyText>
            </View>
          ) : (
            <>
              {(!success && selectedVideo) ? (
                <View style={styles.videoContainer}>
                  <VideoView
                    player={player}
                    style={styles.videoPreview}
                    allowsFullscreen
                    allowsPictureInPicture
                  />
                  <InfoAlert message={"Video selected successfully. You can now start the analysis."} />
                </View>
              ) : (
                <InfoAlert message="Tap the button below to select a video from your gallery." />
              )}

              <PrimaryButton
                title={selectedVideo ? "Select Different Video" : "Pick Video from Gallery"}
                onPress={pickVideoAsync}
                disabled={isUploading}
                style={styles.pickButton}
              />

              {selectedVideo && (
                <PrimaryButton
                  title="Start Analysis"
                  onPress={handleStartAnalysis}
                  style={styles.analyzeButton}
                />
              )}
            </>
          )}
        </Column>
      </ScrollScreen>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    gap: 16,
  },
  subtitle: {
    fontSize: 16,
    color: "#64748B",
    lineHeight: 24,
    marginTop: 8,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    minHeight: 200,
  },
  loadingText: {
    marginTop: 12,
    textAlign: "center",
    color: "#64748B",
  },
  videoContainer: {
    width: "100%",
    gap: 12,
  },
  videoPreview: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: 12,
    backgroundColor: "#000000",
  },
  pickButton: {
    width: "100%",
    paddingVertical: 16,
    marginTop: 8,
  },
  analyzeButton: {
    width: "100%",
    paddingVertical: 16,
    marginTop: 8,
  },
});
