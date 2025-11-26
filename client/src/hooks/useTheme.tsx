import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './useAuth';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [theme, setThemeState] = useState<Theme>('light');
  const [themeLoaded, setThemeLoaded] = useState(false);

  // Load theme from database when user logs in
  useEffect(() => {
    if (isAuthenticated && user) {
      fetch('/api/theme')
        .then(res => res.json())
        .then(data => {
          const loadedTheme = (data.theme === 'light' || data.theme === 'dark') ? data.theme : 'light';
          setThemeState(loadedTheme);
          setThemeLoaded(true);
        })
        .catch(() => {
          setThemeLoaded(true);
        });
    } else {
      // For unauthenticated users, default to light mode
      setThemeState('light');
      setThemeLoaded(true);
    }
  }, [isAuthenticated, user]);

  // Apply theme to DOM
  useEffect(() => {
    if (!themeLoaded) return;

    const html = document.documentElement;
    const body = document.body;
    const root = document.getElementById('root');
    
    if (theme === 'dark') {
      html.classList.add('dark');
      body.classList.add('dark');
      if (root) root.classList.add('dark');
    } else {
      html.classList.remove('dark');
      body.classList.remove('dark');
      if (root) root.classList.remove('dark');
    }
  }, [theme, themeLoaded]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    
    // Sync to database if authenticated
    if (isAuthenticated) {
      fetch('/api/theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: newTheme }),
      }).catch(error => console.error('Failed to update theme preference:', error));
    }
  }, [isAuthenticated]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
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
