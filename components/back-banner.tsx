import { StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useRouter } from 'expo-router';

export type BackBannerProps = {
  title?: string;
  onBackPress?: () => void;
  backIconName?: keyof typeof Ionicons.glyphMap;
};

export function BackBanner({
  title,
  onBackPress,
  backIconName = 'arrow-back-outline',
}: BackBannerProps) {
  const router = useRouter();
  const iconColor = useThemeColor({}, 'icon');

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  return (
    <ThemedView style={styles.container}>
      <TouchableOpacity
        onPress={handleBackPress}
        style={styles.iconButton}
        activeOpacity={0.7}
        accessibilityLabel="Go back"
        accessibilityRole="button">
        <Ionicons name={backIconName} size={24} color={iconColor} />
      </TouchableOpacity>

      {title && (
        <ThemedText type="subtitle" style={styles.title}>
          {title}
        </ThemedText>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 56,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  title: {
    flex: 1,
  },
});

