import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function StartPage() {
  const router = useRouter();

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={["#2A1D6E", "#1A1730", "#1A1730"]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Top purple glow */}
      <View style={styles.glowTopLeft} />
      {/* Bottom orange glow */}
      <View style={styles.glowBottomRight} />

      <SafeAreaView style={styles.safe}>
        {/* Brand row */}
        <View style={styles.brandRow}>
          <View style={styles.brandIcon}>
            <Text style={styles.brandIconGlyph}>⚡</Text>
          </View>
          <Text style={styles.brandName}>Runalyst</Text>
        </View>

        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroLine1}>Run</Text>
          <Text style={styles.heroLine1}>smarter,</Text>
          <Text style={[styles.heroLine1, styles.heroAccent]}>not harder.</Text>
          <Text style={styles.heroSub}>
            AI gait analysis from a single phone video. Form feedback in under a minute.
          </Text>
        </View>

        {/* Buttons */}
        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.btnPrimary}
            onPress={() => router.push("/signin")}
            activeOpacity={0.85}
          >
            <Text style={styles.btnPrimaryText}>Sign in with email</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnSecondary}
            onPress={() => router.push("/signup")}
            activeOpacity={0.85}
          >
            <Text style={styles.btnSecondaryText}>Create account</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#1A1730",
  },
  safe: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 12,
    paddingBottom: 32,
  },
  glowTopLeft: {
    position: "absolute",
    top: -100,
    left: -80,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: "#6E5BD4",
    opacity: 0.35,
  },
  glowBottomRight: {
    position: "absolute",
    bottom: -140,
    right: -100,
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: "#FF8A4C",
    opacity: 0.22,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 56,
    marginTop: 12,
  },
  brandIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#6347C7",
    alignItems: "center",
    justifyContent: "center",
  },
  brandIconGlyph: {
    fontSize: 20,
    color: "#fff",
  },
  brandName: {
    fontWeight: "800",
    fontSize: 22,
    color: "#fff",
    letterSpacing: -0.4,
  },
  hero: {
    flex: 1,
    justifyContent: "center",
  },
  heroLine1: {
    fontWeight: "800",
    fontSize: 48,
    color: "#fff",
    lineHeight: 54,
    letterSpacing: -1.5,
  },
  heroAccent: {
    color: "#FF8A4C",
    marginBottom: 20,
  },
  heroSub: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 300,
    fontWeight: "400",
  },
  buttons: {
    gap: 12,
  },
  btnPrimary: {
    backgroundColor: "#fff",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  btnPrimaryText: {
    color: "#1A1730",
    fontWeight: "700",
    fontSize: 16,
  },
  btnSecondary: {
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  btnSecondaryText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
