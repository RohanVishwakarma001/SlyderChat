import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { useColorScheme as useSystemColorScheme } from '@/hooks/use-color-scheme';

import { badgeColors, dark, light, type ColorScheme } from './colors';
import { radii, spacing } from './spacing';
import { typography } from './typography';

export type ThemePreference = 'light' | 'dark' | 'system';
const STORAGE_KEY = 'slyderchat.themePreference';

type ThemeContextValue = {
  colors: ColorScheme;
  scheme: 'light' | 'dark';
  typography: typeof typography;
  spacing: typeof spacing;
  radii: typeof radii;
  badgeColors: typeof badgeColors;
  preference: ThemePreference;
  setPreference: (pref: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useSystemColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('system');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        setPreferenceState(stored);
      }
      setHydrated(true);
    });
  }, []);

  const setPreference = (pref: ThemePreference) => {
    setPreferenceState(pref);
    AsyncStorage.setItem(STORAGE_KEY, pref).catch(() => {});
  };

  const scheme: 'light' | 'dark' =
    preference === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : preference;

  const value = useMemo<ThemeContextValue>(
    () => ({
      colors: scheme === 'dark' ? dark : light,
      scheme,
      typography,
      spacing,
      radii,
      badgeColors,
      preference,
      setPreference,
    }),
    [scheme, preference],
  );

  // Avoid a light->dark flash: render nothing for one tick while the stored
  // preference hydrates. Splash screen is still up at this point.
  if (!hydrated) return null;

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useAppTheme must be used within a ThemeProvider');
  return ctx;
}
