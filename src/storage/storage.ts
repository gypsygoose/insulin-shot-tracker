import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";
import {
  AppEvent,
  AppEventType,
  AppStorage,
  ExportedAppData,
  StoredButtonState,
} from "../types";
import { BUTTONS } from "../data/zones";
import { APP_NAME } from "../constants";

const STORAGE_KEY = "@t1d_shot_v1";
const MIRROR_KEY = "@t1d_shot_mirror_v1";
const INTERFACE_LOCKED_KEY = "@t1d_shot_interface_locked_v1";
const AUTO_LOCK_KEY = "@t1d_shot_autolock_v1";

// Boolean-as-string encoding used for the mirror/interface-locked flags —
// AsyncStorage only stores strings.
const STORED_TRUE = "1";
const STORED_FALSE = "0";

const JSON_MIME_TYPE = "application/json";
const EXPORT_FILE_PREFIX = "t1d-shot-";
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
  const buttonStates: Record<string, StoredButtonState> = {};
  for (const btn of BUTTONS) {
    buttonStates[btn.id] = { buttonId: btn.id, isManuallyBlocked: false };
  }
  return { buttonStates, events: [] };
}

// Merge any buttons not yet present (e.g. loading data saved by an older
// app version, or a file imported from a different point in time).
function normalizeStorage(parsed: Partial<AppStorage>): AppStorage {
  const states = parsed.buttonStates ?? {};
  for (const btn of BUTTONS) {
    if (!states[btn.id]) {
      states[btn.id] = { buttonId: btn.id, isManuallyBlocked: false };
    }
  }
  return { buttonStates: states, events: parsed.events ?? [] };
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

// ---------------------------------------------------------------------------
// Export / import full app state to/from a JSON file
// ---------------------------------------------------------------------------

const APP_EVENT_TYPES: AppEventType[] = Object.values(AppEventType);

function isValidButtonState(value: unknown): value is StoredButtonState {
  if (!value || typeof value !== "object") return false;
  const s = value as Partial<StoredButtonState>;
  if (typeof s.buttonId !== "string") return false;
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
  if (typeof e.buttonId !== "string") return false;
  if (typeof e.zoneId !== "string") return false;
  if (!isValidButtonState(e.prevButtonState)) return false;
  return true;
}

function isValidAppStorage(data: unknown): data is ExportedAppData {
  if (!data || typeof data !== "object") return false;
  const candidate = data as Partial<ExportedAppData>;
  if (!candidate.buttonStates || typeof candidate.buttonStates !== "object")
    return false;
  if (!Object.values(candidate.buttonStates).every(isValidButtonState))
    return false;
  if (!Array.isArray(candidate.events)) return false;
  if (!candidate.events.every(isValidEvent)) return false;
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
  return true;
}

// Writes the full app state to a JSON file in cache and opens the system
// share sheet so the user can pick where on the device to save it.
export async function exportStorageToFile(
  data: ExportedAppData,
): Promise<void> {
  const dateStamp = new Date().toISOString().slice(0, 10);
  const fileUri = `${FileSystem.cacheDirectory}${EXPORT_FILE_PREFIX}${dateStamp}.json`;
  await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(data, null, 2));

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(fileUri, {
      mimeType: JSON_MIME_TYPE,
      dialogTitle: `Экспорт данных ${APP_NAME}`,
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
    const normalized = normalizeStorage(parsed);
    return {
      type: ImportResultType.Success,
      data: {
        ...normalized,
        mirrored: parsed.mirrored ?? false,
        autoLockEnabled: parsed.autoLockEnabled ?? false,
        autoLockAfterMarkSeconds:
          parsed.autoLockAfterMarkSeconds ??
          DEFAULT_AUTO_LOCK_AFTER_MARK_SECONDS,
        autoLockAfterUnlockSeconds:
          parsed.autoLockAfterUnlockSeconds ??
          DEFAULT_AUTO_LOCK_AFTER_UNLOCK_SECONDS,
      },
    };
  } catch {
    return { type: ImportResultType.Invalid };
  }
}

export async function importStorage(data: ExportedAppData): Promise<void> {
  await saveStorage({ buttonStates: data.buttonStates, events: data.events });
  await saveMirrored(data.mirrored);
}
