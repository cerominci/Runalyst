# Layouts Guide

## How Layouts Work in This App

### Overview

In this React Native Expo Router app, **layouts** are reusable wrapper components that provide consistent structure, navigation, and styling across different screens. They handle common UI patterns like headers, safe areas, scrolling, and keyboard management.

### Architecture

This app uses **two types of layouts**:

1. **Navigation Layouts** (`app/_layout.tsx`) - Define the routing structure using Expo Router
2. **Component Layouts** (`components/layouts/`) - Reusable UI wrappers for screen content

### Navigation Layouts (Expo Router)

Located in `app/_layout.tsx`, these define the app's navigation structure:

```typescript
<Stack>
  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
  <Stack.Screen name="login" options={{ headerShown: false }} />
  <Stack.Screen name="upload" options={{ headerShown: false }} />
</Stack>
```

**How it works:**
- File-based routing: Each file in `app/` becomes a route
- `(tabs)` is a route group (folder with parentheses)
- Stack navigator manages screen transitions
- Options control header visibility, presentation style, etc.

### Component Layouts

These are React components that wrap screen content with consistent UI patterns.

## Available Layouts

### 1. HomeLayout (`components/layouts/home-layout.tsx`)

**Purpose:** Main dashboard/home screens with top navigation

**Features:**
- Safe area handling (notches, status bars)
- Top banner with user and settings icons
- Scrollable content area
- Themed background

**Usage:**
```typescript
import { HomeLayout } from '@/components/layouts';

export default function HomeScreen() {
  return (
    <HomeLayout
      bannerTitle="Running Analysis"
      onUserPress={() => router.push('/profile')}
      onSettingsPress={() => router.push('/settings')}>
      {/* Your screen content */}
    </HomeLayout>
  );
}
```

**Props:**
- `children` - Screen content
- `bannerTitle` - Text displayed in center of banner
- `onUserPress` - Handler for user icon tap
- `onSettingsPress` - Handler for settings icon tap
- `showBanner` - Toggle banner visibility (default: true)

### 2. AuthLayout (`components/layouts/auth-layout.tsx`)

**Purpose:** Authentication screens (login, signup, password reset)

**Features:**
- Safe area handling
- Keyboard avoiding view (prevents keyboard from covering inputs)
- Centered content with logo/title area
- Scrollable for smaller screens
- Clean, minimal design focused on forms

**Usage:**
```typescript
import { AuthLayout } from '@/components/layouts';

export default function LoginScreen() {
  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to continue"
      showLogo={true}>
      {/* Form inputs, buttons, etc. */}
    </AuthLayout>
  );
}
```

**Props:**
- `children` - Form content
- `title` - Main heading
- `subtitle` - Secondary text below title
- `showLogo` - Display logo emoji (default: false)

### 3. AnalysisLayout (`components/layouts/analysis-layout.tsx`)

**Purpose:** Video upload and analysis results screens

**Features:**
- Safe area handling
- Back button navigation
- Optional title in header
- Custom header content support
- Scrollable content area
- Designed for step-by-step workflows

**Usage:**
```typescript
import { AnalysisLayout } from '@/components/layouts';

export default function UploadScreen() {
  return (
    <AnalysisLayout
      title="Video Analysis"
      onBackPress={() => router.back()}>
      {/* Upload interface or results */}
    </AnalysisLayout>
  );
}
```

**Props:**
- `children` - Screen content
- `title` - Optional title next to back button
- `onBackPress` - Custom back handler (defaults to router.back())
- `showBackButton` - Toggle back button (default: true)
- `headerContent` - Custom React node for additional header content

## Design Principles

### 1. **Consistency**
All layouts use the same theming system (`ThemedView`, `ThemedText`) for automatic light/dark mode support.

### 2. **Safe Areas**
All layouts use `SafeAreaView` to handle device notches, status bars, and home indicators properly.

### 3. **Flexibility**
Layouts accept custom content via `children` prop, allowing screens to define their own UI while maintaining consistent structure.

### 4. **Accessibility**
Layouts include proper accessibility labels and roles for screen readers.

## Creating Custom Layouts

To create a new layout:

1. Create a file in `components/layouts/`
2. Use `SafeAreaView` for safe area handling
3. Use `ThemedView` and `ThemedText` for theming
4. Export from `components/layouts/index.ts`
5. Document props and usage

Example:
```typescript
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '../themed-view';

export function MyCustomLayout({ children, title }: MyCustomLayoutProps) {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ThemedView style={styles.content}>
        {title && <ThemedText type="title">{title}</ThemedText>}
        {children}
      </ThemedView>
    </SafeAreaView>
  );
}
```

## Example Screens

- **Home Screen:** `app/(tabs)/home.tsx` - Uses `HomeLayout`
- **Login Screen:** `app/login.tsx` - Uses `AuthLayout`
- **Upload Screen:** `app/upload.tsx` - Uses `AnalysisLayout`

## Best Practices

1. **Use layouts for consistency** - Don't recreate header/navigation in each screen
2. **Keep layouts focused** - Each layout should serve a specific purpose
3. **Compose when needed** - You can nest layouts or use multiple layout components
4. **Handle navigation** - Layouts should handle their own navigation patterns
5. **Make them reusable** - Accept props for customization rather than hardcoding values

## Navigation Flow

```
RootLayout (Stack Navigator)
├── (tabs) - Tab Navigator
│   ├── index.tsx - Default tab
│   ├── home.tsx - Uses HomeLayout
│   └── explore.tsx
├── login.tsx - Uses AuthLayout
├── upload.tsx - Uses AnalysisLayout
└── modal.tsx - Modal presentation
```

Each screen file can use any layout component, and layouts handle the UI structure while screens focus on content.

