import React from "react";
import { StyleSheet, TextInput, View, ViewStyle } from "react-native";
import Label from "../../atomic/Typography/Label";

interface WeightInputProps {
  value: string;
  onChangeText: (text: string) => void;
  style?: ViewStyle;
}

const WeightInput: React.FC<WeightInputProps> = ({ value, onChangeText, style }) => {
  const handleChange = (text: string) => {
    // Only allow numbers and one decimal point
    const numericText = text.replace(/[^0-9.]/g, "");
    // Ensure only one decimal point
    const parts = numericText.split(".");
    const formattedText = parts.length > 2 
      ? parts[0] + "." + parts.slice(1).join("")
      : numericText;
    // Allow any numeric input while typing - validation happens on form submit
    onChangeText(formattedText);
  };

  return (
    <View style={[styles.container, style]}>
      <Label>Weight</Label>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={handleChange}
          placeholder="Enter your weight"
          placeholderTextColor="#9CA3AF"
          keyboardType="decimal-pad"
          maxLength={6}
        />
        <View style={styles.suffix}>
          <Label style={styles.suffixText}>kg</Label>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    color: "#1E293B",
  },
  suffix: {
    paddingRight: 14,
  },
  suffixText: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
});

export default WeightInput;

