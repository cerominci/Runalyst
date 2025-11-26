import PrimaryButton from "@/components/atomic/Button/PrimaryButton";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back</Text>
      <Text style={styles.subtitle}>Sign in to continue your analysis</Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
      />

      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      <PrimaryButton
        title="Sign In"
        style={styles.button}
        onPress={() => router.replace("/(tabs)")}
      />

      <TouchableOpacity onPress={() => router.push("/signup")}>
        <Text style={styles.link}>
          Don't have an account? <Text style={styles.bold}>Sign Up</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 32, justifyContent: "center" },
  title: { fontSize: 34, fontWeight: "800", color: "#1E293B" },
  subtitle: { fontSize: 15, color: "#64748B", marginBottom: 30 },
  input: {
    padding: 16,
    borderRadius: 14,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 18,
  },
  button: { marginTop: 10, paddingVertical: 16 },
  link: { textAlign: "center", marginTop: 24, color: "#475569", fontSize: 15 },
  bold: { color: "#3B82F6", fontWeight: "700" },
});
