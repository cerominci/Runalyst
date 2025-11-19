import { StyleSheet, View } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

export type StatCardProps = {
  label: string;
  value: string | number;
  unit?: string;
  icon?: React.ReactNode;
};

export function StatCard({ label, value, unit, icon }: StatCardProps) {
  return (
    <ThemedView style={styles.container}>
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <ThemedText type="defaultSemiBold" style={styles.label}>
        {label}
      </ThemedText>
      <View style={styles.valueContainer}>
        <ThemedText type="title" style={styles.value}>
          {value}
        </ThemedText>
        {unit && (
          <ThemedText type="default" style={styles.unit}>
            {unit}
          </ThemedText>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    minWidth: 120,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iconContainer: {
    marginBottom: 8,
  },
  label: {
    marginBottom: 8,
    textAlign: 'center',
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
  },
  value: {
    marginRight: 4,
  },
  unit: {
    fontSize: 14,
  },
});

