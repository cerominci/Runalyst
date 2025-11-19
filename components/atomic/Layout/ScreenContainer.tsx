import React, { ReactNode } from "react";
import { SafeAreaView, StyleSheet, ViewStyle } from "react-native";

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
    backgroundColor: "#F8FAFC", // çok açık gri/mavi arka plan
    paddingHorizontal: 16,
    paddingTop: 8,
  },
});

export default ScreenContainer;
