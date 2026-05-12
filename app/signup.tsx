import GoogleButton from "@/components/atomic/Button/GoogleButton";
import PrimaryButton from "@/components/atomic/Button/PrimaryButton";
import LoadingSpinner from "@/components/atomic/Feedback/LoadingSpinner";
import { loginWithApple, loginWithGoogle, register } from "@/utils/endpoints";
import { LICENSE_AGREEMENT_TEXT } from "@/constants/licenseAgreement";
import * as AppleAuthentication from "expo-apple-authentication";
import * as Google from "expo-auth-session/providers/google";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

WebBrowser.maybeCompleteAuthSession();

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLicenseModal, setShowLicenseModal] = useState(false);


  const [googleRequest, googleResponse, googlePromptAsync] = Google.useAuthRequest({
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  });

  useEffect(() => {
    (async () => {
      if (!googleResponse) return;
      if (googleResponse.type === "success") {
        const idToken = googleResponse.authentication?.idToken;
        if (!idToken) {
          setError("Google Sign-Up did not return an ID token.");
          setIsLoading(false);
          return;
        }
        try {
          await loginWithGoogle(idToken);
          router.replace("/profile");
        } catch (err: any) {
          setError(err?.message ?? "Google Sign-Up failed.");
        } finally {
          setIsLoading(false);
        }
      } else if (googleResponse.type === "dismiss" || googleResponse.type === "cancel") {
        setIsLoading(false);
      } else if (googleResponse.type === "error") {
        setError("Google Sign-Up failed.");
        setIsLoading(false);
      }
    })();
  }, [googleResponse]);

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await googlePromptAsync();
    } catch (err: any) {
      setError(err?.message ?? "Google Sign-Up failed.");
      setIsLoading(false);
    }
  };

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

      if (!credential.identityToken) {
        throw new Error("Apple Sign-In did not return an identity token.");
      }

      await loginWithApple(credential.identityToken);

      router.replace("/profile");
    } catch (err: any) {
      setError(err?.message ?? "Apple Sign-Up failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = () => {
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
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setShowLicenseModal(true);
  };

  const confirmSignUp = async () => {
    setShowLicenseModal(false);
    setIsLoading(true);
    setError(null);

    try {
      await register(email.trim(), password);
      router.replace("/(tabs)");
    } catch (err: any) {
      console.error("Signup error:", err);
      setError(err.message || "Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} disabled={isLoading}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>
          Join thousands of runners improving their form.
        </Text>
      </View>

      {/* FORM */}
      <View style={styles.form}>
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <Input
          label="Email"
          value={email}
          setValue={(text) => {
            setEmail(text);
            setError(null);
          }}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          editable={!isLoading}
          error={!!error}
        />
        <Input
          label="Password"
          value={password}
          setValue={(text) => {
            setPassword(text);
            setError(null);
          }}
          secureTextEntry
          autoComplete="password-new"
          editable={!isLoading}
          error={!!error}
        />

        <Text style={styles.terms}>
          By signing up, you agree to our{" "}
          <Text style={styles.link}>Terms</Text> &{" "}
          <Text style={styles.link}>Privacy Policy</Text>.
        </Text>

        <PrimaryButton
          title={isLoading ? "Creating Account..." : "Create Account"}
          style={styles.signUpButton}
          onPress={handleSignUp}
          disabled={isLoading}
        />
        {Platform.OS === "ios" && (
          <PrimaryButton
            title="Continue with Apple"
            style={styles.appleButton}
            onPress={handleAppleSignUp}
            disabled={isLoading}
          />
        )}

        <Modal
  visible={showLicenseModal}
  transparent
  animationType="fade"
  onRequestClose={() => setShowLicenseModal(false)}
>
  <View style={styles.modalBackdrop}>
    <Pressable
      style={StyleSheet.absoluteFill}
      onPress={() => setShowLicenseModal(false)}
    />

    <View style={styles.modalCard}>
      <Text style={styles.modalTitle}>License Agreement</Text>

      <ScrollView
        style={styles.modalContent}
        contentContainerStyle={styles.modalContentContainer}
        showsVerticalScrollIndicator={true}
        nestedScrollEnabled={true}
      >
        <Text style={styles.modalText}>{LICENSE_AGREEMENT_TEXT}</Text>
      </ScrollView>

      <View style={styles.modalActions}>
        <TouchableOpacity
          style={[styles.modalButton, styles.modalDeclineButton]}
          onPress={() => setShowLicenseModal(false)}
          disabled={isLoading}
        >
          <Text style={styles.modalDeclineText}>Decline</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modalButton, styles.modalAgreeButton]}
          onPress={confirmSignUp}
          disabled={isLoading}
        >
          <Text style={styles.modalAgreeText}>Agree & Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>
        <GoogleButton
          onPress={handleGoogleSignUp}
          style={styles.googleButton}
        />

        {isLoading && (
          <View style={styles.loadingContainer}>
            <LoadingSpinner size="small" />
          </View>
        )}

        <TouchableOpacity
          onPress={() => router.push("/signin")}
          style={styles.bottomLink}
          disabled={isLoading}
        >
          <Text style={styles.bottomLinkText}>
            Already have an account? <Text style={styles.bold}>Sign In</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// ---- Custom Input Component ----
interface InputProps {
  label: string;
  value: string;
  setValue: (value: string) => void;
  error?: boolean;
  [key: string]: any; // for any additional props
}

function Input({ label, value, setValue, error, ...props }: InputProps) {
  return (
    <View style={styles.inputWrapper}>
      <Text style={styles.label}>{label}</Text>

      <TextInput
        value={value}
        onChangeText={setValue}
        style={[styles.input, error && styles.inputError]}
        placeholderTextColor="#9CA3AF"
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 24, paddingTop: 70, paddingBottom: 50 },
  header: { marginBottom: 40 },
  back: { fontSize: 30, color: "#1E293B", marginBottom: 12 },
  title: { fontSize: 32, fontWeight: "800", color: "#1E293B" },
  subtitle: { fontSize: 15, color: "#64748B", marginTop: 8 },
  form: { marginTop: 10 },
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
  inputWrapper: { marginBottom: 24 },
  label: { marginBottom: 8, fontSize: 14, fontWeight: "600", color: "#334155" },
  input: {
    backgroundColor: "#F1F5F9",
    borderRadius: 14,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  inputError: {
    borderColor: "#FCA5A5",
    backgroundColor: "#FEF2F2",
  },
  terms: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
  link: { color: "#3B82F6", fontWeight: "700" },
  signUpButton: { marginTop: 24 },
  appleButton: { marginTop: 12 },
  googleButton: { marginTop: 12 },
  loadingContainer: {
    alignItems: "center",
    marginTop: 16,
  },
  modalBackdrop: {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.45)",
  alignItems: "center",
  justifyContent: "center",
  padding: 20,
},

modalCard: {
  width: "100%",
  maxWidth: 420,
  maxHeight: "80%",
  borderRadius: 18,
  backgroundColor: "#FFFFFF",
  padding: 20,
},

modalContent: {
  height: 280,
  marginBottom: 20,
},

modalContentContainer: {
  paddingBottom: 16,
},
modalTitle: {
  fontSize: 20,
  fontWeight: "800",
  color: "#0F172A",
  marginBottom: 12,
},
modalText: {
  fontSize: 14,
  color: "#334155",
  lineHeight: 22,
},
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  modalDeclineButton: {
    backgroundColor: "#E2E8F0",
  },
  modalAgreeButton: {
    backgroundColor: "#2563EB",
  },
  modalDeclineText: {
    color: "#334155",
    fontWeight: "700",
  },
  modalAgreeText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  bottomLink: { marginTop: 30, alignItems: "center" },
  bottomLinkText: { fontSize: 15, color: "#475569" },
  bold: { color: "#3B82F6", fontWeight: "800" },
});
