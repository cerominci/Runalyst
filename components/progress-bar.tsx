import { StyleSheet, View } from 'react-native';
import { ThemedView } from './themed-view';
import { ThemedText } from './themed-text';

export type ProgressBarProps = {
  progress: number; // 0 to 1
  color?: string;
  height?: number;
  showLabel?: boolean;
  label?: string;
};

export function ProgressBar({
  progress,
  color = '#0a7ea4',
  height = 8,
  showLabel = false,
  label,
}: ProgressBarProps) {
  const clampedProgress = Math.max(0, Math.min(1, progress));
  const percentage = Math.round(clampedProgress * 100);

  return (
    <View style={styles.container}>
      {showLabel && (
        <View style={styles.labelContainer}>
          {label && (
            <ThemedView>
              <ThemedText type="default" style={styles.label}>
                {label}
              </ThemedText>
            </ThemedView>
          )}
          <ThemedView>
            <ThemedText type="defaultSemiBold" style={styles.percentage}>
              {percentage}%
            </ThemedText>
          </ThemedView>
        </View>
      )}
      <View style={[styles.track, { height }]}>
        <View
          style={[
            styles.fill,
            {
              width: `${percentage}%`,
              backgroundColor: color,
              height,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
  },
  percentage: {
    fontSize: 14,
  },
  track: {
    width: '100%',
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: 4,
    transition: 'width 0.3s ease',
  },
});

