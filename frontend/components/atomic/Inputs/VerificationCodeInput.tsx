import React from "react";
import { StyleSheet, TextInput, View } from "react-native";
import Label from "../Typography/Label";

interface VerificationCodeInputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  maxLength?: number;
}

const VerificationCodeInput: React.FC<VerificationCodeInputProps> = ({
  label,
  value,
  onChangeText,
  maxLength = 6,
}) => {
  return (
    <View style={styles.container}>
      {label && <Label>{label}</Label>}
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={(t) => onChangeText(t.toUpperCase())}
        placeholder="______"
        placeholderTextColor="#CBD5E1"
        maxLength={maxLength}
        keyboardType="number-pad"
        textAlign="center"
        autoCapitalize="characters"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  input: {
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    fontSize: 20,
    letterSpacing: 10,
    color: "#0F172A",
  },
});

export default VerificationCodeInput;
