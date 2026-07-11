import { LanguageMode, ThemeMode } from "../../types";
import type { TranslationKey } from "../../i18n";

// Shared with ThemeDialog.tsx, which offers the same three options — values
// are translation keys, not literal labels.
export const THEME_MODE_KEY: Record<ThemeMode, TranslationKey> = {
  [ThemeMode.Light]: "menu.themeDialog.light",
  [ThemeMode.Dark]: "menu.themeDialog.dark",
  [ThemeMode.System]: "menu.themeDialog.system",
};

// Shared with LanguageDialog.tsx, which offers the same three options.
export const LANGUAGE_MODE_KEY: Record<LanguageMode, TranslationKey> = {
  [LanguageMode.Russian]: "menu.languageDialog.russian",
  [LanguageMode.English]: "menu.languageDialog.english",
  [LanguageMode.System]: "menu.languageDialog.system",
};
