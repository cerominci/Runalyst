import React, { ReactNode } from "react";
import { ScrollView, StyleSheet, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ScrollScreenProps {
  children: ReactNode;
  style?: ViewStyle;              // SafeAreaView için
  contentContainerStyle?: ViewStyle; // ScrollView içeriği için
}

const ScrollScreen: React.FC<ScrollScreenProps> = ({
  children,
  style,
  contentContainerStyle,
}) => {
  return (
    <SafeAreaView style={[styles.container, style]}>
      <ScrollView
        contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 12,
    paddingTop: 8,
    maxWidth: 800, // Prevent content from being too wide on web
    alignSelf: "center", // Center content on web
    width: "100%",
  },
  contentContainer: {
    paddingBottom: 20,
  },
});

export default ScrollScreen;
