import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import { ru, en, es, de, fr, tr, pt } from "./locales";
import { getDeviceLanguage } from "./utils";

export const resources = {
  ru: { translation: ru },
  en: { translation: en },
  es: { translation: es },
  de: { translation: de },
  fr: { translation: fr },
  tr: { translation: tr },
  pt: { translation: pt },
};

// Defined in ./types (not here) so data/zones.ts can import it without a
// cycle back through this file's own "./hooks" re-export below — see the
// comment on TranslationKey in ./types for why.
export type { TranslationKey } from "./types";

// Best-guess language before LanguageProvider applies the persisted
// LanguageMode override on mount (see src/i18n/LanguageContext.tsx) — reading
// the device locale synchronously here avoids a flash of the wrong language
// on first render in the common case (no override saved yet).
i18next.use(initReactI18next).init({
  resources,
  lng: getDeviceLanguage(),
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export { i18next };
export * from "./hooks";
