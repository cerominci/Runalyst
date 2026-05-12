import { logout } from "@/utils/endpoints";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface AppTopBarProps {
  title?: string;
  sub?: string;
  showBackButton?: boolean;
  disableBackButton?: boolean;
  right?: React.ReactNode;
  back?: boolean;
}

const AppTopBar: React.FC<AppTopBarProps> = ({
  title,
  sub,
  showBackButton = false,
  disableBackButton = false,
  right,
  back,
}) => {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  const showBack = back || showBackButton;

  const handleBack = () => {
    if (disableBackButton) return;
    router.back();
  };

  const handleSettings = () => {
    router.push("/settings");
  };

  const handleSignOut = async () => {
    if (signingOut) return;
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          setSigningOut(true);
          try {
            await logout();
            router.replace("/start");
          } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to sign out.";
            Alert.alert("Sign out failed", message);
          } finally {
            setSigningOut(false);
          }
        },
      },
    ]);
  };

  const defaultRight = (
    <View style={styles.rightRow}>
      <TouchableOpacity style={styles.iconBtn} onPress={handleSettings}>
        <Ionicons name="settings-outline" size={20} color="#64748B" />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.iconBtn}
        onPress={handleSignOut}
        disabled={signingOut}
      >
        <Ionicons
          name="log-out-outline"
          size={20}
          color={signingOut ? "#94A3B8" : "#FF8A4C"}
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        {showBack ? (
          <TouchableOpacity
            style={[styles.backBtn, disableBackButton && styles.disabled]}
            onPress={handleBack}
            disabled={disableBackButton}
          >
            <Ionicons name="chevron-back" size={18} color="#6347C7" />
          </TouchableOpacity>
        ) : (
          <View style={styles.logoMark}>
            <Ionicons name="footsteps-outline" size={18} color="#fff" />
          </View>
        )}
        <View style={styles.flex} />
        {right ?? defaultRight}
      </View>
      {title && (
        <View style={styles.titleBlock}>
          <Text style={styles.title}>{title}</Text>
          {sub && <Text style={styles.sub}>{sub}</Text>}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingTop: 4,
    paddingBottom: 8,
    gap: 4,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 44,
  },
  flex: { flex: 1 },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#EDE9FB",
    alignItems: "center",
    justifyContent: "center",
  },
  logoMark: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#6347C7",
    alignItems: "center",
    justifyContent: "center",
  },
  rightRow: {
    flexDirection: "row",
    gap: 4,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#EDE9FB",
    alignItems: "center",
    justifyContent: "center",
  },
  titleBlock: {
    paddingHorizontal: 2,
    paddingBottom: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.5,
  },
  sub: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 2,
    fontWeight: "500",
  },
  disabled: {
    opacity: 0.4,
  },
});

export default AppTopBar;
