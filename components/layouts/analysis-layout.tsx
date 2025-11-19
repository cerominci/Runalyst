import { StyleSheet, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BackBanner } from '../back-banner';
import { ThemedView } from '../themed-view';

export type AnalysisLayoutProps = {
  children: React.ReactNode;
  title?: string;
  onBackPress?: () => void;
  showBackButton?: boolean;
  headerContent?: React.ReactNode;
};

/**
 * AnalysisLayout - A layout wrapper for video upload and analysis results screens
 * 
 * Features:
 * - Safe area handling
 * - Back button navigation
 * - Optional title in header
 * - Custom header content support
 * - Scrollable content area
 * - Designed for step-by-step workflows (upload -> processing -> results)
 */
export function AnalysisLayout({
  children,
  title,
  onBackPress,
  showBackButton = true,
  headerContent,
}: AnalysisLayoutProps) {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ThemedView style={styles.themedContainer}>
        {showBackButton && (
          <BackBanner title={title} onBackPress={onBackPress} />
        )}
        {headerContent && <View style={styles.headerContent}>{headerContent}</View>}
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
  headerContent: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
});

