import React, { ReactNode } from "react";
import { StyleSheet, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ScreenContainerProps {
  children: ReactNode;
  style?: ViewStyle;
}

const ScreenContainer: React.FC<ScreenContainerProps> = ({ children, style }) => {
  return (
    <SafeAreaView style={[styles.container, style]}>
      {children}
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
});

export default ScreenContainer;
