import { useState, useEffect, useCallback, useRef } from 'react';
import { AppStorage, AppEvent, AppEventType, ExportedAppData, ExportSelection, ExportSettingKey, LanguageMode, StoredPointState, ThemeMode, ZoneGroup } from '../types';
import {
  StorageService,
  StoredAutoLock,
  DEFAULT_AUTO_LOCK_AFTER_MARK_SECONDS,
  DEFAULT_AUTO_LOCK_AFTER_UNLOCK_SECONDS,
  ImportResult,
} from '../storage';
import { PointService, PressResultType } from '../logic';
import { POINT_MAP } from '../data';
import {
  SECOND_MS,
  DEFAULT_DAYS_TO_WHITE,
  MIN_DAYS_TO_WHITE,
  MAX_DAYS_TO_WHITE,
} from '../constants';
import { uuid, lastPressedByGroup } from '../utils';

// Debounce delay before persisting a state change to AsyncStorage.
const SAVE_DEBOUNCE_MS = 300;
// How often to refresh `now` so day-based color transitions show up without
// the user having to interact with the app.
const NOW_TICK_INTERVAL_MS = 60_000;

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
  daysToWhite: number;
}

export interface AppActions {
  pressPoint(pointId: string): void;
  blockPoint(pointId: string): void;
  unblockPoint(pointId: string): void;
  markPointAt(pointId: string, timestamp: number): void;
  clearPoint(pointId: string): void;
  undo(): void;
  clearAll(): void;
  setMirrored(mirrored: boolean): void;
  setInterfaceLocked(locked: boolean): void;
  enableAutoLock(afterMarkSeconds: number, afterUnlockSeconds: number): void;
  disableAutoLock(): void;
  updateAutoLockTimes(afterMarkSeconds: number, afterUnlockSeconds: number): void;
  setDaysToWhite(days: number): void;
  exportData(
    themeMode: ThemeMode,
    languageMode: LanguageMode,
    dialogTitle: string,
    selection: ExportSelection,
  ): Promise<void>;
  pickImportFile(): Promise<ImportResult>;
  applyImport(data: ExportedAppData): void;
}

