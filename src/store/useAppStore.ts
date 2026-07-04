import { useState, useEffect, useCallback, useRef } from 'react';
import { AppStorage, AppEvent, ExportedAppData, StoredButtonState, ZoneGroup } from '../types';
import {
  loadStorage,
  saveStorage,
  clearStorage,
  loadMirrored,
  saveMirrored,
  exportStorageToFile,
  pickImportFile as pickImportFileFromDisk,
  importStorage,
  ImportResult,
} from '../storage/storage';
import { onPress } from '../logic/stateMachine';
import { BUTTON_MAP, ZONE_MAP } from '../data/zones';
function uuid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

export interface AppState extends AppStorage {
  now: number;
  isLoaded: boolean;
  mirrored: boolean;
}

export interface AppActions {
  pressButton(buttonId: string): void;
  blockButton(buttonId: string): void;
  unblockButton(buttonId: string): void;
  markButtonAt(buttonId: string, timestamp: number): void;
  clearButton(buttonId: string): void;
  undo(): void;
  clearAll(): void;
  setMirrored(mirrored: boolean): void;
  exportData(): Promise<void>;
  pickImportFile(): Promise<ImportResult>;
  applyImport(data: ExportedAppData): void;
}

// Derive checked buttonId per group: the button with the latest press date
// (lastInjectionAt or blackoutStartedAt, whichever is more recent) in that
// group. Based on actual timestamps rather than event-log order, so a
// backdated entry (via markButtonAt) never wins over a genuinely more recent
// press just because it was recorded later.
function lastPressedByGroup(
  buttonStates: Record<string, StoredButtonState>,
): Record<ZoneGroup, string | null> {
  const result: Record<ZoneGroup, string | null> = {
    thighs: null,
    'shoulders-and-belly': null,
  };
  const bestTime: Record<ZoneGroup, number> = {
    thighs: -Infinity,
    'shoulders-and-belly': -Infinity,
  };
  for (const buttonId in buttonStates) {
    const btnState = buttonStates[buttonId];
    const btn = BUTTON_MAP[buttonId];
    if (!btn) continue;
    const zone = ZONE_MAP[btn.zoneId];
    if (!zone) continue;
    const time = Math.max(
      btnState.lastInjectionAt ?? -Infinity,
      btnState.blackoutStartedAt ?? -Infinity,
    );
    if (time === -Infinity) continue;
    if (time > bestTime[zone.group]) {
      bestTime[zone.group] = time;
      result[zone.group] = buttonId;
    }
  }
  return result;
}

