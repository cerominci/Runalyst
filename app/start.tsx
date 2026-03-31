import PrimaryButton from "@/components/atomic/Button/PrimaryButton";
import SecondaryButton from "@/components/atomic/Button/SecondaryButton";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function StartPage() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Background accent circle */}
      <View style={styles.circle} />

      {/* Hero */}
      <View style={styles.hero}>
        <View style={styles.iconWrap}>
          <Ionicons name="walk" size={48} color="#6366F1" />
        </View>
        <Text style={styles.title}>Runalyst</Text>
        <Text style={styles.subtitle}>
          AI-powered gait analysis to help you run smarter and injury-free.
        </Text>
      </View>

      {/* Feature pills */}
      <View style={styles.pills}>
        {["Gait Analysis", "Progress Tracking", "Form Feedback"].map((f) => (
          <View key={f} style={styles.pill}>
            <Ionicons name="checkmark-circle" size={14} color="#6366F1" style={{ marginRight: 6 }} />
            <Text style={styles.pillText}>{f}</Text>
          </View>
        ))}
      </View>

      {/* Buttons */}
      <View style={styles.buttons}>
        <PrimaryButton
          title="Sign In"
          onPress={() => router.push("/signin")}
          style={styles.button}
        />
        <SecondaryButton
          title="Create Account"
          onPress={() => router.push("/signup")}
          style={styles.button}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 28,
    paddingVertical: 48,
    backgroundColor: "#F8FAFC",
    justifyContent: "space-between",
    overflow: "hidden",
  },
  circle: {
    position: "absolute",
    top: -120,
    right: -120,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: "#EEF2FF",
  },
  hero: {
    marginTop: 60,
    alignItems: "center",
  },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: 24,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 42,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -1,
  },
  subtitle: {
    marginTop: 12,
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  pills: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 50,
  },
  pillText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4338CA",
  },
  buttons: {
    gap: 12,
    marginBottom: 16,
  },
  button: {
    width: "100%",
  },
});
