import PrimaryButton from "@/components/atomic/Button/PrimaryButton";
import Column from "@/components/atomic/Layout/Column";
import ScreenContainer from "@/components/atomic/Layout/ScreenContainer";
import Subtitle from "@/components/atomic/Typography/Subtitle";
import AppTopBar from "@/components/composite/Layout/AppTopBar";
import { Profile } from "@/constants/types";
import { getMyProfile } from "@/utils/endpoints";
import { useRouter } from "expo-router";
import { useIsFocused } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

export default function AccountScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isFocused = useIsFocused();

  const formatLabel = (value?: string | null) => {
    if (!value) return "Not set";
    return value
      .split("_")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  };

  const formatNumber = (value?: number | null, suffix?: string) => {
    if (typeof value !== "number") return "Not set";
    return `${value}${suffix ?? ""}`;
  };

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const profileData = await getMyProfile();
      setProfile(profileData);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load profile";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isFocused) {
      fetchProfile();
    }
  }, [isFocused, fetchProfile]);

  const handleUpdateProfile = () => {
    router.push({ pathname: "/profile", params: { mode: "update" } });
  };

  return (
    <ScreenContainer>
      <Column style={styles.content}>
        <AppTopBar />
        <View style={styles.headerSection}>
          <Subtitle style={styles.title}>Your Information</Subtitle>
          <Subtitle style={styles.subtitle}>
            Review and update the profile data used for your analysis.
          </Subtitle>
        </View>

        <View style={styles.profileSection}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Subtitle style={styles.loadingText}>
                Loading your profile...
              </Subtitle>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Subtitle style={styles.errorText}>{error}</Subtitle>
            </View>
          ) : !profile ? (
            <View style={styles.emptyContainer}>
              <Subtitle style={styles.emptyText}>
                No profile information found yet.
              </Subtitle>
              <PrimaryButton
                title="Create Information"
                onPress={handleUpdateProfile}
                style={styles.updateButton}
              />
            </View>
          ) : (
            <View style={styles.profileCard}>
              <Subtitle style={styles.rowTitle}>Age</Subtitle>
              <Subtitle style={styles.rowValue}>{formatNumber(profile.age)}</Subtitle>
              <Subtitle style={styles.rowTitle}>Weight</Subtitle>
              <Subtitle style={styles.rowValue}>{formatNumber(profile.weight, " kg")}</Subtitle>
              <Subtitle style={styles.rowTitle}>Height</Subtitle>
              <Subtitle style={styles.rowValue}>{formatNumber(profile.height, " cm")}</Subtitle>
              <Subtitle style={styles.rowTitle}>Gender</Subtitle>
              <Subtitle style={styles.rowValue}>{formatLabel(profile.gender)}</Subtitle>
              <Subtitle style={styles.rowTitle}>Experience</Subtitle>
              <Subtitle style={styles.rowValue}>{formatLabel(profile.experience_level)}</Subtitle>
              <Subtitle style={styles.rowTitle}>Running Goal</Subtitle>
              <Subtitle style={styles.rowValue}>{formatLabel(profile.running_goal)}</Subtitle>
              <Subtitle style={styles.rowTitle}>Current Injuries</Subtitle>
              <Subtitle style={styles.rowValue}>
                {profile.has_injuries === null || profile.has_injuries === undefined
                  ? "Not set"
                  : profile.has_injuries
                    ? "Yes"
                    : "No"}
              </Subtitle>
              <PrimaryButton
                title="Update Information"
                onPress={handleUpdateProfile}
                style={styles.updateButton}
              />
            </View>
          )}
        </View>
      </Column>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingBottom: 24,
  },
  headerSection: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#64748B",
    lineHeight: 24,
  },
  profileSection: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#64748B",
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 16,
    textAlign: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    color: "#64748B",
    fontSize: 16,
    marginBottom: 14,
  },
  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    gap: 4,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  rowTitle: {
    color: "#64748B",
    fontSize: 13,
  },
  rowValue: {
    color: "#0F172A",
    fontSize: 16,
    marginBottom: 10,
  },
  updateButton: {
    marginTop: 8,
    width: "100%",
  },
});
