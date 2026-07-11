import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";
import {
  AppEvent,
  AppEventType,
  AppStorage,
  ExportedAppData,
  LanguageMode,
  StoredPointState,
  ThemeMode,
} from "../types";
import { POINTS } from "../data/zones";
import {
  DEFAULT_DAYS_TO_WHITE,
  MAX_DAYS_TO_WHITE,
  MIN_DAYS_TO_WHITE,
} from "../constants";

const STORAGE_KEY = "@insulin_shot_tracker_v1";
const MIRROR_KEY = "@insulin_shot_tracker_mirror_v1";
const INTERFACE_LOCKED_KEY = "@insulin_shot_tracker_interface_locked_v1";
const AUTO_LOCK_KEY = "@insulin_shot_tracker_autolock_v1";
const DAYS_TO_WHITE_KEY = "@insulin_shot_tracker_days_to_white_v1";
const THEME_MODE_KEY = "@insulin_shot_tracker_theme_mode_v1";
const LANGUAGE_MODE_KEY = "@insulin_shot_tracker_language_mode_v1";

// Boolean-as-string encoding used for the mirror/interface-locked flags —
// AsyncStorage only stores strings.
const STORED_TRUE = "1";
const STORED_FALSE = "0";

const JSON_MIME_TYPE = "application/json";
const EXPORT_FILE_PREFIX = "insulin-shot-tracker-";
const IOS_JSON_UTI = "public.json";

export const DEFAULT_AUTO_LOCK_AFTER_MARK_SECONDS = 30;
export const DEFAULT_AUTO_LOCK_AFTER_UNLOCK_SECONDS = 5 * 60;

// Persisted auto-lock settings, plus the pending lock deadline (if any) so
// the countdown survives the app being closed and reopened.
export interface StoredAutoLock {
  enabled: boolean;
  afterMarkSeconds: number;
  afterUnlockSeconds: number;
  deadline: number | null;
}

function defaultStorage(): AppStorage {
  const pointStates: Record<string, StoredPointState> = {};
  for (const point of POINTS) {
    pointStates[point.id] = { pointId: point.id, isManuallyBlocked: false };
  }
  return { pointStates, events: [] };
}

// Merge any points not yet present (e.g. loading data saved by an older
// app version, or a file imported from a different point in time).
function normalizeStorage(parsed: Partial<AppStorage>): AppStorage {
  const states = parsed.pointStates ?? {};
  for (const point of POINTS) {
    if (!states[point.id]) {
      states[point.id] = { pointId: point.id, isManuallyBlocked: false };
    }
  }
  return { pointStates: states, events: parsed.events ?? [] };
}

export async function loadStorage(): Promise<AppStorage> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultStorage();
    const parsed = JSON.parse(raw) as AppStorage;
    return normalizeStorage(parsed);
  } catch {
    return defaultStorage();
  }
}

export async function saveStorage(data: AppStorage): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export async function clearStorage(): Promise<AppStorage> {
  const fresh = defaultStorage();
  await saveStorage(fresh);
  return fresh;
}

export async function loadMirrored(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(MIRROR_KEY)) === STORED_TRUE;
  } catch {
    return false;
  }
}

export async function saveMirrored(mirrored: boolean): Promise<void> {
  await AsyncStorage.setItem(MIRROR_KEY, mirrored ? STORED_TRUE : STORED_FALSE);
}

export async function loadInterfaceLocked(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(INTERFACE_LOCKED_KEY)) === STORED_TRUE;
  } catch {
    return false;
  }
}

export async function saveInterfaceLocked(locked: boolean): Promise<void> {
  await AsyncStorage.setItem(INTERFACE_LOCKED_KEY, locked ? STORED_TRUE : STORED_FALSE);
}

function defaultAutoLock(): StoredAutoLock {
  return {
    enabled: false,
    afterMarkSeconds: DEFAULT_AUTO_LOCK_AFTER_MARK_SECONDS,
    afterUnlockSeconds: DEFAULT_AUTO_LOCK_AFTER_UNLOCK_SECONDS,
    deadline: null,
  };
}

