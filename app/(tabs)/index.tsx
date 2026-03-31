import PrimaryButton from "@/components/atomic/Button/PrimaryButton";
import SecondaryButton from "@/components/atomic/Button/SecondaryButton";
import ScreenContainer from "@/components/atomic/Layout/ScreenContainer";
import ScrollScreen from "@/components/atomic/Layout/ScrollScreen";
import { Ionicons } from "@expo/vector-icons";
import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

const FEATURES = [
  { icon: "videocam-outline" as const,    label: "Upload Video",    desc: "Record or import your run"     },
  { icon: "analytics-outline" as const,   label: "AI Analysis",     desc: "Detect gait patterns instantly" },
  { icon: "trending-up-outline" as const, label: "Track Progress",  desc: "See your improvement over time" },
];

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ScreenContainer>
      <ScrollScreen contentContainerStyle={styles.scroll}>

        {/* Top greeting */}
        <View style={styles.greeting}>
          <Text style={styles.greetingLabel}>Good day 👋</Text>
          <Text style={styles.greetingTitle}>Ready to run{"\n"}smarter today?</Text>
        </View>

        {/* Hero card */}
        <View style={styles.heroCard}>
          <View style={styles.heroIconWrap}>
            <Ionicons name="walk" size={36} color="#6366F1" />
          </View>
          <Text style={styles.heroCardTitle}>Start a new analysis</Text>
          <Text style={styles.heroCardSub}>
            Upload a running video and get instant AI feedback on your gait.
          </Text>
          <PrimaryButton
            title="Analyze My Run"
            onPress={() => router.push("/analysis" as Href)}
            style={styles.heroBtn}
          />
        </View>

        {/* Features */}
        <Text style={styles.sectionTitle}>How it works</Text>
        <View style={styles.featureList}>
          {FEATURES.map((f, i) => (
            <View key={f.label} style={styles.featureRow}>
              <View style={styles.featureStep}>
                <Text style={styles.featureStepNum}>{i + 1}</Text>
              </View>
              <View style={styles.featureIconWrap}>
                <Ionicons name={f.icon} size={22} color="#6366F1" />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureLabel}>{f.label}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Guide button */}
        <SecondaryButton
          title="View Running Guide"
          onPress={() => router.push("/tips")}
          style={styles.guideBtn}
        />

        <View style={{ height: 32 }} />
      </ScrollScreen>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1 },

  greeting: {
    paddingTop: 16,
    marginBottom: 24,
  },
  greetingLabel: {
    fontSize: 14,
    color: "#94A3B8",
    fontWeight: "500",
    marginBottom: 4,
  },
  greetingTitle: {
    fontSize: 30,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.5,
    lineHeight: 38,
  },

  heroCard: {
    backgroundColor: "#EEF2FF",
    borderRadius: 24,
    padding: 24,
    marginBottom: 32,
  },
  heroIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  heroCardTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 8,
  },
  heroCardSub: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 20,
    marginBottom: 20,
  },
  heroBtn: { alignSelf: "flex-start", paddingHorizontal: 24 },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 16,
  },
  featureList: {
    gap: 12,
    marginBottom: 32,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  featureStep: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#6366F1",
    alignItems: "center",
    justifyContent: "center",
  },
  featureStepNum: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  featureIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
  },
  featureText: { flex: 1 },
  featureLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 13,
    color: "#64748B",
  },

  guideBtn: {},
});
