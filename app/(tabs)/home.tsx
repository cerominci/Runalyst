import { CustomButton, StatCard } from '@/components';
import { HomeLayout } from '@/components/layouts';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

/**
 * ============================================================================
 * HOME SCREEN - Example Page with Banner 1 and Navigation Buttons
 * ============================================================================
 * 
 * This screen demonstrates:
 * 1. HomeLayout with Banner 1 (user icon left, title center, settings icon right)
 * 2. Navigation buttons that open different pages with different layouts
 * 3. How Expo Router file-based routing works
 * 
 * ROUTING EXPLANATION:
 * ====================
 * 
 * WHERE ROUTES ARE DEFINED:
 * -------------------------
 * Routes are automatically created based on files in the `app/` directory.
 * 
 * 1. Root Routes (app/_layout.tsx):
 *    - This file defines the main Stack navigator
 *    - Each <Stack.Screen name="..." /> creates a route
 *    - Example: <Stack.Screen name="login" /> creates route "/login"
 *    - Location: app/_layout.tsx (lines 18-21)
 * 
 * 2. Tab Routes (app/(tabs)/_layout.tsx):
 *    - This file defines the Tab navigator for bottom tabs
 *    - Each <Tabs.Screen name="..." /> creates a tab route
 *    - Example: <Tabs.Screen name="home" /> creates route "/(tabs)/home"
 *    - Location: app/(tabs)/_layout.tsx (lines 19-39)
 * 
 * 3. File-Based Routes:
 *    - app/login.tsx → creates route "/login"
 *    - app/upload.tsx → creates route "/upload"
 *    - app/(tabs)/home.tsx → creates route "/(tabs)/home"
 *    - app/(tabs)/index.tsx → creates route "/(tabs)" or "/" (default)
 * 
 * WHERE THE FIRST/DEFAULT PAGE IS DEFINED:
 * -----------------------------------------
 * The default page when the app opens is determined by:
 * 
 * 1. In app/_layout.tsx (line 9):
 *    export const unstable_settings = { anchor: '(tabs)' };
 *    This sets "(tabs)" as the initial route group
 * 
 * 2. In app/(tabs)/_layout.tsx:
 *    The first <Tabs.Screen name="index" /> (line 19-25) is the default tab
 *    So app/(tabs)/index.tsx is the first screen shown
 * 
 * 3. To change the default page:
 *    - Change the "anchor" in app/_layout.tsx
 *    - Or reorder the Tabs.Screen components
 *    - Or rename index.tsx to be the first alphabetically
 * 
 * HOW BUTTONS NAVIGATE TO PAGES:
 * ------------------------------
 * Navigation is done using the router from expo-router:
 * 
 * 1. Import: import { useRouter } from 'expo-router';
 * 2. Get router: const router = useRouter();
 * 3. Navigate: router.push('/route-name') or router.replace('/route-name')
 * 
 * Button navigation is defined in the onPress handler (see buttons below)
 * 
 * ============================================================================
 */