export async function loadAutoLock(): Promise<StoredAutoLock> {
  try {
    const raw = await AsyncStorage.getItem(AUTO_LOCK_KEY);
    if (!raw) return defaultAutoLock();
    const parsed = JSON.parse(raw) as Partial<StoredAutoLock>;
    return { ...defaultAutoLock(), ...parsed };
  } catch {
    return defaultAutoLock();
  }
}

export async function saveAutoLock(data: StoredAutoLock): Promise<void> {
  await AsyncStorage.setItem(AUTO_LOCK_KEY, JSON.stringify(data));
}

function clampDaysToWhite(days: number): number {
  return Math.min(MAX_DAYS_TO_WHITE, Math.max(MIN_DAYS_TO_WHITE, days));
}

export async function loadDaysToWhite(): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(DAYS_TO_WHITE_KEY);
    if (!raw) return DEFAULT_DAYS_TO_WHITE;
    return clampDaysToWhite(Number(raw));
  } catch {
    return DEFAULT_DAYS_TO_WHITE;
  }
}

export async function saveDaysToWhite(days: number): Promise<void> {
  await AsyncStorage.setItem(DAYS_TO_WHITE_KEY, String(clampDaysToWhite(days)));
}

const THEME_MODES: ThemeMode[] = Object.values(ThemeMode);

export async function loadThemeMode(): Promise<ThemeMode> {
  try {
    const raw = await AsyncStorage.getItem(THEME_MODE_KEY);
    if (raw && THEME_MODES.includes(raw as ThemeMode)) return raw as ThemeMode;
    return ThemeMode.System;
  } catch {
    return ThemeMode.System;
  }
}

export async function saveThemeMode(mode: ThemeMode): Promise<void> {
  await AsyncStorage.setItem(THEME_MODE_KEY, mode);
}

const LANGUAGE_MODES: LanguageMode[] = Object.values(LanguageMode);

export async function loadLanguageMode(): Promise<LanguageMode> {
  try {
    const raw = await AsyncStorage.getItem(LANGUAGE_MODE_KEY);
    if (raw && LANGUAGE_MODES.includes(raw as LanguageMode))
      return raw as LanguageMode;
    return LanguageMode.System;
  } catch {
    return LanguageMode.System;
  }
}

export async function saveLanguageMode(mode: LanguageMode): Promise<void> {
  await AsyncStorage.setItem(LANGUAGE_MODE_KEY, mode);
}

// ---------------------------------------------------------------------------
// Export / import full app state to/from a JSON file
// ---------------------------------------------------------------------------

const APP_EVENT_TYPES: AppEventType[] = Object.values(AppEventType);

function isValidPointState(value: unknown): value is StoredPointState {
  if (!value || typeof value !== "object") return false;
  const s = value as Partial<StoredPointState>;
  if (typeof s.pointId !== "string") return false;
  if (typeof s.isManuallyBlocked !== "boolean") return false;
  if (s.lastInjectionAt !== undefined && typeof s.lastInjectionAt !== "number")
    return false;
  if (
    s.blackoutStartedAt !== undefined &&
    typeof s.blackoutStartedAt !== "number"
  )
    return false;
  if (
    s.blackoutDurationDays !== undefined &&
    typeof s.blackoutDurationDays !== "number"
  )
    return false;
  return true;
}

function isValidEvent(value: unknown): value is AppEvent {
  if (!value || typeof value !== "object") return false;
  const e = value as Partial<AppEvent>;
  if (typeof e.id !== "string") return false;
  if (typeof e.timestamp !== "number") return false;
  if (
    typeof e.type !== "string" ||
    !APP_EVENT_TYPES.includes(e.type as AppEventType)
  )
    return false;
  if (typeof e.pointId !== "string") return false;
  if (typeof e.zoneId !== "string") return false;
  if (!isValidPointState(e.prevPointState)) return false;
  return true;
}

