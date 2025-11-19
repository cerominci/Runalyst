// components/composite/Home/HomeMenuButton.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, View, ViewStyle } from "react-native";
import BodyText from "../../atomic/Typography/BodyText";
import Title from "../../atomic/Typography/Title";

interface HomeMenuButtonProps {
  title: string;
  description?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  style?: ViewStyle;
}

const HomeMenuButton: React.FC<HomeMenuButtonProps> = ({
  title,
  description,
  icon,
  onPress,
  style,
}) => {
  return (
    <TouchableOpacity
      style={[styles.card, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.row}>
        <View style={styles.iconWrapper}>
          {icon && <Ionicons name={icon} size={22} color="#2563EB" />}
        </View>

        <View style={styles.textWrapper}>
          <Title style={styles.title}>{title}</Title>
          {description && (
            <BodyText style={styles.description}>{description}</BodyText>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  textWrapper: {
    flex: 1,
  },
  title: {
    fontSize: 17,
  },
  description: {
    marginTop: 4,
    fontSize: 13,
    color: "#6B7280",
  },
});

export default HomeMenuButton;
