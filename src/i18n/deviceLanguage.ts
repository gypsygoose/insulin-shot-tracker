import * as Localization from "expo-localization";
import { LanguageMode } from "../types";

export type ResolvedLanguage = LanguageMode.Russian | LanguageMode.English;

// getLocales() returns every preferred-language entry the device reports,
// most-preferred first — devices/simulators commonly list English as a
// fallback entry even when the primary language is Russian, so only the
// first (top-priority) entry should decide "System". Shared by index.ts's
// initial best-guess and LanguageContext.tsx's System-mode resolution so the
// two can't drift out of sync.
export function getDeviceLanguage(): ResolvedLanguage {
  const primaryLanguageCode = Localization.getLocales()[0]?.languageCode;
  return primaryLanguageCode === "en"
    ? LanguageMode.English
    : LanguageMode.Russian;
}
