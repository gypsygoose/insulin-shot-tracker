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

export interface Zone {
  id: ZoneId;
  label: string;
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
export interface ExportedAppData extends AppStorage {
  mirrored: boolean;
  autoLockEnabled: boolean;
  autoLockAfterMarkSeconds: number;
  autoLockAfterUnlockSeconds: number;
  daysToWhite: number;
}
