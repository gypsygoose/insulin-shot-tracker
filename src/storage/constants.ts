import { LanguageMode, ThemeMode } from "../types";

export const STORAGE_KEY = "@insulin_shot_tracker_v1";
export const MIRROR_KEY = "@insulin_shot_tracker_mirror_v1";
export const INTERFACE_LOCKED_KEY = "@insulin_shot_tracker_interface_locked_v1";
export const AUTO_LOCK_KEY = "@insulin_shot_tracker_autolock_v1";
export const DAYS_TO_WHITE_KEY = "@insulin_shot_tracker_days_to_white_v1";
export const THEME_MODE_KEY = "@insulin_shot_tracker_theme_mode_v1";
export const LANGUAGE_MODE_KEY = "@insulin_shot_tracker_language_mode_v1";

// Boolean-as-string encoding used for the mirror/interface-locked flags —
// AsyncStorage only stores strings.
export const STORED_TRUE = "1";
export const STORED_FALSE = "0";

export const JSON_MIME_TYPE = "application/json";
export const EXPORT_FILE_PREFIX = "insulin-shot-tracker-";
export const IOS_JSON_UTI = "public.json";

export const THEME_MODES: ThemeMode[] = Object.values(ThemeMode);
export const LANGUAGE_MODES: LanguageMode[] = Object.values(LanguageMode);
