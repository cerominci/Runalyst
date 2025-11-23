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

interface DropdownProps {
  label?: string;
  selectedValue: string | null;
  onSelect: (value: string) => void;
  options: string[];
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

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}

      {/* Select Button */}
      <TouchableOpacity
        style={styles.selectBox}
        onPress={() => setOpen(true)}
        activeOpacity={0.7}
      >
        <Text style={[styles.selectedText, !selectedValue && styles.placeholder]}>
          {selectedValue || placeholder}
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
            data={options}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.optionItem}
                onPress={() => {
                  onSelect(item);
                  setOpen(false);
                }}
              >
                <Text style={styles.optionText}>{item}</Text>
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
