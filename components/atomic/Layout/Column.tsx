import React, { ReactNode } from "react";
import { FlexAlignType, StyleSheet, View, ViewStyle } from "react-native";

interface ColumnProps {
  children: ReactNode;
  style?: ViewStyle;
  justify?: ViewStyle["justifyContent"];
  align?: FlexAlignType;
}

const Column: React.FC<ColumnProps> = ({ children, style, justify, align }) => {
  return (
    <View
      style={[
        styles.column,
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
  column: {
    flexDirection: "column",
  },
});

export default Column;
