import React from "react";
import { StyleSheet, TextInput, View, ViewStyle } from "react-native";
import Label from "../../atomic/Typography/Label";

interface HeightInputProps {
  value: string;
  onChangeText: (text: string) => void;
  style?: ViewStyle;
}

const HeightInput: React.FC<HeightInputProps> = ({ value, onChangeText, style }) => {
  const handleChange = (text: string) => {
    // Only allow numbers
    const numericText = text.replace(/[^0-9]/g, "");
    // Allow any numeric input while typing - validation happens on form submit
    onChangeText(numericText);
  };

  return (
    <View style={[styles.container, style]}>
      <Label>Height</Label>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={handleChange}
          placeholder="Enter your height"
          placeholderTextColor="#9CA3AF"
          keyboardType="number-pad"
          maxLength={3}
        />
        <View style={styles.suffix}>
          <Label style={styles.suffixText}>cm</Label>
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

export default HeightInput;

