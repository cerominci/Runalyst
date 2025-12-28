import React from "react";
import Dropdown from "../../atomic/Inputs/Dropdown";
import { ViewStyle } from "react-native";

interface ExperienceLevelSelectorProps {
  selectedValue: string | null;
  onSelect: (value: string) => void;
  style?: ViewStyle;
}

const EXPERIENCE_OPTIONS = [
  "Beginner (just starting)",
  "Intermediate (running regularly)",
  "Advanced (competitive runner)",
];

const ExperienceLevelSelector: React.FC<ExperienceLevelSelectorProps> = ({
  selectedValue,
  onSelect,
  style,
}) => {
  return (
    <Dropdown
      label="Running Experience Level"
      selectedValue={selectedValue}
      onSelect={onSelect}
      options={EXPERIENCE_OPTIONS}
      placeholder="Select your experience level"
      style={style}
    />
  );
};

export default ExperienceLevelSelector;

