import PrimaryButton from "@/components/atomic/Button/PrimaryButton";
import { login, loginWithApple, register } from "@/utils/devAuth";
import { Ionicons } from "@expo/vector-icons";
import * as AppleAuthentication from "expo-apple-authentication";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAppleSignUp = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      if (!credential.identityToken) throw new Error("Apple Sign-In did not return an identity token.");
      await loginWithApple(credential.identityToken);
      router.replace("/(tabs)");
    } catch (err: any) {
      setError(err?.message ?? "Apple Sign-Up failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!email.trim()) { setError("Please enter your email"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError("Please enter a valid email"); return; }
    if (!password.trim()) { setError("Please enter your password"); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setIsLoading(true);
    setError(null);
    try {
      await register(email.trim(), password);
      await login(email.trim(), password);
      router.replace("/(tabs)");
    } catch (err: any) {
      setError(err.message || "Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      {/* Back */}
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={22} color="#0F172A" />
      </TouchableOpacity>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Create account</Text>
        <Text style={styles.subtitle}>Join thousands of runners improving their form.</Text>
      </View>

      {/* Error */}
      {error && (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle-outline" size={16} color="#DC2626" style={{ marginRight: 8 }} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Email */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          placeholder="you@example.com"
          placeholderTextColor="#94A3B8"
          value={email}
          onChangeText={(t) => { setEmail(t); setError(null); }}
          style={[styles.input, error ? styles.inputError : null]}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          editable={!isLoading}
        />
      </View>

      {/* Password */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Password</Text>
        <View style={styles.passwordRow}>
          <TextInput
            placeholder="Min. 6 characters"
            placeholderTextColor="#94A3B8"
            value={password}
            onChangeText={(t) => { setPassword(t); setError(null); }}
            secureTextEntry={!showPassword}
            style={[styles.input, styles.passwordInput, error ? styles.inputError : null]}
            autoComplete="password-new"
            editable={!isLoading}
          />
          <Pressable style={styles.eyeBtn} onPress={() => setShowPassword((v) => !v)}>
            <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#94A3B8" />
          </Pressable>
        </View>
      </View>

      <Text style={styles.terms}>
        By signing up, you agree to our{" "}
        <Text style={styles.link}>Terms</Text> &{" "}
        <Text style={styles.link}>Privacy Policy</Text>.
      </Text>

      {/* Button */}
      {isLoading ? (
        <View style={styles.loadingBtn}>
          <ActivityIndicator color="#fff" />
        </View>
      ) : (
        <PrimaryButton title="Create Account" onPress={handleSignUp} style={styles.mainBtn} />
      )}

      {Platform.OS === "ios" && (
        <PrimaryButton
          title="Continue with Apple"
          onPress={handleAppleSignUp}
          disabled={isLoading}
          style={styles.appleBtn}
        />
      )}

      <TouchableOpacity onPress={() => router.push("/signin")} disabled={isLoading} style={styles.footer}>
        <Text style={styles.footerText}>
          Already have an account? <Text style={styles.footerLink}>Sign In</Text>
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 28,
    paddingTop: 64,
    paddingBottom: 48,
    backgroundColor: "#F8FAFC",
    flexGrow: 1,
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },
  header: { marginBottom: 32 },
  title: {
    fontSize: 34,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.5,
  },
  subtitle: { fontSize: 15, color: "#64748B", marginTop: 6 },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  errorText: { color: "#DC2626", fontSize: 14, flex: 1 },
  inputGroup: { marginBottom: 20 },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#0F172A",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
  },
  inputError: { borderColor: "#FCA5A5", backgroundColor: "#FEF2F2" },
  passwordRow: { position: "relative" },
  passwordInput: { paddingRight: 50 },
  eyeBtn: {
    position: "absolute",
    right: 14,
    top: 0,
    bottom: 0,
    justifyContent: "center",
  },
  terms: {
    fontSize: 13,
    color: "#94A3B8",
    lineHeight: 20,
    marginBottom: 24,
  },
  link: { color: "#6366F1", fontWeight: "600" },
  mainBtn: {},
  loadingBtn: {
    backgroundColor: "#6366F1",
    borderRadius: 50,
    paddingVertical: 16,
    alignItems: "center",
  },
  appleBtn: { marginTop: 12, backgroundColor: "#0F172A" },
  footer: { marginTop: 32, alignItems: "center" },
  footerText: { fontSize: 15, color: "#64748B" },
  footerLink: { color: "#6366F1", fontWeight: "700" },
});
