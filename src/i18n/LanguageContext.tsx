import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { LanguageMode } from "../types";
import { loadLanguageMode, saveLanguageMode } from "../storage/storage";
import { i18next } from "./index";
import { getDeviceLanguage, ResolvedLanguage } from "./deviceLanguage";

interface LanguageContextValue {
  mode: LanguageMode;
  resolvedLanguage: ResolvedLanguage;
  setMode: (mode: LanguageMode) => Promise<void>;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function resolveLanguage(mode: LanguageMode): ResolvedLanguage {
  if (mode !== LanguageMode.System) return mode;
  return getDeviceLanguage();
}

// Owns the persisted LanguageMode setting end to end (its own AsyncStorage
// key, same pattern as ThemeMode — see src/theme/ThemeContext.tsx) and
// resolves it against the device locale, applying the result to the i18next
// singleton so every useTranslation() consumer re-renders. Mounted once in
// App.tsx, above MainScreen. Device-locale resolution is read once per mode
// change rather than subscribed to live OS locale changes — unlike
// light/dark, a locale change mid-session is effectively never observed in
// practice, so the extra plumbing isn't worth it here.
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<LanguageMode>(LanguageMode.System);

  useEffect(() => {
    loadLanguageMode().then((loadedMode) => {
      setModeState(loadedMode);
      i18next.changeLanguage(resolveLanguage(loadedMode));
    });
  }, []);

  const setMode = useCallback(async (next: LanguageMode) => {
    setModeState(next);
    saveLanguageMode(next);
    await i18next.changeLanguage(resolveLanguage(next));
  }, []);

  const value = useMemo<LanguageContextValue>(
    () => ({ mode, resolvedLanguage: resolveLanguage(mode), setMode }),
    [mode, setMode],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx)
    throw new Error("useLanguage() must be used within a LanguageProvider");
  return ctx;
}
