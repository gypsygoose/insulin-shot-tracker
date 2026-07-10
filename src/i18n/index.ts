import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import { ru } from "./locales/ru";
import { en } from "./locales/en";
import type { AppLocale } from "./locales/en";
import { getDeviceLanguage } from "./deviceLanguage";

export const resources = {
  ru: { translation: ru },
  en: { translation: en },
};

// Dot-path union of every leaf key in en.ts (e.g. "menu.themeRow") — used to
// type Record<SomeEnum, TranslationKey> lookup maps (ZONE_LABEL_KEY,
// THEME_MODE_KEY, ...) so a value pulled from one and handed to t() stays
// checked against the real key set, the same as a literal t('...') call.
type LeafPaths<T, Prefix extends string = ""> = {
  [K in keyof T & string]: T[K] extends string
    ? `${Prefix}${K}`
    : LeafPaths<T[K], `${Prefix}${K}.`>;
}[keyof T & string];

export type TranslationKey = LeafPaths<AppLocale>;

// Best-guess language before LanguageProvider applies the persisted
// LanguageMode override on mount (see src/i18n/LanguageContext.tsx) — reading
// the device locale synchronously here avoids a flash of the wrong language
// on first render in the common case (no override saved yet).
i18next.use(initReactI18next).init({
  resources,
  lng: getDeviceLanguage(),
  fallbackLng: "ru",
  interpolation: { escapeValue: false },
});

export { i18next };
