import React, { ReactNode } from "react";
import { SafeAreaView, ScrollView, StyleSheet, ViewStyle } from "react-native";

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
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  contentContainer: {
    paddingBottom: 24,
  },
});

export default ScrollScreen;
