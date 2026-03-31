import ScreenContainer from "@/components/atomic/Layout/ScreenContainer";
import ScrollScreen from "@/components/atomic/Layout/ScrollScreen";
import CameraRecordButton from "@/components/composite/Upload/CameraRecordButton";
import GalleryPickerButton from "@/components/composite/Upload/GalleryPickerButton";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function AnalysisScreen() {
  const router = useRouter();

  return (
    <ScreenContainer>
      <ScrollScreen>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.back} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color="#0F172A" />
          </Pressable>
          <Text style={styles.headerTitle}>New Analysis</Text>
        </View>

        {/* Intro */}
        <View style={styles.intro}>
          <Text style={styles.introTitle}>Upload your run video</Text>
          <Text style={styles.introSub}>
            Choose how you'd like to add your running video. For best results, film from the side at waist height.
          </Text>
        </View>

        {/* Tips banner */}
        <View style={styles.tipBanner}>
          <Ionicons name="bulb-outline" size={18} color="#D97706" style={{ marginRight: 10 }} />
          <Text style={styles.tipText}>Tip: Film in good lighting with the full body visible</Text>
        </View>

        {/* Source options */}
        <Text style={styles.sectionLabel}>Choose source</Text>
        <View style={styles.options}>
          <Pressable
            style={styles.optionCard}
            onPress={() => router.push("/recordWithCamera" as any)}
          >
            <View style={[styles.optionIcon, { backgroundColor: "#EEF2FF" }]}>
              <Ionicons name="videocam-outline" size={28} color="#6366F1" />
            </View>
            <Text style={styles.optionTitle}>Record Now</Text>
            <Text style={styles.optionDesc}>Use your camera to record a new run video with live quality checks</Text>
            <View style={styles.optionArrow}>
              <Ionicons name="arrow-forward" size={16} color="#6366F1" />
            </View>
          </Pressable>

          <Pressable
            style={styles.optionCard}
            onPress={() => router.push("/chooseFromGallery" as any)}
          >
            <View style={[styles.optionIcon, { backgroundColor: "#F0FDF4" }]}>
              <Ionicons name="images-outline" size={28} color="#10B981" />
            </View>
            <Text style={styles.optionTitle}>Choose from Gallery</Text>
            <Text style={styles.optionDesc}>Select an existing video from your photo library</Text>
            <View style={styles.optionArrow}>
              <Ionicons name="arrow-forward" size={16} color="#10B981" />
            </View>
          </Pressable>
        </View>

        {/* Hidden original buttons kept for functionality */}
        <View style={{ display: "none" }}>
          <CameraRecordButton onPress={() => router.push("/recordWithCamera" as any)} />
          <GalleryPickerButton onPress={() => router.push("/chooseFromGallery" as any)} />
        </View>

        <View style={{ height: 32 }} />
      </ScrollScreen>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 12,
    marginBottom: 28,
    gap: 12,
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  intro: { marginBottom: 20 },
  introTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  introSub: {
    fontSize: 15,
    color: "#64748B",
    lineHeight: 22,
  },
  tipBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: "#FDE68A",
    borderRadius: 12,
    padding: 12,
    marginBottom: 28,
  },
  tipText: {
    fontSize: 13,
    color: "#92400E",
    fontWeight: "500",
    flex: 1,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#94A3B8",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  options: { gap: 14 },
  optionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    position: "relative",
  },
  optionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  optionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 6,
  },
  optionDesc: {
    fontSize: 14,
    color: "#64748B",
    lineHeight: 20,
  },
  optionArrow: {
    position: "absolute",
    top: 20,
    right: 20,
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
  },
});
