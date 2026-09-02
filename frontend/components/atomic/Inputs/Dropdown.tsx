import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from "react-native";

export type DropdownOption = string | { label: string; value: string };

function normalizeOptions(options: DropdownOption[]): { label: string; value: string }[] {
  return options.map((o) => (typeof o === "string" ? { label: o, value: o } : o));
}

function labelForValue(
  selectedValue: string | null,
  normalized: { label: string; value: string }[]
): string | null {
  if (selectedValue == null || selectedValue === "") return null;
  const found = normalized.find((o) => o.value === selectedValue);
  return found ? found.label : selectedValue;
}

interface DropdownProps {
  label?: string;
  selectedValue: string | null;
  onSelect: (value: string) => void;
  options: DropdownOption[];
  placeholder?: string;
  style?: ViewStyle;
}

const Dropdown: React.FC<DropdownProps> = ({
  label,
  selectedValue,
  onSelect,
  options,
  placeholder = "Select...",
  style,
}) => {
  const [open, setOpen] = useState(false);
  const normalized = normalizeOptions(options);
  const displayLabel = labelForValue(selectedValue, normalized);

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}

      {/* Select Button */}
      <TouchableOpacity
        style={styles.selectBox}
        onPress={() => setOpen(true)}
        activeOpacity={0.7}
      >
        <Text style={[styles.selectedText, !displayLabel && styles.placeholder]}>
          {displayLabel || placeholder}
        </Text>

        <Ionicons name="chevron-down" size={20} color="#475569" />
      </TouchableOpacity>

      {/* Dropdown Modal */}
      <Modal visible={open} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setOpen(false)}>
          <View style={styles.modalBackground} />
        </TouchableWithoutFeedback>

        <View style={styles.modalContent}>
          <FlatList
            data={normalized}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.optionItem}
                onPress={() => {
                  onSelect(item.value);
                  setOpen(false);
                }}
              >
                <Text style={styles.optionText}>{item.label}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "600",
    marginBottom: 8,
  },
  selectBox: {
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    minHeight: 50,
  },
  selectedText: {
    fontSize: 16,
    color: "#1E293B",
    fontWeight: "500",
  },
  placeholder: {
    color: "#9CA3AF",
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  modalContent: {
    position: "absolute",
    top: "30%",
    left: "10%",
    right: "10%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 10,
    maxHeight: "40%",
    elevation: 4,
  },
  optionItem: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  optionText: {
    fontSize: 15,
    color: "#1E293B",
  },
});

export default Dropdown;
