import PrimaryButton from "@/components/atomic/Button/PrimaryButton";
import LoadingSpinner from "@/components/atomic/Feedback/LoadingSpinner";
import { login, register } from "@/utils/devAuth";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = async () => {
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
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Register the user
      const registerResult = await register(email.trim(), password);
      console.log("Registration successful:", registerResult);
      
      // Automatically login after successful registration
      const loginResult = await login(email.trim(), password);
      console.log("Auto-login successful:", loginResult);
      
      // Navigate to main app on success
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
  loadingContainer: {
    alignItems: "center",
    marginTop: 16,
  },
  bottomLink: { marginTop: 30, alignItems: "center" },
  bottomLinkText: { fontSize: 15, color: "#475569" },
  bold: { color: "#3B82F6", fontWeight: "800" },
});
