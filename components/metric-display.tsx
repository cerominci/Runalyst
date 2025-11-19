import { StyleSheet, View } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';

export type MetricDisplayProps = {
  primaryValue: string | number;
  primaryLabel: string;
  secondaryValue?: string | number;
  secondaryLabel?: string;
  icon?: React.ReactNode;
};

export function MetricDisplay({
  primaryValue,
  primaryLabel,
  secondaryValue,
  secondaryLabel,
  icon,
}: MetricDisplayProps) {
  const borderColor = useThemeColor({ light: '#e0e0e0', dark: '#333' }, 'icon');
  
  return (
    <ThemedView style={styles.container}>
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      
      <View style={styles.primaryContainer}>
        <ThemedText type="title" style={styles.primaryValue}>
          {primaryValue}
        </ThemedText>
        <ThemedText type="default" style={styles.primaryLabel}>
          {primaryLabel}
        </ThemedText>
      </View>

      {secondaryValue !== undefined && secondaryLabel && (
        <View style={[styles.secondaryContainer, { borderTopColor: borderColor }]}>
          <ThemedText type="subtitle" style={styles.secondaryValue}>
            {secondaryValue}
          </ThemedText>
          <ThemedText type="default" style={styles.secondaryLabel}>
            {secondaryLabel}
          </ThemedText>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 16,
    marginVertical: 8,
  },
  iconContainer: {
    marginBottom: 12,
    alignItems: 'center',
  },
  primaryContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  primaryValue: {
    marginBottom: 4,
  },
  primaryLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  secondaryContainer: {
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  secondaryValue: {
    marginBottom: 4,
  },
  secondaryLabel: {
    fontSize: 12,
    opacity: 0.6,
  },
});