export function useAppStore(): [AppState & { lastInGroup: Record<ZoneGroup, string | null> }, AppActions] {
  const [state, setState] = useState<AppState>({
    buttonStates: {},
    events: [],
    now: Date.now(),
    isLoaded: false,
    mirrored: false,
  });
  const saveRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load from storage on mount
  useEffect(() => {
    loadStorage().then((stored) => {
      setState((prev) => ({ ...prev, ...stored, isLoaded: true }));
    });
    loadMirrored().then((mirrored) => {
      setState((prev) => ({ ...prev, mirrored }));
    });
  }, []);

  // Tick now every 60 s
  useEffect(() => {
    const id = setInterval(() => {
      setState((prev) => ({ ...prev, now: Date.now() }));
    }, 60_000);
    return () => clearInterval(id);
  }, []);

  // Debounced persist to AsyncStorage
  function scheduleSave(nextState: AppStorage) {
    if (saveRef.current) clearTimeout(saveRef.current);
    saveRef.current = setTimeout(() => saveStorage(nextState), 300);
  }

  const pressButton = useCallback((buttonId: string) => {
    setState((prev) => {
      const now = Date.now();
      const btn = BUTTON_MAP[buttonId];
      if (!btn) return prev;

      const currentBtnState = prev.buttonStates[buttonId];
      const result = onPress(currentBtnState, now);
      if (result.kind === 'blocked') return prev;

      const event: AppEvent = {
        id: uuid(),
        timestamp: now,
        type: result.kind,
        buttonId,
        zoneId: btn.zoneId,
        prevButtonState: { ...currentBtnState },
      };

      const nextButtonStates = {
        ...prev.buttonStates,
        [buttonId]: result.newState,
      };
      const nextEvents = [...prev.events, event];
      const next: AppStorage = { buttonStates: nextButtonStates, events: nextEvents };
      scheduleSave(next);
      return { ...prev, ...next, now };
    });
  }, []);

  const blockButton = useCallback((buttonId: string) => {
    setState((prev) => {
      const now = Date.now();
      const btn = BUTTON_MAP[buttonId];
      if (!btn) return prev;

      const currentBtnState = prev.buttonStates[buttonId];
      const newBtnState: StoredButtonState = {
        ...currentBtnState,
        buttonId,
        isManuallyBlocked: true,
        manuallyBlockedAt: now,
      };

      const event: AppEvent = {
        id: uuid(),
        timestamp: now,
        type: 'manual-block',
        buttonId,
        zoneId: btn.zoneId,
        prevButtonState: currentBtnState
          ? { ...currentBtnState }
          : { buttonId, isManuallyBlocked: false },
      };

      const nextButtonStates = { ...prev.buttonStates, [buttonId]: newBtnState };
      const nextEvents = [...prev.events, event];
      const next: AppStorage = { buttonStates: nextButtonStates, events: nextEvents };
      scheduleSave(next);
      return { ...prev, ...next, now };
    });
  }, []);

  const unblockButton = useCallback((buttonId: string) => {
    setState((prev) => {
      const now = Date.now();
      const btn = BUTTON_MAP[buttonId];
      if (!btn) return prev;

      const currentBtnState = prev.buttonStates[buttonId];
      if (!currentBtnState) return prev;
      const newBtnState: StoredButtonState = {
        ...currentBtnState,
        isManuallyBlocked: false,
        manuallyBlockedAt: undefined,
      };

      const event: AppEvent = {
        id: uuid(),
        timestamp: now,
        type: 'manual-unblock',
        buttonId,
        zoneId: btn.zoneId,
        prevButtonState: { ...currentBtnState },
      };

      const nextButtonStates = { ...prev.buttonStates, [buttonId]: newBtnState };
      const nextEvents = [...prev.events, event];
      const next: AppStorage = { buttonStates: nextButtonStates, events: nextEvents };
      scheduleSave(next);
      return { ...prev, ...next, now };
    });
  }, []);

  // Records the button as if it had been pressed at the given timestamp
  // instead of now, reusing the normal press state machine.
  const markButtonAt = useCallback((buttonId: string, timestamp: number) => {
    setState((prev) => {
      const now = Date.now();
      const btn = BUTTON_MAP[buttonId];
      if (!btn) return prev;

      const currentBtnState = prev.buttonStates[buttonId];
      const result = onPress(currentBtnState, timestamp);
      if (result.kind === 'blocked') return prev;

      const event: AppEvent = {
        id: uuid(),
        timestamp,
        type: result.kind,
        buttonId,
        zoneId: btn.zoneId,
        prevButtonState: currentBtnState
          ? { ...currentBtnState }
          : { buttonId, isManuallyBlocked: false },
      };

      const nextButtonStates = { ...prev.buttonStates, [buttonId]: result.newState };
      const nextEvents = [...prev.events, event];
      const next: AppStorage = { buttonStates: nextButtonStates, events: nextEvents };
      scheduleSave(next);
      return { ...prev, ...next, now };
    });
  }, []);

  const clearButton = useCallback((buttonId: string) => {
    setState((prev) => {
      const now = Date.now();
      const btn = BUTTON_MAP[buttonId];
      if (!btn) return prev;

      const currentBtnState = prev.buttonStates[buttonId];
      const newBtnState: StoredButtonState = { buttonId, isManuallyBlocked: false };

      const event: AppEvent = {
        id: uuid(),
        timestamp: now,
        type: 'manual-clear',
        buttonId,
        zoneId: btn.zoneId,
        prevButtonState: currentBtnState
          ? { ...currentBtnState }
          : { buttonId, isManuallyBlocked: false },
      };

      const nextButtonStates = { ...prev.buttonStates, [buttonId]: newBtnState };
      const nextEvents = [...prev.events, event];
      const next: AppStorage = { buttonStates: nextButtonStates, events: nextEvents };
      scheduleSave(next);
      return { ...prev, ...next, now };
    });
  }, []);

  const undo = useCallback(() => {
    setState((prev) => {
      if (prev.events.length === 0) return prev;
      const last = prev.events[prev.events.length - 1];
      const nextButtonStates = {
        ...prev.buttonStates,
        [last.buttonId]: last.prevButtonState,
      };
      const nextEvents = prev.events.slice(0, -1);
      const next: AppStorage = { buttonStates: nextButtonStates, events: nextEvents };
      scheduleSave(next);
      return { ...prev, ...next };
    });
  }, []);

  const clearAll = useCallback(() => {
    clearStorage().then((fresh) => {
      setState((prev) => ({ ...prev, ...fresh }));
    });
  }, []);

  const setMirrored = useCallback((mirrored: boolean) => {
    setState((prev) => ({ ...prev, mirrored }));
    saveMirrored(mirrored);
  }, []);

  const exportData = useCallback(async () => {
    await exportStorageToFile({
      buttonStates: state.buttonStates,
      events: state.events,
      mirrored: state.mirrored,
    });
  }, [state.buttonStates, state.events, state.mirrored]);

  const applyImport = useCallback((data: ExportedAppData) => {
    setState((prev) => ({ ...prev, ...data }));
    importStorage(data);
  }, []);

  const lastInGroup = lastPressedByGroup(state.buttonStates);

  return [
    { ...state, lastInGroup },
    {
      pressButton,
      blockButton,
      unblockButton,
      markButtonAt,
      clearButton,
      undo,
      clearAll,
      setMirrored,
      exportData,
      pickImportFile: pickImportFileFromDisk,
      applyImport,
    },
  ];
}
