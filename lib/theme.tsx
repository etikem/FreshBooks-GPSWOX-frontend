'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

export type Theme = 'dark' | 'light';

interface ThemeCtx {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggle: () => void;
}

const Ctx = createContext<ThemeCtx | null>(null);

const STORAGE_KEY = 'theme';

function readInitialTheme(): Theme {
  if (typeof document === 'undefined') return 'dark';
  const attr = document.documentElement.getAttribute('data-theme');
  return attr === 'light' ? 'light' : 'dark';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Initialise to the SAME value the server renders with ('dark') so the first
  // client render matches the SSR HTML — reading the real theme from the DOM
  // here would make light-mode users hydrate with 'light' against a 'dark'
  // server tree and throw React hydration error #418. The real theme is
  // adopted just below in useEffect, after hydration completes.
  const [theme, setThemeState] = useState<Theme>('dark');

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    document.documentElement.setAttribute('data-theme', t);
    try {
      localStorage.setItem(STORAGE_KEY, t);
    } catch {
      /* ignore quota / disabled storage */
    }
  }, []);

  const toggle = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  // Sync state with whatever the SSR-injected script set on <html>.
  useEffect(() => {
    setThemeState(readInitialTheme());
  }, []);

  return (
    <Ctx.Provider value={{ theme, setTheme, toggle }}>{children}</Ctx.Provider>
  );
}

export function useTheme(): ThemeCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error('useTheme must be used inside <ThemeProvider>');
  return v;
}

// Inline script that runs before React hydration to set data-theme,
// avoiding a flash of the wrong theme on page load. Inject via
// <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />.
export const THEME_INIT_SCRIPT = `
(function(){try{
  var s = localStorage.getItem('${STORAGE_KEY}');
  var t = s === 'light' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', t);
}catch(e){
  document.documentElement.setAttribute('data-theme', 'dark');
}})();
`.trim();
