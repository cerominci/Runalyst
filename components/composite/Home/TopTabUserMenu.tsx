// components/composite/Home/TopTabUserMenu.tsx
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from "react-native";

export interface TopTabOption {
  key: string;
  label: string;
}

interface TopTabUserMenuProps {
  options: TopTabOption[];        // örn: [{key: "user", label:"User Info"}, {key:"settings", label:"Settings"}]
  activeKey: string;
  onChange: (key: string) => void;
  style?: ViewStyle;
}

const TopTabUserMenu: React.FC<TopTabUserMenuProps> = ({
  options,
  activeKey,
  onChange,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {options.map((opt) => {
        const isActive = opt.key === activeKey;
        return (
          <TouchableOpacity
            key={opt.key}
            style={[styles.tab, isActive && styles.activeTab]}
            onPress={() => onChange(opt.key)}
            activeOpacity={0.8}
          >
            <Text style={[styles.label, isActive && styles.activeLabel]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#E5E7EB",
    borderRadius: 999,
    padding: 3,
    alignSelf: "center",
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  activeTab: {
    backgroundColor: "#FFFFFF",
  },
  label: {
    fontSize: 14,
    color: "#4B5563",
    fontWeight: "500",
  },
  activeLabel: {
    color: "#1D4ED8",
    fontWeight: "700",
  },
});

export default TopTabUserMenu;
