export type ZoneGroup = 'thighs' | 'shoulders-and-belly';

export type ButtonColor =
  | 'white'
  | 'maroon'
  | 'red'
  | 'dark-orange'
  | 'orange'
  | 'dark-yellow'
  | 'yellow'
  | 'dark-green'
  | 'green'
  | 'black'
  | 'gray';

export interface Zone {
  id: string;
  label: string;
  group: ZoneGroup;
}

export interface ButtonDefinition {
  id: string;
  zoneId: string;
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
export type AppEventType = 'injection' | 'blackout' | 'manual-block' | 'manual-unblock' | 'manual-clear';

export interface AppEvent {
  id: string;
  timestamp: number;
  type: AppEventType;
  buttonId: string;
  zoneId: string;
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
}
