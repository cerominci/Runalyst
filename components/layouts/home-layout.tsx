import { StyleSheet, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Banner } from '../banner';
import { ThemedView } from '../themed-view';

export type HomeLayoutProps = {
  children: React.ReactNode;
  bannerTitle?: string;
  onUserPress?: () => void;
  onSettingsPress?: () => void;
  showBanner?: boolean;
};

/**
 * HomeLayout - A layout wrapper for home/main screens
 * 
 * Features:
 * - Safe area handling for notches/status bars
 * - Top banner with user and settings icons
 * - Scrollable content area
 * - Themed background
 */
export function HomeLayout({
  children,
  bannerTitle = 'Running Analysis',
  onUserPress,
  onSettingsPress,
  showBanner = true,
}: HomeLayoutProps) {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ThemedView style={styles.themedContainer}>
        {showBanner && (
          <Banner
            title={bannerTitle}
            onUserPress={onUserPress}
            onSettingsPress={onSettingsPress}
          />
        )}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  themedContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
});

