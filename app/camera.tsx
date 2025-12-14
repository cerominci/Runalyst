import Banner from "@/components/atomic/Layout/Banner";
import Column from "@/components/atomic/Layout/Column";
import ScreenContainer from "@/components/atomic/Layout/ScreenContainer";
import ScrollScreen from "@/components/atomic/Layout/ScrollScreen";
import Subtitle from "@/components/atomic/Typography/Subtitle";
import CameraRecordButton from "@/components/composite/Upload/CameraRecordButton";
import GalleryPickerButton from "@/components/composite/Upload/GalleryPickerButton";
import VideoSourceCard from "@/components/composite/Upload/VideoSourceCard";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet } from "react-native";

export default function CameraScreen() {
  const router = useRouter();

  const handleBackPress = () => {
    router.back();
  };

  const handleCameraPress = () => {
    router.push("/cameraPress" as any);
  };

  const handleGalleryPress = () => {
    router.push("/galleryPress" as any);
  };

  return (
    <ScreenContainer>
      <ScrollScreen>
        <Column style={styles.content}>
          <Banner
            title="Start Analyzing"
            onBackPress={handleBackPress}
          />

          <Subtitle style={styles.subtitle}>
            Record a video of your running form or select one from your gallery to analyze your performance.
          </Subtitle>

          <VideoSourceCard
            title="Choose Video Source"
            description="Select a method to upload your running video for analysis"
          >
            <CameraRecordButton onPress={handleCameraPress} />
            <GalleryPickerButton onPress={handleGalleryPress} />
          </VideoSourceCard>
        </Column>
      </ScrollScreen>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  subtitle: {
    fontSize: 16,
    color: "#64748B",
    lineHeight: 24,
    marginTop: 8,
    marginBottom: 24,
  },
});
