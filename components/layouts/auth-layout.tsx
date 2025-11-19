import { StyleSheet, ScrollView, View, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '../themed-view';
import { ThemedText } from '../themed-text';

export type AuthLayoutProps = {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showLogo?: boolean;
};

/**
 * AuthLayout - A layout wrapper for authentication screens (login, signup, etc.)
 * 
 * Features:
 * - Safe area handling
 * - Keyboard avoiding view for better UX on mobile
 * - Centered content with title and subtitle
 * - Scrollable for smaller screens
 * - Clean, minimal design focused on form inputs
 */
export function AuthLayout({
  children,
  title,
  subtitle,
  showLogo = false,
}: AuthLayoutProps) {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <ThemedView style={styles.themedContainer}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              {showLogo && (
                <View style={styles.logoContainer}>
                  <ThemedText type="title" style={styles.logo}>
                    🏃
                  </ThemedText>
                </View>
              )}
              {title && (
                <ThemedText type="title" style={styles.title}>
                  {title}
                </ThemedText>
              )}
              {subtitle && (
                <ThemedText type="default" style={styles.subtitle}>
                  {subtitle}
                </ThemedText>
              )}
            </View>

            <View style={styles.content}>{children}</View>
          </ScrollView>
        </ThemedView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  themedContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    minHeight: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    marginBottom: 16,
  },
  logo: {
    fontSize: 64,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.7,
    paddingHorizontal: 16,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
});

