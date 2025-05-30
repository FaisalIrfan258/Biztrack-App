/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

/**
 * Color scheme for BizTrack financial tracking app
 */

// Primary colors
const primaryColor = '#2563EB'; // Blue
const secondaryColor = '#0F172A'; // Dark blue
const accentColor = '#10B981'; // Green for positive financial indicators

export const Colors = {
  light: {
    text: '#1E293B', // Slate 800
    background: '#F8FAFC', // Slate 50
    card: '#FFFFFF',
    tint: primaryColor,
    accent: accentColor,
    muted: '#94A3B8', // Slate 400
    border: '#E2E8F0', // Slate 200
    error: '#EF4444', // Red 500
    success: accentColor,
    warning: '#F59E0B', // Amber 500
    info: '#0EA5E9', // Sky 500
    tabIconDefault: '#94A3B8',
    tabIconSelected: primaryColor,
  },
  dark: {
    text: '#F1F5F9', // Slate 100
    background: '#0F172A', // Slate 900
    card: '#1E293B', // Slate 800
    tint: '#60A5FA', // Blue 400 (lighter in dark mode)
    accent: '#34D399', // Green 400 (lighter in dark mode)
    muted: '#64748B', // Slate 500
    border: '#334155', // Slate 700
    error: '#F87171', // Red 400
    success: '#34D399', // Green 400
    warning: '#FBBF24', // Amber 400
    info: '#38BDF8', // Sky 400
    tabIconDefault: '#64748B',
    tabIconSelected: '#60A5FA',
  },
};
