import React, { ReactNode } from "react";
import { FlexAlignType, StyleSheet, View, ViewStyle } from "react-native";

interface RowProps {
  children: ReactNode;
  style?: ViewStyle;
  justify?: ViewStyle["justifyContent"];
  align?: FlexAlignType;
}

const Row: React.FC<RowProps> = ({ children, style, justify, align }) => {
  return (
    <View
      style={[
        styles.row,
        justify && { justifyContent: justify },
        align && { alignItems: align },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
  },
});

export default Row;
