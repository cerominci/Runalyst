import { Gender } from "@/constants/types";
import React from "react";
import { ViewStyle } from "react-native";
import Dropdown, { DropdownOption } from "../../atomic/Inputs/Dropdown";

interface GenderSelectorProps {
  selectedValue: string | null;
  onSelect: (value: string) => void;
  style?: ViewStyle;
}

const GENDER_OPTIONS: DropdownOption[] = [
  { label: "Male", value: Gender.MALE },
  { label: "Female", value: Gender.FEMALE },
  { label: "Other", value: Gender.OTHER },
  { label: "Prefer not to say", value: Gender.PREFER_NOT_TO_SAY },
];

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

