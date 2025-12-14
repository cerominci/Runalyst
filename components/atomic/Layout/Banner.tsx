import React, { ReactNode } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import BackButton from "../Button/BackButton";
import Title from "../Typography/Title";

interface BannerProps {
  title: string;
  onBackPress: () => void;
  rightContent?: ReactNode;
  style?: ViewStyle;
}

const Banner: React.FC<BannerProps> = ({
  title,
  onBackPress,
  rightContent,
  style,
}) => {
  return (
    <View style={[styles.banner, style]}>
      <BackButton onPress={onBackPress} />
      <Title style={styles.title}>{title}</Title>
      <View style={styles.rightContent}>
        {rightContent}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  title: {
    flex: 1,
    marginLeft: 12,
    fontSize: 26,
    fontWeight: "700",
  },
  rightContent: {
    minWidth: 40,
    alignItems: "flex-end",
  },
});

export default Banner;

