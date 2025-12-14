import React from "react";
import { StyleSheet, View } from "react-native";
import BodyText from "../../atomic/Typography/BodyText";
import Title from "../../atomic/Typography/Title";

interface AuthHeaderProps {
  title: string;
  subtitle?: string;
}

const AuthHeader: React.FC<AuthHeaderProps> = ({ title, subtitle }) => {
  return (
    <View style={styles.container}>
      <Title>{title}</Title>
      {subtitle && <BodyText style={styles.subtitle}>{subtitle}</BodyText>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  subtitle: {
    marginTop: 6,
    color: "#475569",
  },
});

export default AuthHeader;
