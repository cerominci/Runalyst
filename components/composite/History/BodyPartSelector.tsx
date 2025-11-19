// components/composite/History/BodyPartSelector.tsx
import React from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ViewStyle,
} from "react-native";
import Subtitle from "../../atomic/Typography/Subtitle";

interface BodyPartSelectorProps {
  selectedPart: string | null;
  onSelect: (part: string) => void;
  options?: string[];
  style?: ViewStyle;
}

const DEFAULT_BODY_PARTS = [
  "Full body",
  "Left leg",
  "Right leg",
  "Knees",
  "Hips",
  "Torso",
  "Arms",
  "Feet",
];

const BodyPartSelector: React.FC<BodyPartSelectorProps> = ({
  selectedPart,
  onSelect,
  options = DEFAULT_BODY_PARTS,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <Subtitle>Body part</Subtitle>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {options.map((part) => {
          const isActive = part === selectedPart;
          return (
            <TouchableOpacity
              key={part}
              style={[styles.chip, isActive && styles.chipActive]}
              onPress={() => onSelect(part)}
              activeOpacity={0.75}
            >
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                {part}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginTop: 12,
  },
  scrollContent: {
    paddingVertical: 8,
    columnGap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    backgroundColor: "#FFFFFF",
  },
  chipActive: {
    backgroundColor: "#1D4ED8",
    borderColor: "#1D4ED8",
  },
  chipText: {
    fontSize: 13,
    color: "#475569",
    fontWeight: "500",
  },
  chipTextActive: {
    color: "#FFFFFF",
  },
});

export default BodyPartSelector;
