import React, { useEffect, useState } from 'react';
import { ThemeContext, type ThemeMode } from '../contexts/ThemeContext';

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: ThemeMode;
  storageKey?: string;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = 'system',
  storageKey = 'biztrack-ui-theme',
}) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    try {
      const stored = localStorage.getItem(storageKey) as ThemeMode | null;
      return stored || defaultTheme;
    } catch {
      return defaultTheme;
    }
  });

  const resolvedTheme: 'light' | 'dark' = (() => {
    if (theme === 'system' && typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return theme === 'system' ? 'light' : theme;
  })();

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(resolvedTheme);
  }, [resolvedTheme]);

  const setTheme = (mode: ThemeMode) => {
    try {
      localStorage.setItem(storageKey, mode);
    } catch {
      // Handle private browsing storage limitations gracefully
    }
    setThemeState(mode);
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
