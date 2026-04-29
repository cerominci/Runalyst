import IconButton from "@/components/atomic/Button/IconButton";
import Subtitle from "@/components/atomic/Typography/Subtitle";
import { logout } from "@/utils/endpoints";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";

interface AppTopBarProps {
  title?: string;
  centerIcon?: keyof typeof Ionicons.glyphMap;
  showBackButton?: boolean;
  disableBackButton?: boolean;
}

const AppTopBar: React.FC<AppTopBarProps> = ({
  title,
  centerIcon,
  showBackButton = true,
  disableBackButton = false,
}) => {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  const handleBack = () => {
    if (disableBackButton) return;
    router.back();
  };

  const handleSettings = () => {
    router.push("/settings");
  };

  const handleSignOut = async () => {
    if (signingOut) return;
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
  };

  return (
    <View style={styles.container}>
      <View style={styles.leftSlot}>
        {showBackButton ? (
          <IconButton
            icon="arrow-back"
            onPress={handleBack}
            color={disableBackButton ? "#94A3B8" : "#3B82F6"}
            style={disableBackButton ? styles.disabledButton : undefined}
          />
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>
      <View style={styles.centerContent}>
        {centerIcon ? (
          <Ionicons name={centerIcon} size={24} color="#0F172A" />
        ) : title ? (
          <Subtitle style={styles.title}>{title}</Subtitle>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>
      <View style={styles.actions}>
        <IconButton icon="settings-outline" onPress={handleSettings} />
        <IconButton
          icon="log-out-outline"
          onPress={handleSignOut}
          color={signingOut ? "#94A3B8" : "#EF4444"}
          style={signingOut ? styles.disabledButton : undefined}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingVertical: 4,
    minHeight: 44,
    marginBottom: 8,
  },
  leftSlot: {
    minWidth: 44,
    alignItems: "flex-start",
  },
  centerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    textAlign: "center",
    fontSize: 22,
    fontWeight: "700",
    color: "#0F172A",
  },
  actions: {
    minWidth: 88,
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 2,
  },
  placeholder: {
    width: 36,
    height: 36,
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default AppTopBar;
