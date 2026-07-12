import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";
import {
  AppStorage,
  EnabledZones,
  ExportedAppData,
  LanguageMode,
  PointDefinition,
  ThemeMode,
  ZonePointCounts,
} from "../types";
import { DEFAULT_DAYS_TO_WHITE } from "../constants";
import { DEFAULT_ZONE_POINT_COUNTS, DEFAULT_ENABLED_ZONES } from "../data";
import {
  defaultStorage,
  normalizeStorage,
  defaultAutoLock,
  DEFAULT_AUTO_LOCK_AFTER_MARK_SECONDS,
  DEFAULT_AUTO_LOCK_AFTER_UNLOCK_SECONDS,
  clampDaysToWhite,
  clampZonePointCounts,
  clampEnabledZones,
  isValidAppStorage,
} from "./utils";
import {
  STORAGE_KEY,
  MIRROR_KEY,
  INTERFACE_LOCKED_KEY,
  AUTO_LOCK_KEY,
  DAYS_TO_WHITE_KEY,
  THEME_MODE_KEY,
  LANGUAGE_MODE_KEY,
  ZONE_POINT_COUNTS_KEY,
  ENABLED_ZONES_KEY,
  STORED_TRUE,
  STORED_FALSE,
  JSON_MIME_TYPE,
  EXPORT_FILE_PREFIX,
  IOS_JSON_UTI,
  THEME_MODES,
  LANGUAGE_MODES,
} from "./constants";
import { ImportResult, ImportResultType, StoredAutoLock } from "./types";

export { DEFAULT_AUTO_LOCK_AFTER_MARK_SECONDS, DEFAULT_AUTO_LOCK_AFTER_UNLOCK_SECONDS };

