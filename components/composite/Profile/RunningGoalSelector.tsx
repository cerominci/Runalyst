import React from "react";
import Dropdown from "../../atomic/Inputs/Dropdown";
import { ViewStyle } from "react-native";

interface RunningGoalSelectorProps {
  selectedValue: string | null;
  onSelect: (value: string) => void;
  style?: ViewStyle;
}

const GOAL_OPTIONS = [
  "Improve running form",
  "Increase endurance",
  "Increase speed",
  "Injury prevention",
  "Weight loss",
  "General fitness",
];

const RunningGoalSelector: React.FC<RunningGoalSelectorProps> = ({
  selectedValue,
  onSelect,
  style,
}) => {
  return (
    <Dropdown
      label="Primary Running Goal"
      selectedValue={selectedValue}
      onSelect={onSelect}
      options={GOAL_OPTIONS}
      placeholder="Select your primary goal"
      style={style}
    />
  );
};

export default RunningGoalSelector;

