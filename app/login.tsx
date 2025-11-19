import { CustomButton } from '@/components/custom-button';
import { AuthLayout } from '@/components/layouts';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

/**
 * Login Screen - Example authentication screen
 * 
 * This demonstrates the AuthLayout component with:
 * - Centered logo and title
 * - Form inputs area
 * - Login button
 * - Link to sign up
 */
export default function LoginScreen() {
  const router = useRouter();

  const handleLogin = () => {
    // Handle login logic here
    console.log('Login pressed');
    // Navigate to home after successful login
    // router.replace('/(tabs)');
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to continue analyzing your running form"
      showLogo={true}>
      <View style={styles.form}>
        <ThemedView style={styles.inputContainer}>
          <ThemedText type="default" style={styles.label}>
            Email
          </ThemedText>
          <ThemedView style={styles.input}>
            <ThemedText type="default" style={styles.inputText}>
              Enter your email
            </ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.inputContainer}>
          <ThemedText type="default" style={styles.label}>
            Password
          </ThemedText>
          <ThemedView style={styles.input}>
            <ThemedText type="default" style={styles.inputText}>
              Enter your password
            </ThemedText>
          </ThemedView>
        </ThemedView>

        <CustomButton
          text="Sign In"
          onPress={handleLogin}
          style={styles.loginButton}
        />

        <View style={styles.footer}>
          <ThemedText type="default" style={styles.footerText}>
            Don't have an account?{' '}
          </ThemedText>
          {/* 
            Fixed: Using onPress with router.push instead of Link with asChild
            The route /signup is defined in app/_layout.tsx
            The page file is app/signup.tsx
          */}
          <ThemedText 
            type="link" 
            style={styles.link}
            onPress={() => router.push('/signup')}>
            Sign Up
          </ThemedText>
        </View>
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  input: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minHeight: 50,
    justifyContent: 'center',
  },
  inputText: {
    opacity: 0.6,
  },
  loginButton: {
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  footerText: {
    fontSize: 14,
  },
  link: {
    fontSize: 14,
  },
});

