import AppTopBar from "@/components/composite/Layout/AppTopBar";
import { Profile } from "@/constants/types";
import {
  deleteCurrentUser,
  getAllRuns,
  getCurrentUser,
  getMyProfile,
  logout,
  updateCurrentUser,
} from "@/utils/endpoints";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useIsFocused } from "@react-navigation/native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AccountScreen() {
  const router = useRouter();
  const isFocused = useIsFocused();
  const isFirstLoadRef = useRef(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [email, setEmail] = useState<string>("");
  const [authProvider, setAuthProvider] = useState<string>("local");
  const [runCount, setRunCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Change password modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const fetchData = useCallback(async () => {
    if (isFirstLoadRef.current) setLoading(true);
    try {
      const [user, profileData, runs] = await Promise.all([
        getCurrentUser(),
        getMyProfile(),
        getAllRuns(),
      ]);
      setEmail(user?.email ?? "");
      setAuthProvider(user?.auth_provider ?? "local");
      setProfile(profileData);
      setRunCount(runs.length);
    } catch {
      // show empty state
    } finally {
      setLoading(false);
      isFirstLoadRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (isFocused) fetchData();
  }, [isFocused, fetchData]);

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/start");
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This will permanently delete your account and all your runs. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteCurrentUser();
              router.replace("/start");
            } catch {
              Alert.alert("Error", "Failed to delete account. Please try again.");
            }
          },
        },
      ],
    );
  };

  const handleChangePassword = async () => {
    setPasswordError(null);
    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }
    setPasswordLoading(true);
    try {
      await updateCurrentUser({ password: newPassword });
      setShowPasswordModal(false);
      setNewPassword("");
      setConfirmPassword("");
      Alert.alert("Done", "Your password has been updated.");
    } catch (err: any) {
      setPasswordError(err?.message ?? "Failed to update password.");
    } finally {
      setPasswordLoading(false);
    }
  };

  const formatLabel = (value?: string | null) => {
    if (!value) return "—";
    return value.split("_").map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
  };

  const initials = email ? email.slice(0, 2).toUpperCase() : "RU";
  const displayName = email ? email.split("@")[0] : "Runner";
  const isLocalAuth = authProvider === "local";

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <AppTopBar title="Profile" />

        {/* Avatar + name */}
        <View style={styles.avatarSection}>
          <LinearGradient
            colors={["#6347C7", "#4929B3"]}
            style={styles.avatar}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.avatarText}>{initials}</Text>
          </LinearGradient>
          <Text style={styles.displayName}>{displayName}</Text>
          <Text style={styles.emailText}>{email}</Text>
          {!isLocalAuth && (
            <Text style={styles.providerBadge}>
              {authProvider === "apple" ? "Signed in with Apple" : "Signed in with Google"}
            </Text>
          )}
        </View>

        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color="#6347C7" />
          </View>
        ) : (
          <>
            {/* Stats row */}
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{runCount}</Text>
                <Text style={styles.statLabel}>Runs</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={[styles.statValue, { color: "#22C55E" }]}>
                  {runCount > 0 ? runCount : "—"}
                </Text>
                <Text style={styles.statLabel}>Analyses</Text>
              </View>
            </View>

            {/* Runner profile */}
            <Text style={styles.sectionTitle}>Runner Profile</Text>
            <View style={styles.card}>
              {[
                { label: "Age", value: profile?.age != null ? `${profile.age} yrs` : "—" },
                { label: "Weight", value: profile?.weight != null ? `${profile.weight} kg` : "—" },
                { label: "Height", value: profile?.height != null ? `${profile.height} cm` : "—" },
                { label: "Gender", value: formatLabel(profile?.gender) },
                { label: "Experience", value: formatLabel(profile?.experience_level) },
                { label: "Goal", value: formatLabel(profile?.running_goal) },
              ].map((row, i, arr) => (
                <View
                  key={row.label}
                  style={[styles.profileRow, i < arr.length - 1 && styles.profileRowBorder]}
                >
                  <Text style={styles.profileRowLabel}>{row.label}</Text>
                  <Text style={styles.profileRowValue}>{row.value}</Text>
                </View>
              ))}
            </View>

            {/* Account actions */}
            <Text style={styles.sectionTitle}>Account</Text>
            <View style={styles.card}>
              <TouchableOpacity
                style={[styles.actionRow, styles.profileRowBorder]}
                onPress={() => router.push({ pathname: "/profile", params: { mode: "update" } })}
                activeOpacity={0.75}
              >
                <View style={[styles.actionIcon, { backgroundColor: "#EDE9FB" }]}>
                  <Text style={styles.actionIconText}>✏️</Text>
                </View>
                <Text style={styles.actionLabel}>Update Profile</Text>
                <Text style={styles.actionChev}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionRow, styles.profileRowBorder]}
                onPress={() => router.push("/analysis-history")}
                activeOpacity={0.75}
              >
                <View style={[styles.actionIcon, { backgroundColor: "#EDE9FB" }]}>
                  <Text style={styles.actionIconText}>📋</Text>
                </View>
                <Text style={styles.actionLabel}>Analysis History</Text>
                <Text style={styles.actionChev}>›</Text>
              </TouchableOpacity>

              {isLocalAuth && (
                <TouchableOpacity
                  style={[styles.actionRow, styles.profileRowBorder]}
                  onPress={() => {
                    setNewPassword("");
                    setConfirmPassword("");
                    setPasswordError(null);
                    setShowPasswordModal(true);
                  }}
                  activeOpacity={0.75}
                >
                  <View style={[styles.actionIcon, { backgroundColor: "#EDE9FB" }]}>
                    <Text style={styles.actionIconText}>🔑</Text>
                  </View>
                  <Text style={styles.actionLabel}>Change Password</Text>
                  <Text style={styles.actionChev}>›</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.actionRow, styles.profileRowBorder]}
                onPress={handleLogout}
                activeOpacity={0.75}
              >
                <View style={[styles.actionIcon, { backgroundColor: "#FEF2F2" }]}>
                  <Text style={styles.actionIconText}>🚪</Text>
                </View>
                <Text style={[styles.actionLabel, styles.actionLabelRed]}>Sign Out</Text>
                <Text style={[styles.actionChev, { color: "#EF4444" }]}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionRow}
                onPress={handleDeleteAccount}
                activeOpacity={0.75}
              >
                <View style={[styles.actionIcon, { backgroundColor: "#FEF2F2" }]}>
                  <Text style={styles.actionIconText}>🗑️</Text>
                </View>
                <Text style={[styles.actionLabel, styles.actionLabelRed]}>Delete Account</Text>
                <Text style={[styles.actionChev, { color: "#EF4444" }]}>›</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>

      {/* Change Password Modal */}
      <Modal visible={showPasswordModal} transparent animationType="fade" onRequestClose={() => setShowPasswordModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Change Password</Text>
            <Text style={styles.modalSub}>Enter a new password for your account.</Text>

            <Text style={styles.inputLabel}>New Password</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="At least 8 characters"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
              autoCapitalize="none"
              placeholderTextColor="#94A3B8"
            />

            <Text style={styles.inputLabel}>Confirm Password</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Repeat new password"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              autoCapitalize="none"
              placeholderTextColor="#94A3B8"
            />

            {passwordError ? (
              <Text style={styles.modalError}>{passwordError}</Text>
            ) : null}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setShowPasswordModal(false)}
                activeOpacity={0.75}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirm}
                onPress={handleChangePassword}
                disabled={passwordLoading}
                activeOpacity={0.8}
              >
                {passwordLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.modalConfirmText}>Update</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F5F3FF" },
  scroll: { paddingHorizontal: 16, paddingBottom: 40 },

  avatarSection: { alignItems: "center", paddingVertical: 24 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  avatarText: { fontSize: 28, fontWeight: "800", color: "#fff" },
  displayName: { fontSize: 22, fontWeight: "800", color: "#0F172A", letterSpacing: -0.3 },
  emailText: { fontSize: 14, color: "#64748B", marginTop: 4 },
  providerBadge: {
    marginTop: 6,
    fontSize: 12,
    color: "#6347C7",
    fontWeight: "600",
    backgroundColor: "#EDE9FB",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
  },

  loadingWrap: { paddingVertical: 48, alignItems: "center" },

  statsRow: { flexDirection: "row", marginBottom: 24, gap: 10 },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#6347C7",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  statValue: { fontSize: 26, fontWeight: "800", color: "#6347C7" },
  statLabel: { fontSize: 12, color: "#64748B", fontWeight: "600", marginTop: 2 },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.3,
    marginBottom: 10,
    marginTop: 4,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 20,
    overflow: "hidden",
    shadowColor: "#6347C7",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },

  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 13,
    justifyContent: "space-between",
  },
  profileRowBorder: { borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
  profileRowLabel: { fontSize: 14, color: "#64748B", fontWeight: "500" },
  profileRowValue: { fontSize: 14, color: "#0F172A", fontWeight: "700" },

  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  actionIconText: { fontSize: 16 },
  actionLabel: { flex: 1, fontSize: 15, fontWeight: "600", color: "#0F172A" },
  actionLabelRed: { color: "#EF4444" },
  actionChev: { fontSize: 20, color: "#94A3B8", fontWeight: "300" },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  modalCard: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  modalTitle: { fontSize: 20, fontWeight: "800", color: "#0F172A", marginBottom: 4 },
  modalSub: { fontSize: 14, color: "#64748B", marginBottom: 20 },
  inputLabel: { fontSize: 13, fontWeight: "600", color: "#475569", marginBottom: 6 },
  modalInput: {
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 12 : 10,
    fontSize: 15,
    color: "#0F172A",
    marginBottom: 14,
    backgroundColor: "#F8FAFC",
  },
  modalError: { fontSize: 13, color: "#EF4444", marginBottom: 12, fontWeight: "500" },
  modalActions: { flexDirection: "row", gap: 10, marginTop: 4 },
  modalCancel: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    alignItems: "center",
  },
  modalCancelText: { fontSize: 15, fontWeight: "600", color: "#64748B" },
  modalConfirm: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: "#6347C7",
    alignItems: "center",
  },
  modalConfirmText: { fontSize: 15, fontWeight: "700", color: "#fff" },
});
