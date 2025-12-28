import React from "react";
import Dropdown from "../../atomic/Inputs/Dropdown";
import { ViewStyle } from "react-native";

interface GenderSelectorProps {
  selectedValue: string | null;
  onSelect: (value: string) => void;
  style?: ViewStyle;
}

const GENDER_OPTIONS = ["Male", "Female", "Other", "Prefer not to say"];

const GenderSelector: React.FC<GenderSelectorProps> = ({
  selectedValue,
  onSelect,
  style,
}) => {
  return (
    <Dropdown
      label="Gender"
      selectedValue={selectedValue}
      onSelect={onSelect}
      options={GENDER_OPTIONS}
      placeholder="Select gender"
      style={style}
    />
  );
};

export default GenderSelector;

