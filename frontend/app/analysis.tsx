import AppTopBar from "@/components/composite/Layout/AppTopBar";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CameraScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <AppTopBar title="New Analysis" sub="Choose how to capture your run" back />

        {/* Camera option */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => router.push("/recordWithCamera" as any)}
          style={styles.cameraCardWrap}
        >
          <LinearGradient
            colors={["#6347C7", "#4929B3"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cameraCard}
          >
            <View style={styles.cardGlow} />
            <View style={styles.cardIconWrap}>
              <Ionicons name="videocam" size={28} color="#fff" />
            </View>
            <Text style={styles.cameraCardTitle}>Record video</Text>
            <Text style={styles.cameraCardSub}>
              Film yourself running from the side. 5–15 seconds is ideal.
            </Text>
            <View style={styles.cameraCardBadge}>
              <Text style={styles.cameraCardBadgeText}>RECOMMENDED</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Gallery option */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => router.push("/chooseFromGallery" as any)}
          style={styles.galleryCard}
        >
          <View style={[styles.cardIconWrap, styles.galleryIconWrap]}>
            <Ionicons name="images-outline" size={26} color="#6347C7" />
          </View>
          <View style={styles.galleryText}>
            <Text style={styles.galleryTitle}>From gallery</Text>
            <Text style={styles.gallerySub}>
              Pick an existing clip from your photo library.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
        </TouchableOpacity>

        {/* Tips card */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsHeader}>Tips for best results</Text>
          {[
            { icon: "phone-portrait-outline", text: "Mount your phone at hip height, side-on" },
            { icon: "timer-outline", text: "Record 5–15 seconds on level ground" },
            { icon: "sunny-outline", text: "Good lighting, avoid strong backlight" },
          ].map((tip) => (
            <View key={tip.text} style={styles.tipRow}>
              <View style={styles.tipDot}>
                <Ionicons name={tip.icon as any} size={14} color="#6347C7" />
              </View>
              <Text style={styles.tipText}>{tip.text}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F5F3FF" },
  scroll: { paddingHorizontal: 16, paddingBottom: 40 },

  cameraCardWrap: { marginBottom: 14 },
  cameraCard: {
    borderRadius: 24,
    padding: 24,
    overflow: "hidden",
    position: "relative",
    minHeight: 180,
    justifyContent: "flex-end",
  },
  cardGlow: {
    position: "absolute",
    right: -30,
    top: -30,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "#FF8A4C",
    opacity: 0.3,
  },
  cardIconWrap: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  cameraCardTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  cameraCardSub: {
    fontSize: 14,
    color: "rgba(255,255,255,0.75)",
    lineHeight: 20,
    marginBottom: 14,
  },
  cameraCardBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#FF8A4C",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  cameraCardBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 0.6,
  },

  galleryCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 20,
    shadowColor: "#6347C7",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  galleryIconWrap: {
    backgroundColor: "#EDE9FB",
    flexShrink: 0,
  },
  galleryText: { flex: 1 },
  galleryTitle: { fontSize: 16, fontWeight: "700", color: "#0F172A" },
  gallerySub: { fontSize: 13, color: "#64748B", marginTop: 2 },

  tipsCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  tipsHeader: {
    fontSize: 13,
    fontWeight: "700",
    color: "#64748B",
    letterSpacing: 0.5,
    marginBottom: 12,
    textTransform: "uppercase",
  },
  tipRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 10 },
  tipDot: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: "#EDE9FB",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  tipText: { fontSize: 13, color: "#334155", flex: 1, lineHeight: 18 },
});