export default function HomeScreen() {
  // Get the router for navigation
  // This is where navigation functions come from
  const router = useRouter();

  return (
    <HomeLayout
      // ======================================================================
      // BANNER 1 - This is the banner with user icon (left), title (center), 
      // and settings icon (right)
      // ======================================================================
      bannerTitle="Running Analysis"
      onUserPress={() => {
        // This button is in the BANNER (top left)
        // Navigates to user profile - you can create app/profile.tsx
        console.log('User icon pressed - navigate to profile');
        // router.push('/profile');
      }}
      onSettingsPress={() => {
        // This button is in the BANNER (top right)
        // Navigates to settings - you can create app/settings.tsx
        console.log('Settings icon pressed - navigate to settings');
        // router.push('/settings');
      }}>
      
      <View style={styles.container}>
        <ThemedText type="title" style={styles.title}>
          Navigation Examples
        </ThemedText>
        <ThemedText type="default" style={styles.subtitle}>
          Tap buttons below to see different layouts
        </ThemedText>

        {/* ====================================================================
            QUICK STATS SECTION
            ==================================================================== */}
        <View style={styles.quickStats}>
          <StatCard label="Total Runs" value="12" />
          <StatCard label="Avg Score" value="87" unit="%" />
        </View>

        {/* ====================================================================
            NAVIGATION BUTTONS SECTION
            Each button below demonstrates navigation to a different page/layout
            ==================================================================== */}
        <View style={styles.navigationSection}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Navigate to Different Layouts
          </ThemedText>

          {/* BUTTON 1: Navigate to Login Page (AuthLayout) */}
          {/* 
            WHERE THIS BUTTON IS DEFINED: Below, line ~90
            WHAT PAGE IT GOES TO: /login (app/login.tsx)
            WHAT LAYOUT IT USES: AuthLayout (centered form layout)
            HOW IT WORKS: router.push('/login') navigates to app/login.tsx
            ROUTE DEFINED IN: app/_layout.tsx line 19
          */}
          <CustomButton
            text="Go to Login Page"
            onPress={() => {
              // This button navigates to /login
              // The route is defined in app/_layout.tsx (line 19)
              // The page file is app/login.tsx
              // That page uses AuthLayout (centered, keyboard-aware)
              router.push('/login');
            }}
            backgroundColor="#0a7ea4"
            style={styles.navButton}
          />

          {/* BUTTON 2: Navigate to Upload/Analysis Page (AnalysisLayout) */}
          {/* 
            WHERE THIS BUTTON IS DEFINED: Below, line ~105
            WHAT PAGE IT GOES TO: /upload (app/upload.tsx)
            WHAT LAYOUT IT USES: AnalysisLayout (back button, step-by-step)
            HOW IT WORKS: router.push('/upload') navigates to app/upload.tsx
            ROUTE DEFINED IN: app/_layout.tsx line 20
          */}
          <CustomButton
            text="Go to Upload & Analysis Page"
            onPress={() => {
              // This button navigates to /upload
              // The route is defined in app/_layout.tsx (line 20)
              // The page file is app/upload.tsx
              // That page uses AnalysisLayout (back button, scrollable)
              router.push('/upload');
            }}
            backgroundColor="#4CAF50"
            style={styles.navButton}
          />

          {/* BUTTON 3: Navigate to Welcome Tab (default tab) */}
          {/* 
            WHERE THIS BUTTON IS DEFINED: Below, line ~120
            WHAT PAGE IT GOES TO: /(tabs) or / (the default tab)
            WHAT LAYOUT IT USES: Uses ParallaxScrollView (original layout)
            HOW IT WORKS: router.push('/(tabs)') or router.push('/') 
            ROUTE DEFINED IN: app/_layout.tsx line 18, app/(tabs)/_layout.tsx line 19
            DEFAULT PAGE: app/(tabs)/index.tsx is shown first
          */}
          <CustomButton
            text="Go to Welcome Tab"
            onPress={() => {
              // This button navigates to the default tab
              // The route is defined in app/_layout.tsx (line 18) as "(tabs)"
              // The default tab is app/(tabs)/index.tsx (defined in tabs/_layout.tsx line 19)
              // This is the FIRST PAGE shown when app opens (see routing explanation above)
              router.push('/(tabs)');
              // Alternative: router.push('/') also works
            }}
            backgroundColor="#FF9800"
            style={styles.navButton}
          />

          {/* BUTTON 4: Navigate to Explore Tab */}
          {/* 
            WHERE THIS BUTTON IS DEFINED: Below, line ~135
            WHAT PAGE IT GOES TO: /(tabs)/explore
            WHAT LAYOUT IT USES: Uses ParallaxScrollView (original layout)
            HOW IT WORKS: router.push('/(tabs)/explore')
            ROUTE DEFINED IN: app/(tabs)/_layout.tsx line 33-38
          */}
          <CustomButton
            text="Go to Explore Tab"
            onPress={() => {
              // This button navigates to the explore tab
              // The route is defined in app/(tabs)/_layout.tsx (line 33-38)
              // The page file is app/(tabs)/explore.tsx
              router.push('/(tabs)/explore');
            }}
            backgroundColor="#9C27B0"
            style={styles.navButton}
          />

          {/* BUTTON 5: Navigate to Modal (Modal Layout) */}
          {/* 
            WHERE THIS BUTTON IS DEFINED: Below, line ~150
            WHAT PAGE IT GOES TO: /modal
            WHAT LAYOUT IT USES: Modal presentation (slides up from bottom)
            HOW IT WORKS: router.push('/modal')
            ROUTE DEFINED IN: app/_layout.tsx line 21 (with presentation: 'modal')
          */}
          <CustomButton
            text="Open Modal"
            onPress={() => {
              // This button opens a modal
              // The route is defined in app/_layout.tsx (line 21)
              // The page file is app/modal.tsx
              // It uses modal presentation (slides up from bottom)
              router.push('/modal');
            }}
            variant="outline"
            style={styles.navButton}
          />
        </View>

        {/* ====================================================================
            INFORMATION SECTION
            ==================================================================== */}
        <ThemedView style={styles.infoBox}>
          <ThemedText type="defaultSemiBold" style={styles.infoTitle}>
            💡 Navigation Tips
          </ThemedText>
          <ThemedText type="default" style={styles.infoText}>
            • router.push() - Adds to navigation stack (can go back)
          </ThemedText>
          <ThemedText type="default" style={styles.infoText}>
            • router.replace() - Replaces current screen (can't go back)
          </ThemedText>
          <ThemedText type="default" style={styles.infoText}>
            • router.back() - Goes back to previous screen
          </ThemedText>
          <ThemedText type="default" style={styles.infoText}>
            • Routes are defined in app/_layout.tsx and app/(tabs)/_layout.tsx
          </ThemedText>
        </ThemedView>
      </View>
    </HomeLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 24,
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 16,
  },
  quickStats: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  navigationSection: {
    gap: 16,
    marginTop: 8,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  navButton: {
    marginBottom: 8,
  },
  infoBox: {
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    backgroundColor: 'rgba(10, 126, 164, 0.1)',
  },
  infoTitle: {
    marginBottom: 12,
    fontSize: 16,
  },
  infoText: {
    fontSize: 13,
    marginBottom: 6,
    opacity: 0.8,
  },
});

