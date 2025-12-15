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
import { Alert, StyleSheet, View } from "react-native";

export default function GalleryPressScreen() {
  const router = useRouter();
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const player = useVideoPlayer(selectedVideo ?? "", (p) => {
    p.loop = true;
    p.play();
  });
  
  const API_BASE = "https://runalyst-backend.onrender.com";
  const GENERATE_URL_ENDPOINT = `${API_BASE}/auth/generate-upload-url`;

  const fetchUploadUrlAsync = async (name?: string, type?: string): Promise<string> => {
    const TOKEN = await getToken(); //TODO: Check this
    console.log("this is token:" + TOKEN);
    const res = await fetch(GENERATE_URL_ENDPOINT, {
      method: 'POST', // change to 'POST' and add body if your API expects metadata
      headers: {
        Accept: 'application/json',
        Authorization: "Bearer " + TOKEN,
       },
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`generate-url failed (${res.status}): ${text}`);
    }

    const json = await res.json().catch(() => ({}));
    const url: unknown = (json as any)?.upload_url;
    if (typeof url !== 'string' || url.length === 0) {
      throw new Error('Missing "upload_url" in response');
    }
    return url;
  };

  const pickVideoAsync = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'videos',
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedVideo(result.assets?.[0]?.uri);
    } else {
      Alert.alert('No video selected');
    }
  };

  const fileInfo = useMemo(() => {
    if (!selectedVideo) return null;
    const uri = selectedVideo;
    const name = (uri.split('/').pop() || 'video.mp4').toLowerCase();
    const type =
      name.endsWith('.mov') ? 'video/quicktime' :
      name.endsWith('.webm') ? 'video/webm' :
      name.endsWith('.mkv') ? 'video/x-matroska' :
      'video/mp4';
    return { uri, name, type };
  }, [selectedVideo]);

  const uploadVideoAsync = async () => {
    const TOKEN = await getToken(); //TODO: Check this
    console.log("this is token:" + TOKEN);
    if (!fileInfo) {
      Alert.alert('Pick a video first');
      return;
    }

    try {
      setIsUploading(true);

      // 1) get the one-time upload target
      const uploadUrl = await fetchUploadUrlAsync(fileInfo.name, fileInfo.type);

      // 2) build multipart and POST to that upload URL
      const form = new FormData();
      // @ts-ignore React Native file shape
      form.append('video', {
        uri: fileInfo.uri,
        name: fileInfo.name,
        type: fileInfo.type,
      });

      const res = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { Authorization: 'Bearer ' + TOKEN }, // if your upload URL needs it
        body: form, // let RN set the multipart boundary; do NOT set Content-Type
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`Upload failed (${res.status}): ${text}`);
      }

      Alert.alert('Success', 'Video uploaded successfully!');
    } catch (err: any) {
      Alert.alert('Upload error', err?.message ?? 'Unknown error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleStartAnalysis = () => {
    if (!selectedVideo) {
      Alert.alert("No Video", "Please select a video first.");
      return;
    }
    uploadVideoAsync();
    console.log("Starting analysis for:", selectedVideo);
  };

  return (
    <ScreenContainer>
      <ScrollScreen>
        <Column style={styles.content}>
          <Banner title="Select from Gallery" onBackPress={() => router.back()} />

          <Subtitle style={styles.subtitle}>
            Choose a video from your gallery to analyze your running form.
          </Subtitle>

          {error && <ErrorAlert message={error} />}

          {isUploading ? (
            <View style={styles.centerContainer}>
              <LoadingSpinner size="large" />
              <BodyText style={styles.loadingText}>Loading gallery...</BodyText>
            </View>
          ) : (
            <>
              {selectedVideo ? (
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
