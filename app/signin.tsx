import GoogleButton from "@/components/atomic/Button/GoogleButton";
import LoadingSpinner from "@/components/atomic/Feedback/LoadingSpinner";
import { login, loginWithApple, loginWithGoogle } from "@/utils/endpoints";
import * as AppleAuthentication from "expo-apple-authentication";
import * as Google from "expo-auth-session/providers/google";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

WebBrowser.maybeCompleteAuthSession();

export default function SignInPage() {
  const router = useRouter();
  const POST_LOGIN_ROUTE = "/(tabs)" as const;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [, googleResponse, googlePromptAsync] = Google.useAuthRequest({
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  });

  useEffect(() => {
    (async () => {
      if (!googleResponse) return;
      if (googleResponse.type === "success") {
        const idToken = googleResponse.authentication?.idToken;
        if (!idToken) { setError("Google Sign-In did not return an ID token."); setIsLoading(false); return; }
        try { await loginWithGoogle(idToken); router.replace(POST_LOGIN_ROUTE); }
        catch (err: any) { setError(err?.message ?? "Google Sign-In failed."); }
        finally { setIsLoading(false); }
      } else if (googleResponse.type === "dismiss" || googleResponse.type === "cancel") {
        setIsLoading(false);
      } else if (googleResponse.type === "error") {
        setError("Google Sign-In failed."); setIsLoading(false);
      }
    })();
  }, [googleResponse]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true); setError(null);
    try { await googlePromptAsync(); }
    catch (err: any) { setError(err?.message ?? "Google Sign-In failed."); setIsLoading(false); }
  };

  const handleAppleSignIn = async () => {
    setIsLoading(true); setError(null);
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      if (!credential.identityToken) throw new Error("Apple Sign-In did not return an identity token.");
      await loginWithApple({
        identityToken: credential.identityToken,
        authorizationCode: credential.authorizationCode ?? undefined,
        email: credential.email ?? undefined,
        firstName: credential.fullName?.givenName ?? undefined,
        lastName: credential.fullName?.familyName ?? undefined,
        appleUser: credential.user,
      });
      router.replace(POST_LOGIN_ROUTE);
    } catch (err: any) {
      if (err?.code === "ERR_REQUEST_CANCELED") { setError(null); return; }
      setError(err?.message ?? "Apple Sign-In failed.");
    } finally { setIsLoading(false); }
  };

  const handleSignIn = async () => {
    if (!email.trim()) { setError("Please enter your email"); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) { setError("Please enter a valid email address"); return; }
    if (!password.trim()) { setError("Please enter your password"); return; }
    setIsLoading(true); setError(null);
    try { await login(email.trim(), password); router.replace(POST_LOGIN_ROUTE); }
    catch (err: any) { setError(err.message || "Failed to sign in. Please check your credentials."); }
    finally { setIsLoading(false); }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* Back */}
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} disabled={isLoading}>
            <Text style={styles.backChev}>‹</Text>
          </TouchableOpacity>

          {/* Heading */}
          <View style={styles.heading}>
            <Text style={styles.headTitle}>
              Hey runner —{"\n"}<Text style={styles.headAccent}>good to see you.</Text>
            </Text>
            <Text style={styles.headSub}>Sign in to pick up where you left off.</Text>
          </View>

          {/* Error */}
          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Fields */}
          <Field label="Email" value={email} onChangeText={(t) => { setEmail(t); setError(null); }}
            placeholder="you@runalyst.app" keyboardType="email-address" autoCapitalize="none"
            autoComplete="email" editable={!isLoading} hasError={!!error} />

          <View style={styles.passWrapper}>
            <Field label="Password" value={password} onChangeText={(t) => { setPassword(t); setError(null); }}
              placeholder="••••••••" secureTextEntry={!showPass} autoComplete="password"
              editable={!isLoading} hasError={!!error} />
            <TouchableOpacity style={styles.showBtn} onPress={() => setShowPass((v) => !v)}>
              <Text style={styles.showText}>{showPass ? "HIDE" : "SHOW"}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.forgotRow}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          {/* Primary CTA */}
          <TouchableOpacity
            style={[styles.primaryBtn, isLoading && styles.primaryBtnDisabled]}
            onPress={handleSignIn}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? <LoadingSpinner size="small" /> : <Text style={styles.primaryBtnText}>Sign in →</Text>}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.divLine} />
            <Text style={styles.divText}>OR</Text>
            <View style={styles.divLine} />
          </View>

          {Platform.OS === "ios" && (
            <TouchableOpacity style={styles.oauthBtn} onPress={handleAppleSignIn} disabled={isLoading} activeOpacity={0.8}>
              <Text style={styles.oauthBtnText}>Continue with Apple</Text>
            </TouchableOpacity>
          )}
          <GoogleButton onPress={handleGoogleSignIn} style={styles.googleBtn} />

          {/* Switch to signup */}
          <TouchableOpacity style={styles.switchRow} onPress={() => router.push("/signup")} disabled={isLoading}>
            <Text style={styles.switchText}>
              New to Runalyst?{" "}
              <Text style={styles.switchLink}>Create account</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({ label, hasError, ...props }: { label: string; hasError?: boolean; [k: string]: any }) {
  return (
    <View style={fieldStyles.wrapper}>
      <Text style={fieldStyles.label}>{label}</Text>
      <TextInput
        style={[fieldStyles.input, hasError && fieldStyles.inputError]}
        placeholderTextColor="#94A3B8"
        {...props}
      />
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  wrapper: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: "600", color: "#334155", marginBottom: 8 },
  input: {
    backgroundColor: "#F1F5F9",
    borderRadius: 14,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    color: "#0F172A",
  },
  inputError: { borderColor: "#EDE9FB", backgroundColor: "#F5F2FF" },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F5F3FF" },
  flex: { flex: 1 },
  scroll: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 48 },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#EDE9FB",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
  },
  backChev: { fontSize: 26, color: "#6347C7", lineHeight: 32, marginTop: -2 },
  heading: { marginBottom: 28 },
  headTitle: { fontSize: 30, fontWeight: "800", color: "#0F172A", lineHeight: 38, letterSpacing: -0.6 },
  headAccent: { color: "#6347C7" },
  headSub: { fontSize: 15, color: "#64748B", marginTop: 8 },
  errorBox: {
    backgroundColor: "#F5F2FF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#EDE9FB",
  },
  errorText: { color: "#4929B3", fontSize: 14, textAlign: "center" },
  passWrapper: { position: "relative" },
  showBtn: { position: "absolute", right: 14, bottom: 34 },
  showText: { fontSize: 11, fontWeight: "700", color: "#64748B", letterSpacing: 0.5 },
  forgotRow: { alignItems: "flex-end", marginTop: -12, marginBottom: 24 },
  forgotText: { color: "#6347C7", fontSize: 13, fontWeight: "600" },
  primaryBtn: {
    backgroundColor: "#6347C7",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 24,
  },
  primaryBtnDisabled: { backgroundColor: "#B5A8E8" },
  primaryBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  divider: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 20 },
  divLine: { flex: 1, height: 1, backgroundColor: "#E2E8F0" },
  divText: { fontSize: 12, fontWeight: "700", color: "#94A3B8", letterSpacing: 0.8 },
  oauthBtn: {
    backgroundColor: "#EDE9FB",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#D8D1F5",
  },
  oauthBtnText: { color: "#4929B3", fontWeight: "700", fontSize: 15 },
  googleBtn: { marginBottom: 12 },
  switchRow: { alignItems: "center", marginTop: 16 },
  switchText: { fontSize: 15, color: "#64748B" },
  switchLink: { color: "#6347C7", fontWeight: "700" },
});
