import { useState, useEffect, useCallback, useRef } from 'react';
import { AppStorage, AppEvent, AppEventType, ExportedAppData, StoredButtonState, ZoneGroup } from '../types';
import {
  loadStorage,
  saveStorage,
  clearStorage,
  loadMirrored,
  saveMirrored,
  loadInterfaceLocked,
  saveInterfaceLocked,
  loadAutoLock,
  saveAutoLock,
  StoredAutoLock,
  DEFAULT_AUTO_LOCK_AFTER_MARK_SECONDS,
  DEFAULT_AUTO_LOCK_AFTER_UNLOCK_SECONDS,
  exportStorageToFile,
  pickImportFile as pickImportFileFromDisk,
  importStorage,
  ImportResult,
} from '../storage/storage';
import { onPress, PressResultType } from '../logic/stateMachine';
import { BUTTON_MAP, ZONE_MAP } from '../data/zones';
import { SECOND_MS } from '../constants';

// Debounce delay before persisting a state change to AsyncStorage.
const SAVE_DEBOUNCE_MS = 300;
// How often to refresh `now` so day-based color transitions show up without
// the user having to interact with the app.
const NOW_TICK_INTERVAL_MS = 60_000;

function uuid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

export interface AppState extends AppStorage {
  now: number;
  isLoaded: boolean;
  mirrored: boolean;
  interfaceLocked: boolean;
  autoLockEnabled: boolean;
  autoLockAfterMarkSeconds: number;
  autoLockAfterUnlockSeconds: number;
  // Timestamp at which the interface should auto-lock next, or null if no
  // auto-lock is currently pending (e.g. already locked, or disabled).
  autoLockDeadline: number | null;
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
  setInterfaceLocked(locked: boolean): void;
  enableAutoLock(afterMarkSeconds: number, afterUnlockSeconds: number): void;
  disableAutoLock(): void;
  updateAutoLockTimes(afterMarkSeconds: number, afterUnlockSeconds: number): void;
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
    [ZoneGroup.Thighs]: null,
    [ZoneGroup.ShouldersAndBelly]: null,
  };
  const bestTime: Record<ZoneGroup, number> = {
    [ZoneGroup.Thighs]: -Infinity,
    [ZoneGroup.ShouldersAndBelly]: -Infinity,
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
    interfaceLocked: false,
    autoLockEnabled: false,
    autoLockAfterMarkSeconds: DEFAULT_AUTO_LOCK_AFTER_MARK_SECONDS,
    autoLockAfterUnlockSeconds: DEFAULT_AUTO_LOCK_AFTER_UNLOCK_SECONDS,
    autoLockDeadline: null,
  });
  const saveRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load from storage on mount. Loaded together (rather than each in its own
  // .then()) so the just-reopened-the-app auto-lock check below always sees
  // the real persisted interfaceLocked value instead of racing against it.
  useEffect(() => {
    Promise.all([
      loadStorage(),
      loadMirrored(),
      loadInterfaceLocked(),
      loadAutoLock(),
    ]).then(([stored, mirrored, storedInterfaceLocked, autoLock]) => {
      const now = Date.now();
      let interfaceLocked = storedInterfaceLocked;
      let deadline = autoLock.deadline;
      // App may have been closed past the deadline — lock immediately
      // instead of waiting for a timer that already should have fired.
      if (
        autoLock.enabled &&
        !interfaceLocked &&
        deadline !== null &&
        now >= deadline
      ) {
        interfaceLocked = true;
        deadline = null;
      }
      if (interfaceLocked !== storedInterfaceLocked) {
        saveInterfaceLocked(interfaceLocked);
      }
      if (deadline !== autoLock.deadline) {
        saveAutoLock({ ...autoLock, deadline });
      }
      setState((prev) => ({
        ...prev,
        ...stored,
        mirrored,
        interfaceLocked,
        autoLockEnabled: autoLock.enabled,
        autoLockAfterMarkSeconds: autoLock.afterMarkSeconds,
        autoLockAfterUnlockSeconds: autoLock.afterUnlockSeconds,
        autoLockDeadline: deadline,
        isLoaded: true,
      }));
    });
  }, []);

  // Tick now every 60 s
  useEffect(() => {
    const id = setInterval(() => {
      setState((prev) => ({ ...prev, now: Date.now() }));
    }, NOW_TICK_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  // Fires the pending auto-lock deadline (set by an unlock or a mark, see
  // setInterfaceLocked/pressButton below) while the app is running. Reruns
  // whenever the deadline is pushed out, so the latest one always wins.
  useEffect(() => {
    if (!state.isLoaded) return;
    if (!state.autoLockEnabled) return;
    if (state.interfaceLocked) return;
    if (state.autoLockDeadline === null) return;

    const fire = () => {
      setState((prev) => ({ ...prev, interfaceLocked: true, autoLockDeadline: null }));
      saveInterfaceLocked(true);
      saveAutoLock({
        enabled: state.autoLockEnabled,
        afterMarkSeconds: state.autoLockAfterMarkSeconds,
        afterUnlockSeconds: state.autoLockAfterUnlockSeconds,
        deadline: null,
      });
    };

    const delay = state.autoLockDeadline - Date.now();
    if (delay <= 0) {
      fire();
      return;
    }
    const id = setTimeout(fire, delay);
    return () => clearTimeout(id);
  }, [
    state.isLoaded,
    state.autoLockEnabled,
    state.interfaceLocked,
    state.autoLockDeadline,
    state.autoLockAfterMarkSeconds,
    state.autoLockAfterUnlockSeconds,
  ]);

  // Debounced persist to AsyncStorage
  function scheduleSave(nextState: AppStorage) {
    if (saveRef.current) clearTimeout(saveRef.current);
    saveRef.current = setTimeout(() => saveStorage(nextState), SAVE_DEBOUNCE_MS);
  }

  const pressButton = useCallback((buttonId: string) => {
    setState((prev) => {
      const now = Date.now();
      const btn = BUTTON_MAP[buttonId];
      if (!btn) return prev;

      const currentBtnState = prev.buttonStates[buttonId];
      const result = onPress(currentBtnState, now);
      if (result.type === PressResultType.Blocked) return prev;

      const event: AppEvent = {
        id: uuid(),
        timestamp: now,
        type:
          result.type === PressResultType.Injection
            ? AppEventType.Injection
            : AppEventType.Blackout,
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

      // Marking a zone re-arms the auto-lock countdown.
      let autoLockDeadline = prev.autoLockDeadline;
      if (prev.autoLockEnabled) {
        autoLockDeadline = now + prev.autoLockAfterMarkSeconds * SECOND_MS;
        saveAutoLock({
          enabled: prev.autoLockEnabled,
          afterMarkSeconds: prev.autoLockAfterMarkSeconds,
          afterUnlockSeconds: prev.autoLockAfterUnlockSeconds,
          deadline: autoLockDeadline,
        });
      }

      return { ...prev, ...next, now, autoLockDeadline };
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
        type: AppEventType.ManualBlock,
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
        type: AppEventType.ManualUnblock,
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
      if (result.type === PressResultType.Blocked) return prev;

      const event: AppEvent = {
        id: uuid(),
        timestamp,
        type:
          result.type === PressResultType.Injection
            ? AppEventType.Injection
            : AppEventType.Blackout,
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
        type: AppEventType.ManualClear,
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

  const setInterfaceLocked = useCallback((locked: boolean) => {
    setState((prev) => {
      // Unlocking (re-)arms the auto-lock countdown; locking cancels it.
      let autoLockDeadline: number | null = locked
        ? null
        : prev.autoLockDeadline;
      if (!locked && prev.autoLockEnabled) {
        autoLockDeadline = Date.now() + prev.autoLockAfterUnlockSeconds * SECOND_MS;
      }
      if (autoLockDeadline !== prev.autoLockDeadline) {
        saveAutoLock({
          enabled: prev.autoLockEnabled,
          afterMarkSeconds: prev.autoLockAfterMarkSeconds,
          afterUnlockSeconds: prev.autoLockAfterUnlockSeconds,
          deadline: autoLockDeadline,
        });
      }
      return { ...prev, interfaceLocked: locked, autoLockDeadline };
    });
    saveInterfaceLocked(locked);
  }, []);

  const enableAutoLock = useCallback(
    (afterMarkSeconds: number, afterUnlockSeconds: number) => {
      setState((prev) => {
        const deadline = prev.interfaceLocked
          ? null
          : Date.now() + afterUnlockSeconds * SECOND_MS;
        const stored: StoredAutoLock = {
          enabled: true,
          afterMarkSeconds,
          afterUnlockSeconds,
          deadline,
        };
        saveAutoLock(stored);
        return {
          ...prev,
          autoLockEnabled: true,
          autoLockAfterMarkSeconds: afterMarkSeconds,
          autoLockAfterUnlockSeconds: afterUnlockSeconds,
          autoLockDeadline: deadline,
        };
      });
    },
    [],
  );

  const disableAutoLock = useCallback(() => {
    setState((prev) => {
      const stored: StoredAutoLock = {
        enabled: false,
        afterMarkSeconds: prev.autoLockAfterMarkSeconds,
        afterUnlockSeconds: prev.autoLockAfterUnlockSeconds,
        deadline: null,
      };
      saveAutoLock(stored);
      return { ...prev, autoLockEnabled: false, autoLockDeadline: null };
    });
  }, []);

  // Edits the configured durations without touching whether auto-lock is
  // currently on or any countdown already in flight.
  const updateAutoLockTimes = useCallback(
    (afterMarkSeconds: number, afterUnlockSeconds: number) => {
      setState((prev) => {
        const stored: StoredAutoLock = {
          enabled: prev.autoLockEnabled,
          afterMarkSeconds,
          afterUnlockSeconds,
          deadline: prev.autoLockDeadline,
        };
        saveAutoLock(stored);
        return {
          ...prev,
          autoLockAfterMarkSeconds: afterMarkSeconds,
          autoLockAfterUnlockSeconds: afterUnlockSeconds,
        };
      });
    },
    [],
  );

  const exportData = useCallback(async () => {
    await exportStorageToFile({
      buttonStates: state.buttonStates,
      events: state.events,
      mirrored: state.mirrored,
      autoLockEnabled: state.autoLockEnabled,
      autoLockAfterMarkSeconds: state.autoLockAfterMarkSeconds,
      autoLockAfterUnlockSeconds: state.autoLockAfterUnlockSeconds,
    });
  }, [
    state.buttonStates,
    state.events,
    state.mirrored,
    state.autoLockEnabled,
    state.autoLockAfterMarkSeconds,
    state.autoLockAfterUnlockSeconds,
  ]);

  const applyImport = useCallback((data: ExportedAppData) => {
    setState((prev) => {
      const deadline =
        data.autoLockEnabled && !prev.interfaceLocked
          ? Date.now() + data.autoLockAfterUnlockSeconds * SECOND_MS
          : null;
      saveAutoLock({
        enabled: data.autoLockEnabled,
        afterMarkSeconds: data.autoLockAfterMarkSeconds,
        afterUnlockSeconds: data.autoLockAfterUnlockSeconds,
        deadline,
      });
      return { ...prev, ...data, autoLockDeadline: deadline };
    });
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
      setInterfaceLocked,
      enableAutoLock,
      disableAutoLock,
      updateAutoLockTimes,
      exportData,
      pickImportFile: pickImportFileFromDisk,
      applyImport,
    },
  ];
}
