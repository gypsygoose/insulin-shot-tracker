import * as Localization from "expo-localization";
import { LanguageMode } from "../../types";

export type ResolvedLanguage =
  | LanguageMode.Russian
  | LanguageMode.English
  | LanguageMode.Spanish
  | LanguageMode.German
  | LanguageMode.French
  | LanguageMode.Turkish
  | LanguageMode.Portuguese;

// Every device languageCode that maps to a supported ResolvedLanguage other
// than the English fallback below.
const DEVICE_LANGUAGE_CODE_MODE: Record<string, ResolvedLanguage> = {
  ru: LanguageMode.Russian,
  es: LanguageMode.Spanish,
  de: LanguageMode.German,
  fr: LanguageMode.French,
  tr: LanguageMode.Turkish,
  pt: LanguageMode.Portuguese,
};

// getLocales() returns every preferred-language entry the device reports,
// most-preferred first — devices/simulators commonly list English as a
// fallback entry even when the primary language is Russian, so only the
// first (top-priority) entry should decide "System". Shared by index.ts's
// initial best-guess and LanguageContext.tsx's System-mode resolution so the
// two can't drift out of sync. A device language outside the supported set
// falls back to English.
export function getDeviceLanguage(): ResolvedLanguage {
  const primaryLanguageCode = Localization.getLocales()[0]?.languageCode;
  return (
    (primaryLanguageCode && DEVICE_LANGUAGE_CODE_MODE[primaryLanguageCode]) ||
    LanguageMode.English
  );
}
