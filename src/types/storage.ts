import { AppEvent } from './event';
import { StoredPointState } from './point';
import { ThemeMode } from './theme';
import { LanguageMode } from './language';
import { EnabledZones, ZonePointCounts } from './zone';
import { PointRestoreMode } from './pointRestoreMode';

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
  daysToAvailable?: number;
  themeMode?: ThemeMode;
  languageMode?: LanguageMode;
  zonePointCounts?: ZonePointCounts;
  enabledZones?: EnabledZones;
  pointRestoreMode?: PointRestoreMode;
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
  EnabledZones = 'enabled-zones',
  ZonePointCounts = 'zone-point-counts',
  PointRestoreMode = 'point-restore-mode',
  DaysToWhite = 'days-to-white',
  DaysToAvailable = 'days-to-available',
  Language = 'language',
  Theme = 'theme',
}

// Which sub-category of injection point marks ExportOptionsDialog writes to
// the export file — mirrors ExportSettingKey's role for the settings group,
// but partitions pointStates/events by StoredPointState.isManuallyBlocked
// instead of gating independent scalar fields. See "Selective export /
// merge import" in CLAUDE.md.
export enum ExportMarksKey {
  ActivePoints = 'active-points',
  BlockedPoints = 'blocked-points',
}

export interface ExportSelection {
  marks: Record<ExportMarksKey, boolean>;
  settings: Record<ExportSettingKey, boolean>;
}
