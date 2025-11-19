import { StyleSheet, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { ThemedText } from './themed-text';

export type CustomButtonProps = TouchableOpacityProps & {
  text: string;
  backgroundColor?: string;
  textColor?: string;
  variant?: 'primary' | 'secondary' | 'outline';
};

export function CustomButton({
  text,
  backgroundColor,
  textColor,
  variant = 'primary',
  style,
  disabled,
  ...props
}: CustomButtonProps) {
  const getButtonStyle = () => {
    if (backgroundColor) {
      return { backgroundColor };
    }

    switch (variant) {
      case 'primary':
        return styles.primaryButton;
      case 'secondary':
        return styles.secondaryButton;
      case 'outline':
        return styles.outlineButton;
      default:
        return styles.primaryButton;
    }
  };

  const getTextStyle = () => {
    if (textColor) {
      return { color: textColor };
    }

    switch (variant) {
      case 'primary':
        return styles.primaryText;
      case 'secondary':
        return styles.secondaryText;
      case 'outline':
        return styles.outlineText;
      default:
        return styles.primaryText;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getButtonStyle(),
        disabled && styles.disabledButton,
        style,
      ]}
      disabled={disabled}
      activeOpacity={0.7}
      {...props}>
      <ThemedText
        style={[
          styles.buttonText,
          getTextStyle(),
          disabled && styles.disabledText,
        ]}>
        {text}
      </ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  primaryButton: {
    backgroundColor: '#0a7ea4',
  },
  secondaryButton: {
    backgroundColor: '#6c757d',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#0a7ea4',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryText: {
    color: '#ffffff',
  },
  secondaryText: {
    color: '#ffffff',
  },
  outlineText: {
    color: '#0a7ea4',
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.7,
  },
});

