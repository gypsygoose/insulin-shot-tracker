import {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useColorScheme } from "react-native";
import { ThemeMode } from "../types";
import { StorageService } from "../storage";
import { DARK_COLORS, LIGHT_COLORS } from "./palette";
import { ThemeContextValue } from "./types";
import { resolveScheme } from "./utils";

export const ThemeContext = createContext<ThemeContextValue | null>(null);

// Owns the persisted ThemeMode setting end to end (its own AsyncStorage key,
// same pattern as mirrored/autoLock*/daysToWhite) and resolves it against
// the live OS appearance. Mounted once in App.tsx, above MainScreen, so
// every screen — including MainScreen's own loading state — reads colors
// through useTheme() instead of each caller re-resolving the theme itself.
export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>(ThemeMode.System);

  useEffect(() => {
    StorageService.loadThemeMode().then(setModeState);
  }, []);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    StorageService.saveThemeMode(next);
  }, []);

  const value = useMemo<ThemeContextValue>(() => {
    const resolvedScheme = resolveScheme(mode, systemScheme);
    return {
      mode,
      resolvedScheme,
      colors: resolvedScheme === ThemeMode.Light ? LIGHT_COLORS : DARK_COLORS,
      setMode,
    };
  }, [mode, systemScheme, setMode]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
