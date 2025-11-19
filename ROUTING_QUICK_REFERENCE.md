# Routing Quick Reference

## 📍 Where Routes Are Defined

### 1. Root Routes (`app/_layout.tsx`)
This file defines the main Stack navigator. Each `<Stack.Screen>` creates a route:

```typescript
<Stack>
  <Stack.Screen name="(tabs)" />      // Creates route "/(tabs)" or "/"
  <Stack.Screen name="login" />       // Creates route "/login"
  <Stack.Screen name="upload" />      // Creates route "/upload"
  <Stack.Screen name="modal" />       // Creates route "/modal"
</Stack>
```

### 2. Tab Routes (`app/(tabs)/_layout.tsx`)
This file defines the Tab navigator for bottom tabs:

```typescript
<Tabs>
  <Tabs.Screen name="index" />        // Creates route "/(tabs)" or "/" (DEFAULT)
  <Tabs.Screen name="home" />         // Creates route "/(tabs)/home"
  <Tabs.Screen name="explore" />      // Creates route "/(tabs)/explore"
</Tabs>
```

### 3. File-Based Routes
Routes are automatically created from files:
- `app/login.tsx` → `/login`
- `app/upload.tsx` → `/upload`
- `app/(tabs)/home.tsx` → `/(tabs)/home`
- `app/(tabs)/index.tsx` → `/(tabs)` or `/` (default)

## 🏠 Where the First/Default Page Is Defined

The default page when the app opens is determined by:

1. **`app/_layout.tsx` (line 9):**
   ```typescript
   export const unstable_settings = { anchor: '(tabs)' };
   ```
   This sets `"(tabs)"` as the initial route group.

2. **`app/(tabs)/_layout.tsx` (line 19):**
   The first `<Tabs.Screen name="index" />` is the default tab.
   So `app/(tabs)/index.tsx` is the first screen shown.

3. **To change the default page:**
   - Change the `anchor` in `app/_layout.tsx`
   - Or reorder the `Tabs.Screen` components
   - Or rename `index.tsx` to be first alphabetically

## 🔘 How Buttons Navigate to Pages

Navigation is done using the router from `expo-router`:

```typescript
// 1. Import
import { useRouter } from 'expo-router';

// 2. Get router
const router = useRouter();

// 3. Navigate
router.push('/login');        // Adds to stack (can go back)
router.replace('/login');     // Replaces current (can't go back)
router.back();                // Goes back
```

### Button Example:
```typescript
<CustomButton
  text="Go to Login"
  onPress={() => {
    // This navigates to /login
    // Route defined in app/_layout.tsx line 19
    // Page file is app/login.tsx
    router.push('/login');
  }}
/>
```

## 📱 Available Routes

| Route | File | Layout Used | Description |
|-------|------|-------------|-------------|
| `/` or `/(tabs)` | `app/(tabs)/index.tsx` | ParallaxScrollView | Default/Welcome screen |
| `/(tabs)/home` | `app/(tabs)/home.tsx` | HomeLayout (Banner 1) | Home dashboard |
| `/(tabs)/explore` | `app/(tabs)/explore.tsx` | ParallaxScrollView | Explore tab |
| `/login` | `app/login.tsx` | AuthLayout | Login screen |
| `/upload` | `app/upload.tsx` | AnalysisLayout | Upload & analysis |
| `/modal` | `app/modal.tsx` | Modal | Modal presentation |

## 🎨 Layouts Available

1. **HomeLayout** - Banner 1 (user icon, title, settings icon) + scrollable content
2. **AuthLayout** - Centered form layout with keyboard avoiding
3. **AnalysisLayout** - Back button + title + scrollable content

## 💡 Navigation Tips

- `router.push()` - Adds to navigation stack (can go back)
- `router.replace()` - Replaces current screen (can't go back)
- `router.back()` - Goes back to previous screen
- Routes are automatically created from files in `app/` directory
- Use `(folder)` syntax for route groups (like `(tabs)`)

## 📝 Example Home Page

See `app/(tabs)/home.tsx` for a complete example with:
- Banner 1 (user icon, title, settings icon)
- Multiple navigation buttons
- Detailed comments explaining each button's navigation
- Information box with navigation tips

