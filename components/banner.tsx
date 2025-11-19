import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';

export type BannerProps = {
  title: string;
  onUserPress?: () => void;
  onSettingsPress?: () => void;
  userIconName?: keyof typeof Ionicons.glyphMap;
  settingsIconName?: keyof typeof Ionicons.glyphMap;
};

export function Banner({
  title,
  onUserPress,
  onSettingsPress,
  userIconName = 'person-outline',
  settingsIconName = 'settings-outline',
}: BannerProps) {
  const iconColor = useThemeColor({}, 'icon');

  return (
    <ThemedView style={styles.container}>
      <TouchableOpacity
        onPress={onUserPress}
        style={styles.iconButton}
        activeOpacity={0.7}
        accessibilityLabel="User profile"
        accessibilityRole="button">
        <Ionicons name={userIconName} size={24} color={iconColor} />
      </TouchableOpacity>

      <ThemedText type="subtitle" style={styles.title}>
        {title}
      </ThemedText>

      <TouchableOpacity
        onPress={onSettingsPress}
        style={styles.iconButton}
        activeOpacity={0.7}
        accessibilityLabel="Settings"
        accessibilityRole="button">
        <Ionicons name={settingsIconName} size={24} color={iconColor} />
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 56,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    textAlign: 'center',
  },
});

