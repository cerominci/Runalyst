import PrimaryButton from "@/components/atomic/Button/PrimaryButton";
import LoadingSpinner from "@/components/atomic/Feedback/LoadingSpinner";
import { sendVerificationEmail, verifyEmail } from "@/utils/endpoints";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const CODE_LENGTH = 6;

export default function VerifyEmailPage() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  const handleVerify = async () => {
    if (code.length !== CODE_LENGTH) {
      setError("Please enter the full 6-digit code.");
      return;
    }
    setIsVerifying(true);
    setError(null);
    try {
      await verifyEmail(email, code);
      router.replace("/profile");
    } catch (err: any) {
      setError(err?.message ?? "Verification failed. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setError(null);
    try {
      await sendVerificationEmail(email);
      setResendCooldown(60);
      setCode("");
    } catch (err: any) {
      setError(err?.message ?? "Failed to resend code.");
    } finally {
      setIsResending(false);
    }
  };

  const handleCodeChange = (text: string) => {
    const digits = text.replace(/\D/g, "").slice(0, CODE_LENGTH);
    setCode(digits);
    setError(null);
  };

  const displayBoxes = Array.from({ length: CODE_LENGTH }, (_, i) => code[i] ?? "");

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backRow}>
        <Text style={styles.back}>←</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Check your email</Text>
      <Text style={styles.subtitle}>
        We sent a 6-digit code to{"\n"}
        <Text style={styles.emailText}>{email}</Text>
      </Text>

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Hidden input drives the boxes */}
      <TextInput
        ref={inputRef}
        value={code}
        onChangeText={handleCodeChange}
        keyboardType="number-pad"
        maxLength={CODE_LENGTH}
        style={styles.hiddenInput}
        autoFocus
        caretHidden
      />

      {/* Visual code boxes */}
      <TouchableOpacity
        style={styles.boxRow}
        onPress={() => inputRef.current?.focus()}
        activeOpacity={1}
      >
        {displayBoxes.map((digit, i) => (
          <View
            key={i}
            style={[
              styles.box,
              code.length === i && styles.boxActive,
              digit !== "" && styles.boxFilled,
            ]}
          >
            <Text style={styles.boxDigit}>{digit}</Text>
          </View>
        ))}
      </TouchableOpacity>

      <PrimaryButton
        title={isVerifying ? "Verifying…" : "Verify Email"}
        onPress={handleVerify}
        disabled={isVerifying || code.length !== CODE_LENGTH}
        style={styles.button}
      />

      <View style={styles.resendRow}>
        <Text style={styles.resendLabel}>Didn't receive it? </Text>
        {resendCooldown > 0 ? (
          <Text style={styles.cooldown}>Resend in {resendCooldown}s</Text>
        ) : (
          <TouchableOpacity onPress={handleResend} disabled={isResending}>
            <Text style={styles.resendLink}>
              {isResending ? "Sending…" : "Resend code"}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {(isVerifying || isResending) && (
        <View style={styles.spinner}>
          <LoadingSpinner size="small" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 28, paddingTop: 64 },
  backRow: { marginBottom: 28 },
  back: { fontSize: 30, color: "#1E293B" },
  title: { fontSize: 30, fontWeight: "800", color: "#1E293B", marginBottom: 10 },
  subtitle: { fontSize: 15, color: "#64748B", lineHeight: 22, marginBottom: 28 },
  emailText: { color: "#2563EB", fontWeight: "700" },
  errorBox: {
    backgroundColor: "#FEE2E2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
  },
  errorText: { color: "#DC2626", fontSize: 14, textAlign: "center" },
  hiddenInput: {
    position: "absolute",
    opacity: 0,
    width: 0,
    height: 0,
  },
  boxRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginBottom: 32,
  },
  box: {
    width: 48,
    height: 58,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
  },
  boxActive: {
    borderColor: "#2563EB",
    backgroundColor: "#EFF6FF",
  },
  boxFilled: {
    borderColor: "#2563EB",
  },
  boxDigit: { fontSize: 24, fontWeight: "700", color: "#1E293B" },
  button: { marginBottom: 20 },
  resendRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  resendLabel: { fontSize: 14, color: "#64748B" },
  resendLink: { fontSize: 14, color: "#2563EB", fontWeight: "700" },
  cooldown: { fontSize: 14, color: "#94A3B8" },
  spinner: { alignItems: "center", marginTop: 16 },
});
