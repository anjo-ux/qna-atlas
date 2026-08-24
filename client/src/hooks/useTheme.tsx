import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './useAuth';

export type ThemePreference = 'system' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';

interface ThemeContextType {
  theme: ThemePreference;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function parseTheme(value: unknown): ThemePreference | null {
  if (value === 'system' || value === 'light' || value === 'dark') return value;
  return null;
}

function readStoredTheme(): ThemePreference {
  if (typeof window === 'undefined') return 'system';
  return parseTheme(localStorage.getItem('theme')) ?? 'system';
}

function resolveTheme(preference: ThemePreference): ResolvedTheme {
  if (preference === 'system') {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return preference;
}

function applyResolvedTheme(resolved: ResolvedTheme) {
  const isDark = resolved === 'dark';
  const html = document.documentElement;
  const body = document.body;
  const root = document.getElementById('root');
  html.classList.toggle('dark', isDark);
  body.classList.toggle('dark', isDark);
  if (root) root.classList.toggle('dark', isDark);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [theme, setThemeState] = useState<ThemePreference>(readStoredTheme);
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => resolveTheme(readStoredTheme()));
  const [themeLoaded, setThemeLoaded] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetch('/api/theme')
        .then(res => res.json())
        .then(data => {
          const loadedTheme = parseTheme(data.theme) ?? readStoredTheme();
          setThemeState(loadedTheme);
          setThemeLoaded(true);
        })
        .catch(() => {
          setThemeLoaded(true);
        });
    } else {
      setThemeState(readStoredTheme());
      setThemeLoaded(true);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (!themeLoaded) return;

    const apply = () => {
      const resolved = resolveTheme(theme);
      setResolvedTheme(resolved);
      applyResolvedTheme(resolved);
      localStorage.setItem('theme', theme);
    };

    apply();

    if (theme !== 'system') return;

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => apply();
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [theme, themeLoaded]);

  const setTheme = useCallback((newTheme: ThemePreference) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);

    if (isAuthenticated) {
      fetch('/api/theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: newTheme }),
      }).catch(error => console.error('Failed to update theme preference:', error));
    }
  }, [isAuthenticated]);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