// Every field is optional — ExportOptionsDialog lets the user write only a
// subset of categories to the file (see ExportedAppData's comment) — so each
// check below only runs when the field is actually present.
function isValidAppStorage(data: unknown): data is ExportedAppData {
  if (!data || typeof data !== "object") return false;
  const candidate = data as Partial<ExportedAppData>;
  if (candidate.pointStates !== undefined) {
    if (typeof candidate.pointStates !== "object") return false;
    if (!Object.values(candidate.pointStates).every(isValidPointState))
      return false;
  }
  if (candidate.events !== undefined) {
    if (!Array.isArray(candidate.events)) return false;
    if (!candidate.events.every(isValidEvent)) return false;
  }
  if (
    candidate.mirrored !== undefined &&
    typeof candidate.mirrored !== "boolean"
  )
    return false;
  if (
    candidate.autoLockEnabled !== undefined &&
    typeof candidate.autoLockEnabled !== "boolean"
  )
    return false;
  if (
    candidate.autoLockAfterMarkSeconds !== undefined &&
    typeof candidate.autoLockAfterMarkSeconds !== "number"
  )
    return false;
  if (
    candidate.autoLockAfterUnlockSeconds !== undefined &&
    typeof candidate.autoLockAfterUnlockSeconds !== "number"
  )
    return false;
  if (
    candidate.daysToWhite !== undefined &&
    typeof candidate.daysToWhite !== "number"
  )
    return false;
  if (
    candidate.themeMode !== undefined &&
    !THEME_MODES.includes(candidate.themeMode)
  )
    return false;
  if (
    candidate.languageMode !== undefined &&
    !LANGUAGE_MODES.includes(candidate.languageMode)
  )
    return false;
  return true;
}

// Writes the full app state to a JSON file in cache and opens the system
// share sheet so the user can pick where on the device to save it.
// `dialogTitle` is pre-formatted by the caller (via t('menu.exportOptionsDialog.shareDialogTitle'))
// since this module stays free of an i18next dependency, like stateMachine.ts.
export async function exportStorageToFile(
  data: ExportedAppData,
  dialogTitle: string,
): Promise<void> {
  const dateStamp = new Date().toISOString().slice(0, 10);
  const fileUri = `${FileSystem.cacheDirectory}${EXPORT_FILE_PREFIX}${dateStamp}.json`;
  await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(data, null, 2));

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(fileUri, {
      mimeType: JSON_MIME_TYPE,
      dialogTitle,
      UTI: IOS_JSON_UTI,
    });
  }
}

export enum ImportResultType {
  Success = "success",
  Cancelled = "cancelled",
  Invalid = "invalid",
}

export type ImportResult =
  | { type: ImportResultType.Success; data: ExportedAppData }
  | { type: ImportResultType.Cancelled }
  | { type: ImportResultType.Invalid };

// Lets the user pick a JSON file from the device and parses/validates it.
// Does not touch AsyncStorage — the caller decides whether/when to apply it.
// Missing fields are left absent (not defaulted) so the caller can tell a
// category that was deliberately excluded from the export apart from one
// that was included with a default value — see ExportedAppData's comment.
export async function pickImportFile(): Promise<ImportResult> {
  const picked = await DocumentPicker.getDocumentAsync({
    type: JSON_MIME_TYPE,
    copyToCacheDirectory: true,
  });
  if (picked.canceled || picked.assets.length === 0)
    return { type: ImportResultType.Cancelled };

  try {
    const raw = await FileSystem.readAsStringAsync(picked.assets[0].uri);
    const parsed = JSON.parse(raw);
    if (!isValidAppStorage(parsed)) return { type: ImportResultType.Invalid };

    const data: ExportedAppData = { ...parsed };
    if (data.pointStates !== undefined) {
      const normalized = normalizeStorage({
        pointStates: data.pointStates,
        events: data.events ?? [],
      });
      data.pointStates = normalized.pointStates;
      data.events = normalized.events;
    }
    if (data.daysToWhite !== undefined) {
      data.daysToWhite = clampDaysToWhite(data.daysToWhite);
    }
    return { type: ImportResultType.Success, data };
  } catch {
    return { type: ImportResultType.Invalid };
  }
}

// Persists only the categories present in `data`, leaving any omitted
// category's stored value untouched — the merge-import counterpart to
// ExportOptionsDialog's selective export.
export async function importStorage(data: ExportedAppData): Promise<void> {
  if (data.pointStates !== undefined && data.events !== undefined) {
    await saveStorage({ pointStates: data.pointStates, events: data.events });
  }
  if (data.mirrored !== undefined) {
    await saveMirrored(data.mirrored);
  }
}
