import PrimaryButton from "@/components/atomic/Button/PrimaryButton";
import { useRouter } from "expo-router";
import { Image, StyleSheet, Text, View } from "react-native";

export default function StartPage() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Hero Section */}
      <View style={styles.hero}>
        <Image
          source={require("@/assets/images/undraw_fitness-stats_uk0g.svg")}
          style={styles.heroImage}
          resizeMode="contain"
        />

        <Text style={styles.title}>Runalyst</Text>
        <Text style={styles.subtitle}>
          Analyze your running gait and improve your performance!
        </Text>
      </View>

      {/* Buttons */}
      <View style={styles.buttons}>
        <PrimaryButton
          title="Sign In"
          onPress={() => router.push("/signin")}
          style={styles.button}
        />

        <PrimaryButton
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
    paddingHorizontal: 32,
    paddingVertical: 40,
    backgroundColor: "#FFFFFF", // SAME as SignUp & SignIn
    justifyContent: "space-between",
  },

  hero: {
    marginTop: 40,
    alignItems: "center",
  },

  heroImage: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },

  title: {
    fontSize: 38,
    fontWeight: "800",
    color: "#1E293B", // dark slate — consistent with SignUp/SignIn titles
  },

  subtitle: {
    marginTop: 10,
    fontSize: 16,
    color: "#64748B", // same subtitle color as SignUp page
    textAlign: "center",
    width: "80%",
  },

  buttons: {
    marginBottom: 80,
  },

  button: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 14,
    marginBottom: 16,
  },

  secondaryButton: {
    backgroundColor: "#4ADE80", // green accent you used
  },
});