// AsyncStorage load/save/clear + export/import — every method is static, so
// callers reach it as StorageService.loadStorage() etc. without needing to
// create/thread an instance (see CLAUDE.md's "Helper function / hook
// placement" — this stays the module's public API, same role storage.ts's
// standalone functions used to serve).
export class StorageService {
  static async loadStorage(activePoints: PointDefinition[]): Promise<AppStorage> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultStorage(activePoints);
      const parsed = JSON.parse(raw) as AppStorage;
      return normalizeStorage(parsed, activePoints);
    } catch {
      return defaultStorage(activePoints);
    }
  }

  static async saveStorage(data: AppStorage): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  static async clearStorage(activePoints: PointDefinition[]): Promise<AppStorage> {
    const fresh = defaultStorage(activePoints);
    await StorageService.saveStorage(fresh);
    return fresh;
  }

  static async loadMirrored(): Promise<boolean> {
    try {
      return (await AsyncStorage.getItem(MIRROR_KEY)) === STORED_TRUE;
    } catch {
      return false;
    }
  }

  static async saveMirrored(mirrored: boolean): Promise<void> {
    await AsyncStorage.setItem(MIRROR_KEY, mirrored ? STORED_TRUE : STORED_FALSE);
  }

  static async loadInterfaceLocked(): Promise<boolean> {
    try {
      return (await AsyncStorage.getItem(INTERFACE_LOCKED_KEY)) === STORED_TRUE;
    } catch {
      return false;
    }
  }

  static async saveInterfaceLocked(locked: boolean): Promise<void> {
    await AsyncStorage.setItem(INTERFACE_LOCKED_KEY, locked ? STORED_TRUE : STORED_FALSE);
  }

  static async loadAutoLock(): Promise<StoredAutoLock> {
    try {
      const raw = await AsyncStorage.getItem(AUTO_LOCK_KEY);
      if (!raw) return defaultAutoLock();
      const parsed = JSON.parse(raw) as Partial<StoredAutoLock>;
      return { ...defaultAutoLock(), ...parsed };
    } catch {
      return defaultAutoLock();
    }
  }

  static async saveAutoLock(data: StoredAutoLock): Promise<void> {
    await AsyncStorage.setItem(AUTO_LOCK_KEY, JSON.stringify(data));
  }

  static async loadDaysToWhite(): Promise<number> {
    try {
      const raw = await AsyncStorage.getItem(DAYS_TO_WHITE_KEY);
      if (!raw) return DEFAULT_DAYS_TO_WHITE;
      return clampDaysToWhite(Number(raw));
    } catch {
      return DEFAULT_DAYS_TO_WHITE;
    }
  }

  static async saveDaysToWhite(days: number): Promise<void> {
    await AsyncStorage.setItem(DAYS_TO_WHITE_KEY, String(clampDaysToWhite(days)));
  }

  static async loadThemeMode(): Promise<ThemeMode> {
    try {
      const raw = await AsyncStorage.getItem(THEME_MODE_KEY);
      if (raw && THEME_MODES.includes(raw as ThemeMode)) return raw as ThemeMode;
      return ThemeMode.System;
    } catch {
      return ThemeMode.System;
    }
  }

  static async saveThemeMode(mode: ThemeMode): Promise<void> {
    await AsyncStorage.setItem(THEME_MODE_KEY, mode);
  }

  static async loadLanguageMode(): Promise<LanguageMode> {
    try {
      const raw = await AsyncStorage.getItem(LANGUAGE_MODE_KEY);
      if (raw && LANGUAGE_MODES.includes(raw as LanguageMode))
        return raw as LanguageMode;
      return LanguageMode.System;
    } catch {
      return LanguageMode.System;
    }
  }

  static async saveLanguageMode(mode: LanguageMode): Promise<void> {
    await AsyncStorage.setItem(LANGUAGE_MODE_KEY, mode);
  }

  static async loadZonePointCounts(): Promise<ZonePointCounts> {
    try {
      const raw = await AsyncStorage.getItem(ZONE_POINT_COUNTS_KEY);
      if (!raw) return DEFAULT_ZONE_POINT_COUNTS;
      return clampZonePointCounts(JSON.parse(raw));
    } catch {
      return DEFAULT_ZONE_POINT_COUNTS;
    }
  }

  static async saveZonePointCounts(data: ZonePointCounts): Promise<void> {
    await AsyncStorage.setItem(
      ZONE_POINT_COUNTS_KEY,
      JSON.stringify(clampZonePointCounts(data)),
    );
  }

  static async loadEnabledZones(): Promise<EnabledZones> {
    try {
      const raw = await AsyncStorage.getItem(ENABLED_ZONES_KEY);
      if (!raw) return DEFAULT_ENABLED_ZONES;
      return clampEnabledZones(JSON.parse(raw));
    } catch {
      return DEFAULT_ENABLED_ZONES;
    }
  }

  static async saveEnabledZones(data: EnabledZones): Promise<void> {
    await AsyncStorage.setItem(
      ENABLED_ZONES_KEY,
      JSON.stringify(clampEnabledZones(data)),
    );
  }

  // ---------------------------------------------------------------------
  // Export / import full app state to/from a JSON file
  // ---------------------------------------------------------------------

  // Writes the full app state to a JSON file in cache and opens the system
  // share sheet so the user can pick where on the device to save it.
  // `dialogTitle` is pre-formatted by the caller (via t('menu.exportOptionsDialog.shareDialogTitle'))
  // since this module stays free of an i18next dependency, like PointService.ts.
  static async exportStorageToFile(
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

  // Lets the user pick a JSON file from the device and parses/validates it.
  // Does not touch AsyncStorage — the caller decides whether/when to apply it.
  // Missing fields are left absent (not defaulted) so the caller can tell a
  // category that was deliberately excluded from the export apart from one
  // that was included with a default value — see ExportedAppData's comment.
  static async pickImportFile(
    activePoints: PointDefinition[],
  ): Promise<ImportResult> {
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
        const normalized = normalizeStorage(
          {
            pointStates: data.pointStates,
            events: data.events ?? [],
          },
          activePoints,
        );
        data.pointStates = normalized.pointStates;
        data.events = normalized.events;
      }
      if (data.daysToWhite !== undefined) {
        data.daysToWhite = clampDaysToWhite(data.daysToWhite);
      }
      if (data.zonePointCounts !== undefined) {
        data.zonePointCounts = clampZonePointCounts(data.zonePointCounts);
      }
      if (data.enabledZones !== undefined) {
        data.enabledZones = clampEnabledZones(data.enabledZones);
      }
      return { type: ImportResultType.Success, data };
    } catch {
      return { type: ImportResultType.Invalid };
    }
  }

  // Persists only the categories present in `data`, leaving any omitted
  // category's stored value untouched — the merge-import counterpart to
  // ExportOptionsDialog's selective export.
  static async importStorage(data: ExportedAppData): Promise<void> {
    if (data.pointStates !== undefined && data.events !== undefined) {
      await StorageService.saveStorage({
        pointStates: data.pointStates,
        events: data.events,
      });
    }
    if (data.mirrored !== undefined) {
      await StorageService.saveMirrored(data.mirrored);
    }
  }
}
