// components/composite/History/IntervalSelector.tsx
import React from "react";
import { ViewStyle } from "react-native";
import Dropdown from "../../atomic/Inputs/Dropdown";

interface IntervalSelectorProps {
  selectedValue: string | null;
  onSelect: (value: string) => void;
  options?: string[];
  style?: ViewStyle;
}

const DEFAULT_OPTIONS = ["Last 2 days", "Last 10 days", "Last 4 videos"];

const IntervalSelector: React.FC<IntervalSelectorProps> = ({
  selectedValue,
  onSelect,
  options = DEFAULT_OPTIONS,
  style,
}) => {
  return (
    <Dropdown
      label="Time interval"
      selectedValue={selectedValue}
      onSelect={onSelect}
      options={options}
      placeholder="Select interval"
      style={style}
    />
  );
};

export default IntervalSelector;
