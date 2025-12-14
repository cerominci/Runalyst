import PrimaryButton from "@/components/atomic/Button/PrimaryButton";
import SecondaryButton from "@/components/atomic/Button/SecondaryButton";
import Column from "@/components/atomic/Layout/Column";
import ScreenContainer from "@/components/atomic/Layout/ScreenContainer";
import ScrollScreen from "@/components/atomic/Layout/ScrollScreen";
import Subtitle from "@/components/atomic/Typography/Subtitle";
import Title from "@/components/atomic/Typography/Title";
import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";

export default function HomeScreen() {
const router = useRouter();

  const handleGuidePress = () => {
    router.push("/tips");
  };

  const handleStartAnalyzing = () => {
    router.push("/camera" as Href);
  };

  return (
    <ScreenContainer>
      <ScrollScreen contentContainerStyle={styles.contentContainer}>
        <Column style={styles.content}>
          {/* Welcome Section */}
          <View style={styles.welcomeSection}>
            <Title style={styles.welcomeTitle}>Hello, welcome back user!</Title>
            <Subtitle style={styles.welcomeSubtitle}>
              Track your running performance and improve your form with Runalyst.
            </Subtitle>
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
      </ScrollScreen>
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

