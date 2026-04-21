import { ExperienceLevel } from "@/constants/types";
import React from "react";
import { ViewStyle } from "react-native";
import Dropdown, { DropdownOption } from "../../atomic/Inputs/Dropdown";

interface ExperienceLevelSelectorProps {
  selectedValue: string | null;
  onSelect: (value: string) => void;
  style?: ViewStyle;
}

const EXPERIENCE_OPTIONS: DropdownOption[] = [
  { label: "Beginner (just starting)", value: ExperienceLevel.BEGINNER },
  { label: "Intermediate (running regularly)", value: ExperienceLevel.INTERMEDIATE },
  { label: "Advanced (competitive runner)", value: ExperienceLevel.ADVANCED },
  { label: "Elite (highly competitive)", value: ExperienceLevel.ELITE },
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

