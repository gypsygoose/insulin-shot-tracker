import { AppEvent } from './event';
import { StoredPointState } from './point';
import { ThemeMode } from './theme';
import { LanguageMode } from './language';
import { EnabledZones, ZonePointCounts } from './zone';

// Full app storage
export interface AppStorage {
  pointStates: Record<string, StoredPointState>;
  events: AppEvent[];
}

// Full app state as written to / read from an export file — includes
// settings (like mirror mode) that live outside AppStorage in AsyncStorage.
// All fields are optional: ExportOptionsDialog lets the user pick which
// categories to write, so a file may carry only a subset. On import, a
// missing field means "leave this category untouched" (see
// StorageService.importStorage / useAppStore#applyImport), not "reset to
// default" — so fields must never be defaulted away during export/import.
export interface ExportedAppData {
  pointStates?: Record<string, StoredPointState>;
  events?: AppEvent[];
  mirrored?: boolean;
  autoLockEnabled?: boolean;
  autoLockAfterMarkSeconds?: number;
  autoLockAfterUnlockSeconds?: number;
  daysToWhite?: number;
  themeMode?: ThemeMode;
  languageMode?: LanguageMode;
  zonePointCounts?: ZonePointCounts;
  enabledZones?: EnabledZones;
}

// Which categories ExportOptionsDialog writes to the export file. The
// "app settings" group is an accordion of individually-toggleable rows,
// mirrored 1:1 by the export/import logic in storage.ts. The same enum (and
// ExportSelection below) is reused by ImportOptionsDialog to pick which of
// the categories present in an imported file to actually apply — there, a
// key not present in the file is forced unchecked and disabled rather than
// user-selectable.
export enum ExportSettingKey {
  Mirrored = 'mirrored',
  AutoLock = 'auto-lock',
  DaysToWhite = 'days-to-white',
  Theme = 'theme',
  Language = 'language',
  ZonePointCounts = 'zone-point-counts',
  EnabledZones = 'enabled-zones',
}

export interface ExportSelection {
  marks: boolean;
  settings: Record<ExportSettingKey, boolean>;
}
