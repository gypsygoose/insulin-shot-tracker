export enum ZoneGroup {
  Thighs = 'thighs',
  ShouldersAndBelly = 'shoulders-and-belly',
}

export enum ButtonColor {
  White = 'white',
  Maroon = 'maroon',
  Red = 'red',
  DarkOrange = 'dark-orange',
  Orange = 'orange',
  DarkYellow = 'dark-yellow',
  Yellow = 'yellow',
  DarkGreen = 'dark-green',
  Green = 'green',
  Black = 'black',
  Gray = 'gray',
}

export enum ZoneId {
  ShoulderRight = 'shoulder-right',
  ShoulderLeft = 'shoulder-left',
  BellyRight = 'belly-right',
  BellyLeft = 'belly-left',
  ThighRight = 'thigh-right',
  ThighLeft = 'thigh-left',
}

// Left/right zones of the same body part share one accent/glow colour pair
// (see ZONE_TYPE in data/zones.ts and ThemeColors.zoneColors in
// theme/palette.ts) — this groups them for that lookup, distinct from
// ZoneGroup above (which groups by checkmark-sharing behaviour instead).
export enum ZoneType {
  Shoulder = 'shoulder',
  Belly = 'belly',
  Thigh = 'thigh',
}

export interface Zone {
  id: ZoneId;
  group: ZoneGroup;
}

export interface ButtonDefinition {
  id: string;
  zoneId: ZoneId;
}

// Zone container layout: position + size as fraction of the body image
// container (0..1), plus the button grid dimensions inside it.
export interface ZoneLayout {
  x: number;
  y: number;
  width: number;
  height: number;
  rows: number;
  cols: number;
}

// Body-relative "address" of a button — see BUTTON_ADDRESS in data/zones.ts.
export interface ButtonAddress {
  row: number;
  column: number;
}

// Persisted per-button state
export interface StoredButtonState {
  buttonId: string;
  lastInjectionAt?: number;
  blackoutStartedAt?: number;
  blackoutDurationDays?: number;
  isManuallyBlocked: boolean;
  manuallyBlockedAt?: number;
}

// Event in undo history
export enum AppEventType {
  Injection = 'injection',
  Blackout = 'blackout',
  ManualBlock = 'manual-block',
  ManualUnblock = 'manual-unblock',
  ManualClear = 'manual-clear',
}

export enum AutoLockDialogMode {
  Enable = 'enable',
  Edit = 'edit',
}

// App chrome theme — System resolves to the OS appearance at render time
// (see src/theme/ThemeContext.tsx); Light/Dark pin a specific palette.
export enum ThemeMode {
  Light = 'light',
  Dark = 'dark',
  System = 'system',
}

// App interface language — System resolves to the device locale at render
// time (see src/i18n/LanguageContext.tsx); Russian/English pin a specific
// language. Values double as the corresponding i18next language codes.
export enum LanguageMode {
  System = 'system',
  Russian = 'ru',
  English = 'en',
}

// Toast severity — drives the toast's accent color and leading icon (see
// Toast.tsx / src/components/icons/Toast*Icon.tsx).
export enum ToastStatus {
  Info = 'info',
  Warn = 'warn',
  Success = 'success',
  Error = 'error',
}

export interface AppEvent {
  id: string;
  timestamp: number;
  type: AppEventType;
  buttonId: string;
  zoneId: ZoneId;
  prevButtonState: StoredButtonState;
}

// Full app storage
export interface AppStorage {
  buttonStates: Record<string, StoredButtonState>;
  events: AppEvent[];
}

// Full app state as written to / read from an export file — includes
// settings (like mirror mode) that live outside AppStorage in AsyncStorage.
// All fields are optional: ExportOptionsDialog lets the user pick which
// categories to write, so a file may carry only a subset. On import, a
// missing field means "leave this category untouched" (see
// storage.ts#importStorage / useAppStore#applyImport), not "reset to
// default" — so fields must never be defaulted away during export/import.
export interface ExportedAppData {
  buttonStates?: Record<string, StoredButtonState>;
  events?: AppEvent[];
  mirrored?: boolean;
  autoLockEnabled?: boolean;
  autoLockAfterMarkSeconds?: number;
  autoLockAfterUnlockSeconds?: number;
  daysToWhite?: number;
  themeMode?: ThemeMode;
  languageMode?: LanguageMode;
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
}

export interface ExportSelection {
  marks: boolean;
  settings: Record<ExportSettingKey, boolean>;
}
