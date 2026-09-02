import React from "react";
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from "react-native";
import Label from "../../atomic/Typography/Label";

interface InjurySelectorProps {
  hasInjuries: boolean | null;
  onSelect: (hasInjuries: boolean) => void;
  style?: ViewStyle;
}

const InjurySelector: React.FC<InjurySelectorProps> = ({
  hasInjuries,
  onSelect,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <Label>Do you have any current injuries or limitations?</Label>
      <View style={styles.optionsContainer}>
        <TouchableOpacity
          style={[
            styles.option,
            hasInjuries === true && styles.optionActive,
          ]}
          onPress={() => onSelect(true)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.optionText,
              hasInjuries === true && styles.optionTextActive,
            ]}
          >
            Yes
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.option,
            hasInjuries === false && styles.optionActive,
          ]}
          onPress={() => onSelect(false)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.optionText,
              hasInjuries === false && styles.optionTextActive,
            ]}
          >
            No
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 20,
  },
  optionsContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  option: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  optionActive: {
    backgroundColor: "#1D4ED8",
    borderColor: "#1D4ED8",
  },
  optionText: {
    fontSize: 15,
    color: "#475569",
    fontWeight: "500",
  },
  optionTextActive: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});

export default InjurySelector;