// onAutoLockFired: called when auto-lock engages on its own (countdown
// elapsed while the app was open) — not when the user locks the interface
// manually via the bottom-bar button, which the caller already notifies
// itself. Read through a ref so passing a fresh arrow function each render
// doesn't retrigger the effect that owns the countdown timer below.
export function useAppStore(
  onAutoLockFired?: () => void,
): [AppState & { lastInGroup: Record<ZoneGroup, string | null> }, AppActions] {
  const [state, setState] = useState<AppState>({
    pointStates: {},
    events: [],
    now: Date.now(),
    isLoaded: false,
    mirrored: false,
    interfaceLocked: false,
    autoLockEnabled: false,
    autoLockAfterMarkSeconds: DEFAULT_AUTO_LOCK_AFTER_MARK_SECONDS,
    autoLockAfterUnlockSeconds: DEFAULT_AUTO_LOCK_AFTER_UNLOCK_SECONDS,
    autoLockDeadline: null,
    daysToWhite: DEFAULT_DAYS_TO_WHITE,
  });
  const saveRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onAutoLockFiredRef = useRef(onAutoLockFired);
  onAutoLockFiredRef.current = onAutoLockFired;

  // Load from storage on mount. Loaded together (rather than each in its own
  // .then()) so the just-reopened-the-app auto-lock check below always sees
  // the real persisted interfaceLocked value instead of racing against it.
  useEffect(() => {
    Promise.all([
      StorageService.loadStorage(),
      StorageService.loadMirrored(),
      StorageService.loadInterfaceLocked(),
      StorageService.loadAutoLock(),
      StorageService.loadDaysToWhite(),
    ]).then(([stored, mirrored, storedInterfaceLocked, autoLock, daysToWhite]) => {
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
        StorageService.saveInterfaceLocked(interfaceLocked);
      }
      if (deadline !== autoLock.deadline) {
        StorageService.saveAutoLock({ ...autoLock, deadline });
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
        daysToWhite,
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
  // setInterfaceLocked/pressPoint below) while the app is running. Reruns
  // whenever the deadline is pushed out, so the latest one always wins.
  useEffect(() => {
    if (!state.isLoaded) return;
    if (!state.autoLockEnabled) return;
    if (state.interfaceLocked) return;
    if (state.autoLockDeadline === null) return;

    const fire = () => {
      setState((prev) => ({ ...prev, interfaceLocked: true, autoLockDeadline: null }));
      StorageService.saveInterfaceLocked(true);
      StorageService.saveAutoLock({
        enabled: state.autoLockEnabled,
        afterMarkSeconds: state.autoLockAfterMarkSeconds,
        afterUnlockSeconds: state.autoLockAfterUnlockSeconds,
        deadline: null,
      });
      onAutoLockFiredRef.current?.();
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
    saveRef.current = setTimeout(() => StorageService.saveStorage(nextState), SAVE_DEBOUNCE_MS);
  }

  const pressPoint = useCallback((pointId: string) => {
    setState((prev) => {
      const now = Date.now();
      const point = POINT_MAP[pointId];
      if (!point) return prev;

      const currentPointState = prev.pointStates[pointId];
      const result = PointService.onPress(currentPointState, now, prev.daysToWhite);
      if (result.type === PressResultType.Blocked) return prev;

      const event: AppEvent = {
        id: uuid(),
        timestamp: now,
        type:
          result.type === PressResultType.Injection
            ? AppEventType.Injection
            : AppEventType.Blackout,
        pointId,
        zoneId: point.zoneId,
        prevPointState: { ...currentPointState },
      };

      const nextPointStates = {
        ...prev.pointStates,
        [pointId]: result.newState,
      };
      const nextEvents = [...prev.events, event];
      const next: AppStorage = { pointStates: nextPointStates, events: nextEvents };
      scheduleSave(next);

      // Marking a zone re-arms the auto-lock countdown.
      let autoLockDeadline = prev.autoLockDeadline;
      if (prev.autoLockEnabled) {
        autoLockDeadline = now + prev.autoLockAfterMarkSeconds * SECOND_MS;
        StorageService.saveAutoLock({
          enabled: prev.autoLockEnabled,
          afterMarkSeconds: prev.autoLockAfterMarkSeconds,
          afterUnlockSeconds: prev.autoLockAfterUnlockSeconds,
          deadline: autoLockDeadline,
        });
      }

      return { ...prev, ...next, now, autoLockDeadline };
    });
  }, []);

  const blockPoint = useCallback((pointId: string) => {
    setState((prev) => {
      const now = Date.now();
      const point = POINT_MAP[pointId];
      if (!point) return prev;

      const currentPointState = prev.pointStates[pointId];
      const newPointState: StoredPointState = {
        ...currentPointState,
        pointId,
        isManuallyBlocked: true,
        manuallyBlockedAt: now,
      };

      const event: AppEvent = {
        id: uuid(),
        timestamp: now,
        type: AppEventType.ManualBlock,
        pointId,
        zoneId: point.zoneId,
        prevPointState: currentPointState
          ? { ...currentPointState }
          : { pointId, isManuallyBlocked: false },
      };

      const nextPointStates = { ...prev.pointStates, [pointId]: newPointState };
      const nextEvents = [...prev.events, event];
      const next: AppStorage = { pointStates: nextPointStates, events: nextEvents };
      scheduleSave(next);
      return { ...prev, ...next, now };
    });
  }, []);

  const unblockPoint = useCallback((pointId: string) => {
    setState((prev) => {
      const now = Date.now();
      const point = POINT_MAP[pointId];
      if (!point) return prev;

      const currentPointState = prev.pointStates[pointId];
      if (!currentPointState) return prev;
      const newPointState: StoredPointState = {
        ...currentPointState,
        isManuallyBlocked: false,
        manuallyBlockedAt: undefined,
      };

      const event: AppEvent = {
        id: uuid(),
        timestamp: now,
        type: AppEventType.ManualUnblock,
        pointId,
        zoneId: point.zoneId,
        prevPointState: { ...currentPointState },
      };

      const nextPointStates = { ...prev.pointStates, [pointId]: newPointState };
      const nextEvents = [...prev.events, event];
      const next: AppStorage = { pointStates: nextPointStates, events: nextEvents };
      scheduleSave(next);
      return { ...prev, ...next, now };
    });
  }, []);

  // Records the point as if it had been pressed at the given timestamp
  // instead of now, reusing the normal press state machine.
  const markPointAt = useCallback((pointId: string, timestamp: number) => {
    setState((prev) => {
      const now = Date.now();
      const point = POINT_MAP[pointId];
      if (!point) return prev;

      const currentPointState = prev.pointStates[pointId];
      const result = PointService.onPress(currentPointState, timestamp, prev.daysToWhite);
      if (result.type === PressResultType.Blocked) return prev;

      const event: AppEvent = {
        id: uuid(),
        timestamp,
        type:
          result.type === PressResultType.Injection
            ? AppEventType.Injection
            : AppEventType.Blackout,
        pointId,
        zoneId: point.zoneId,
        prevPointState: currentPointState
          ? { ...currentPointState }
          : { pointId, isManuallyBlocked: false },
      };

      const nextPointStates = { ...prev.pointStates, [pointId]: result.newState };
      const nextEvents = [...prev.events, event];
      const next: AppStorage = { pointStates: nextPointStates, events: nextEvents };
      scheduleSave(next);
      return { ...prev, ...next, now };
    });
  }, []);

  const clearPoint = useCallback((pointId: string) => {
    setState((prev) => {
      const now = Date.now();
      const point = POINT_MAP[pointId];
      if (!point) return prev;

      const currentPointState = prev.pointStates[pointId];
      const newPointState: StoredPointState = { pointId, isManuallyBlocked: false };

      const event: AppEvent = {
        id: uuid(),
        timestamp: now,
        type: AppEventType.ManualClear,
        pointId,
        zoneId: point.zoneId,
        prevPointState: currentPointState
          ? { ...currentPointState }
          : { pointId, isManuallyBlocked: false },
      };

      const nextPointStates = { ...prev.pointStates, [pointId]: newPointState };
      const nextEvents = [...prev.events, event];
      const next: AppStorage = { pointStates: nextPointStates, events: nextEvents };
      scheduleSave(next);
      return { ...prev, ...next, now };
    });
  }, []);

  const undo = useCallback(() => {
    setState((prev) => {
      if (prev.events.length === 0) return prev;
      const last = prev.events[prev.events.length - 1];
      const nextPointStates = {
        ...prev.pointStates,
        [last.pointId]: last.prevPointState,
      };
      const nextEvents = prev.events.slice(0, -1);
      const next: AppStorage = { pointStates: nextPointStates, events: nextEvents };
      scheduleSave(next);
      return { ...prev, ...next };
    });
  }, []);

  const clearAll = useCallback(() => {
    StorageService.clearStorage().then((fresh) => {
      setState((prev) => ({ ...prev, ...fresh }));
    });
  }, []);

  const setMirrored = useCallback((mirrored: boolean) => {
    setState((prev) => ({ ...prev, mirrored }));
    StorageService.saveMirrored(mirrored);
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
        StorageService.saveAutoLock({
          enabled: prev.autoLockEnabled,
          afterMarkSeconds: prev.autoLockAfterMarkSeconds,
          afterUnlockSeconds: prev.autoLockAfterUnlockSeconds,
          deadline: autoLockDeadline,
        });
      }
      return { ...prev, interfaceLocked: locked, autoLockDeadline };
    });
    StorageService.saveInterfaceLocked(locked);
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
        StorageService.saveAutoLock(stored);
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
      StorageService.saveAutoLock(stored);
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
        StorageService.saveAutoLock(stored);
        return {
          ...prev,
          autoLockAfterMarkSeconds: afterMarkSeconds,
          autoLockAfterUnlockSeconds: afterUnlockSeconds,
        };
      });
    },
    [],
  );

  const setDaysToWhite = useCallback((days: number) => {
    const clamped = Math.min(MAX_DAYS_TO_WHITE, Math.max(MIN_DAYS_TO_WHITE, days));
    setState((prev) => ({ ...prev, daysToWhite: clamped }));
    StorageService.saveDaysToWhite(clamped);
  }, []);

  // themeMode/languageMode are passed in rather than read from state —
  // they're owned by ThemeProvider/LanguageProvider (mounted in App.tsx,
  // above this hook's caller), not by this store. See
  // src/theme/ThemeContext.tsx and src/i18n/LanguageContext.tsx.
  // `dialogTitle` is pre-formatted by the caller (via
  // t('menu.exportOptionsDialog.shareDialogTitle')) so this hook stays free
  // of an i18next dependency, like StorageService.exportStorageToFile.
  // `selection` (from ExportOptionsDialog) picks which categories actually
  // make it into the file — omitted categories are left out of the object
  // entirely, not written with a default, so a partial file round-trips
  // correctly through the merge-import logic in applyImport below.
  const exportData = useCallback(
    async (
      themeMode: ThemeMode,
      languageMode: LanguageMode,
      dialogTitle: string,
      selection: ExportSelection,
    ) => {
      const data: ExportedAppData = {};
      if (selection.marks) {
        data.pointStates = state.pointStates;
        data.events = state.events;
      }
      if (selection.settings[ExportSettingKey.Mirrored]) {
        data.mirrored = state.mirrored;
      }
      if (selection.settings[ExportSettingKey.AutoLock]) {
        data.autoLockEnabled = state.autoLockEnabled;
        data.autoLockAfterMarkSeconds = state.autoLockAfterMarkSeconds;
        data.autoLockAfterUnlockSeconds = state.autoLockAfterUnlockSeconds;
      }
      if (selection.settings[ExportSettingKey.DaysToWhite]) {
        data.daysToWhite = state.daysToWhite;
      }
      if (selection.settings[ExportSettingKey.Theme]) {
        data.themeMode = themeMode;
      }
      if (selection.settings[ExportSettingKey.Language]) {
        data.languageMode = languageMode;
      }
      await StorageService.exportStorageToFile(data, dialogTitle);
    },
    [
      state.pointStates,
      state.events,
      state.mirrored,
      state.autoLockEnabled,
      state.autoLockAfterMarkSeconds,
      state.autoLockAfterUnlockSeconds,
      state.daysToWhite,
    ],
  );

  // Merge-imports whatever categories `data` carries — a field left absent
  // (because ExportOptionsDialog excluded it) leaves that category's current
  // state/storage untouched instead of resetting it. Doesn't persist
  // data.themeMode — the caller applies it via ThemeProvider's setMode,
  // which owns that setting's storage key.
  const applyImport = useCallback((data: ExportedAppData) => {
    setState((prev) => {
      const next: AppState = { ...prev };

      if (data.pointStates !== undefined) next.pointStates = data.pointStates;
      if (data.events !== undefined) next.events = data.events;
      if (data.mirrored !== undefined) next.mirrored = data.mirrored;

      if (data.autoLockEnabled !== undefined) {
        const afterMarkSeconds =
          data.autoLockAfterMarkSeconds ?? prev.autoLockAfterMarkSeconds;
        const afterUnlockSeconds =
          data.autoLockAfterUnlockSeconds ?? prev.autoLockAfterUnlockSeconds;
        const deadline =
          data.autoLockEnabled && !prev.interfaceLocked
            ? Date.now() + afterUnlockSeconds * SECOND_MS
            : null;
        StorageService.saveAutoLock({
          enabled: data.autoLockEnabled,
          afterMarkSeconds,
          afterUnlockSeconds,
          deadline,
        });
        next.autoLockEnabled = data.autoLockEnabled;
        next.autoLockAfterMarkSeconds = afterMarkSeconds;
        next.autoLockAfterUnlockSeconds = afterUnlockSeconds;
        next.autoLockDeadline = deadline;
      }

      if (data.daysToWhite !== undefined) {
        StorageService.saveDaysToWhite(data.daysToWhite);
        next.daysToWhite = data.daysToWhite;
      }

      return next;
    });
    StorageService.importStorage(data);
  }, []);

  const lastInGroup = lastPressedByGroup(state.pointStates);

  return [
    { ...state, lastInGroup },
    {
      pressPoint,
      blockPoint,
      unblockPoint,
      markPointAt,
      clearPoint,
      undo,
      clearAll,
      setMirrored,
      setInterfaceLocked,
      enableAutoLock,
      disableAutoLock,
      updateAutoLockTimes,
      setDaysToWhite,
      exportData,
      pickImportFile: StorageService.pickImportFile,
      applyImport,
    },
  ];
}
