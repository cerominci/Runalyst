// components/composite/Tips/AccordionItem.tsx
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from "react-native";
import BodyText from "../../atomic/Typography/BodyText";

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  style?: ViewStyle;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ title, children, style }) => {
  const [open, setOpen] = useState(false);

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setOpen((prev) => !prev)}
        activeOpacity={0.8}
      >
        <Text style={styles.title}>{title}</Text>
        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          size={18}
          color="#64748B"
        />
      </TouchableOpacity>

      {open && (
        <View style={styles.content}>
          {typeof children === "string" ? (
            <BodyText>{children}</BodyText>
          ) : (
            children
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
    marginBottom: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0F172A",
  },
  content: {
    marginTop: 8,
  },
});

export default AccordionItem;
