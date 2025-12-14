/*import PrimaryButton from "@/components/atomic/Button/PrimaryButton";
import ErrorAlert from "@/components/atomic/Feedback/ErrorAlert";
import InfoAlert from "@/components/atomic/Feedback/InfoAlert";
import LoadingSpinner from "@/components/atomic/Feedback/LoadingSpinner";
import Banner from "@/components/atomic/Layout/Banner";
import Column from "@/components/atomic/Layout/Column";
import ScreenContainer from "@/components/atomic/Layout/ScreenContainer";
import ScrollScreen from "@/components/atomic/Layout/ScrollScreen";
import BodyText from "@/components/atomic/Typography/BodyText";
import Subtitle from "@/components/atomic/Typography/Subtitle";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Image, StyleSheet, View } from "react-native";

export default function GalleryPressScreen() {
  const router = useRouter();
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePickVideo = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        setError("Permission to access media library is required!");
        setIsLoading(false);
        return;
      }

      // Pick video
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedVideo(result.assets[0].uri);
        // TODO: Process the selected video for analysis
        console.log("Selected video:", result.assets[0].uri);
      }
    } catch (err) {
      console.error("Error picking video:", err);
      setError("Failed to pick video. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartAnalysis = () => {
    if (!selectedVideo) {
      Alert.alert("No Video", "Please select a video first.");
      return;
    }
    // TODO: Navigate to analysis page or start analysis
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

          {isLoading ? (
            <View style={styles.centerContainer}>
              <LoadingSpinner size="large" />
              <BodyText style={styles.loadingText}>Loading gallery...</BodyText>
            </View>
          ) : (
            <>
              {selectedVideo ? (
                <View style={styles.videoContainer}>
                  <Image source={{ uri: selectedVideo }} style={styles.videoPreview} />
                  <InfoAlert message="Video selected successfully. You can now start the analysis." />
                </View>
              ) : (
                <InfoAlert message="Tap the button below to select a video from your gallery." />
              )}

              <PrimaryButton
                title={selectedVideo ? "Select Different Video" : "Pick Video from Gallery"}
                onPress={handlePickVideo}
                disabled={isLoading}
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
*/