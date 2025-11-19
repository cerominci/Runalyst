import { StyleSheet, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { AuthLayout } from '@/components/layouts';
import { CustomButton } from '@/components/custom-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

/**
 * Signup Screen - User registration screen
 * 
 * This demonstrates the AuthLayout component with:
 * - Centered logo and title
 * - Registration form inputs
 * - Sign up button
 * - Link to login page
 */
export default function SignupScreen() {
  const router = useRouter();

  const handleSignup = () => {
    // Handle signup logic here
    console.log('Sign up pressed');
    // Navigate to home after successful signup
    // router.replace('/(tabs)');
  };

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Sign up to start analyzing your running form"
      showLogo={true}>
      <View style={styles.form}>
        <ThemedView style={styles.inputContainer}>
          <ThemedText type="default" style={styles.label}>
            Full Name
          </ThemedText>
          <ThemedView style={styles.input}>
            <ThemedText type="default" style={styles.inputText}>
              Enter your full name
            </ThemedText>
          </ThemedView>
        </ThemedView>

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
              Create a password
            </ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.inputContainer}>
          <ThemedText type="default" style={styles.label}>
            Confirm Password
          </ThemedText>
          <ThemedView style={styles.input}>
            <ThemedText type="default" style={styles.inputText}>
              Confirm your password
            </ThemedText>
          </ThemedView>
        </ThemedView>

        <CustomButton
          text="Sign Up"
          onPress={handleSignup}
          style={styles.signupButton}
        />

        <View style={styles.footer}>
          <ThemedText type="default" style={styles.footerText}>
            Already have an account?{' '}
          </ThemedText>
          <ThemedText 
            type="link" 
            style={styles.link}
            onPress={() => router.push('/login')}>
            Sign In
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
  signupButton: {
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

