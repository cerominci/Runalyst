import PrimaryButton from "@/components/atomic/Button/PrimaryButton";
import LoadingSpinner from "@/components/atomic/Feedback/LoadingSpinner";
import { login } from "@/utils/devAuth";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    // Validation
    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address");
      return;
    }
    
    if (!password.trim()) {
      setError("Please enter your password");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await login(email.trim(), password);
      console.log("Login successful:", result);
      
      // Navigate to main app on success
      router.replace("/(tabs)");
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Failed to sign in. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back</Text>
      <Text style={styles.subtitle}>Sign in to continue your analysis</Text>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          setError(null); // Clear error when user types
        }}
        style={[styles.input, error && styles.inputError]}
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
        editable={!isLoading}
      />

      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          setError(null); // Clear error when user types
        }}
        secureTextEntry
        style={[styles.input, error && styles.inputError]}
        autoComplete="password"
        editable={!isLoading}
      />

      <PrimaryButton
        title={isLoading ? "Signing In..." : "Sign In"}
        style={styles.button}
        onPress={handleSignIn}
        disabled={isLoading}
      />

      {isLoading && (
        <View style={styles.loadingContainer}>
          <LoadingSpinner size="small" />
        </View>
      )}

      <TouchableOpacity onPress={() => router.push("/signup")} disabled={isLoading}>
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
  errorContainer: {
    backgroundColor: "#FEE2E2",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  errorText: {
    color: "#DC2626",
    fontSize: 14,
    textAlign: "center",
  },
  input: {
    padding: 16,
    borderRadius: 14,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 18,
  },
  inputError: {
    borderColor: "#FCA5A5",
    backgroundColor: "#FEF2F2",
  },
  button: { marginTop: 10, paddingVertical: 16 },
  loadingContainer: {
    alignItems: "center",
    marginTop: 16,
  },
  link: { textAlign: "center", marginTop: 24, color: "#475569", fontSize: 15 },
  bold: { color: "#3B82F6", fontWeight: "700" },
});
