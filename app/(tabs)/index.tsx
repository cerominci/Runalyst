import PrimaryButton from "@/components/atomic/Button/PrimaryButton";
import SecondaryButton from "@/components/atomic/Button/SecondaryButton";
import Column from "@/components/atomic/Layout/Column";
import ScreenContainer from "@/components/atomic/Layout/ScreenContainer";
import Subtitle from "@/components/atomic/Typography/Subtitle";
import Title from "@/components/atomic/Typography/Title";
import HomeMenuButton from "@/components/composite/Home/HomeMenuButton";
import AppTopBar from "@/components/composite/Layout/AppTopBar";
import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";

export default function HomeScreen() {
  const router = useRouter();

  const handleGuidePress = () => {
    router.push("/tips");
  };

  const handleStartAnalyzing = () => {
    router.push("/analysis" as Href);
  };

  const handleAnalysisHistoryPress = () => {
    router.push("/analysis-history" as Href);
  };

  return (
    <ScreenContainer>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Column style={styles.content}>
          <AppTopBar showBackButton={false} />
          {/* Welcome Section */}
          <View style={styles.welcomeSection}>
            <Title style={styles.welcomeTitle}>Hello, welcome back user!</Title>
            <Subtitle style={styles.welcomeSubtitle}>
              Track your running performance and improve your form with
              Runalyst.
            </Subtitle>
          </View>

          {/* Profile Section */}
          <View style={styles.profileSection}>
            <HomeMenuButton
              title="View Analysis"
              description="See your uploaded videos and analysis history"
              icon="person-outline"
              onPress={handleAnalysisHistoryPress}
            />
          </View>

          {/* Spacer to push button to bottom */}
          <View style={styles.spacer} />

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <PrimaryButton
              title="Start Analyzing"
              onPress={handleStartAnalyzing}
              style={styles.primaryButton}
            />
            <SecondaryButton
              title="See Runalyst guide"
              onPress={handleGuidePress}
              style={styles.guideButton}
            />
          </View>
        </Column>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
  },
  welcomeSection: {
    paddingTop: 24,
    paddingHorizontal: 0,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 12,
    lineHeight: 40,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: "#64748B",
    lineHeight: 24,
    marginTop: 8,
  },
  profileSection: {
    paddingTop: 16,
    paddingBottom: 8,
  },
  spacer: {
    flex: 1,
  },
  buttonContainer: {
    paddingBottom: 24,
    paddingTop: 16,
    gap: 12,
  },
  primaryButton: {
    width: "100%",
    paddingVertical: 16,
  },
  guideButton: {
    width: "100%",
    paddingVertical: 16,
  },
});
