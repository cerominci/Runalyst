import { RunningGoal } from "@/constants/types";
import React from "react";
import { ViewStyle } from "react-native";
import Dropdown, { DropdownOption } from "../../atomic/Inputs/Dropdown";

interface RunningGoalSelectorProps {
  selectedValue: string | null;
  onSelect: (value: string) => void;
  style?: ViewStyle;
}

const GOAL_OPTIONS: DropdownOption[] = [
  { label: "Weight loss", value: RunningGoal.WEIGHT_LOSS },
  { label: "Improve fitness", value: RunningGoal.IMPROVE_FITNESS },
  { label: "Marathon training", value: RunningGoal.MARATHON_TRAINING },
  { label: "Speed improvement", value: RunningGoal.SPEED_IMPROVEMENT },
  { label: "Stress relief", value: RunningGoal.STRESS_RELIEF },
  { label: "Social running", value: RunningGoal.SOCIAL_RUNNING },
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
