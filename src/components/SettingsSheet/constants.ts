import { LanguageMode, PointRestoreMode, ThemeMode } from "../../types";
import type { TranslationKey } from "../../i18n";

// Shared with ThemeDialog.tsx, which offers the same three options — values
// are translation keys, not literal labels.
export const THEME_MODE_KEY: Record<ThemeMode, TranslationKey> = {
  [ThemeMode.Light]: "menu.themeDialog.light",
  [ThemeMode.Dark]: "menu.themeDialog.dark",
  [ThemeMode.System]: "menu.themeDialog.system",
};

// Shared with LanguageDialog.tsx, which offers the same eight options.
export const LANGUAGE_MODE_KEY: Record<LanguageMode, TranslationKey> = {
  [LanguageMode.Russian]: "menu.languageDialog.russian",
  [LanguageMode.English]: "menu.languageDialog.english",
  [LanguageMode.German]: "menu.languageDialog.german",
  [LanguageMode.Spanish]: "menu.languageDialog.spanish",
  [LanguageMode.French]: "menu.languageDialog.french",
  [LanguageMode.Turkish]: "menu.languageDialog.turkish",
  [LanguageMode.Portuguese]: "menu.languageDialog.portuguese",
  [LanguageMode.System]: "menu.languageDialog.system",
};

// Shared with SettingsSheet.tsx's row label and PointRestoreModeDialog.tsx,
// which offers the same two options.
export const POINT_RESTORE_MODE_KEY: Record<PointRestoreMode, TranslationKey> = {
  [PointRestoreMode.Auto]: "menu.pointRestoreMode.auto",
  [PointRestoreMode.Manual]: "menu.pointRestoreMode.manual",
};
