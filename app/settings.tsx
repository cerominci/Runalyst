import Column from "@/components/atomic/Layout/Column";
import ScreenContainer from "@/components/atomic/Layout/ScreenContainer";
import Subtitle from "@/components/atomic/Typography/Subtitle";
import AppTopBar from "@/components/composite/Layout/AppTopBar";
import React from "react";
import { StyleSheet, View } from "react-native";

export default function SettingsScreen() {
  return (
    <ScreenContainer>
      <Column style={styles.content}>
        <AppTopBar title="Settings" />
        <View style={styles.card}>
          <Subtitle style={styles.title}>Settings</Subtitle>
          <Subtitle style={styles.description}>
            Account and app preferences will be available here.
          </Subtitle>
        </View>
      </Column>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingBottom: 20,
  },
  card: {
    marginTop: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0F172A",
  },
  description: {
    color: "#64748B",
    fontSize: 15,
    lineHeight: 22,
  },
});
