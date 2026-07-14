import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { AppStorage, AppEvent, AppEventType, EnabledZones, ExportedAppData, ExportMarksKey, ExportSelection, ExportSettingKey, LanguageMode, PointRestoreMode, StoredPointState, ThemeMode, ZoneGroup, ZonePointCounts, ZoneRuntimeData } from '../types';
import {
  StorageService,
  StoredAutoLock,
  DEFAULT_AUTO_LOCK_AFTER_MARK_SECONDS,
  DEFAULT_AUTO_LOCK_AFTER_UNLOCK_SECONDS,
  ImportResult,
  normalizeStorage,
} from '../storage';
import { PointService, PressResultType } from '../logic';
import { buildZoneData, DEFAULT_ZONE_POINT_COUNTS, DEFAULT_ENABLED_ZONES } from '../data';
import {
  SECOND_MS,
  DEFAULT_DAYS_TO_WHITE,
  MIN_DAYS_TO_WHITE,
  MAX_DAYS_TO_WHITE,
  DEFAULT_DAYS_TO_AVAILABLE,
  MIN_DAYS_TO_AVAILABLE,
  DEFAULT_POINT_RESTORE_MODE,
} from '../constants';
import {
  uuid,
  appendEvent,
  lastPressedByGroup,
  partitionPointStatesByBlock,
  partitionEventsByBlock,
  resetPointStates,
} from '../utils';

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
  daysToAvailable: number;
  pointRestoreMode: PointRestoreMode;
  zonePointCounts: ZonePointCounts;
  enabledZones: EnabledZones;
}

export interface AppActions {
  pressPoint(pointId: string): void;
  blockPoint(pointId: string): void;
  unblockPoint(pointId: string): void;
  markPointAt(pointId: string, timestamp: number): void;
  clearPoint(pointId: string): void;
  undo(): void;
  clearSelected(selection: ExportSelection): void;
  setMirrored(mirrored: boolean): void;
  setInterfaceLocked(locked: boolean): void;
  enableAutoLock(afterMarkSeconds: number, afterUnlockSeconds: number): void;
  disableAutoLock(): void;
  updateAutoLockTimes(afterMarkSeconds: number, afterUnlockSeconds: number): void;
  setDaysToWhite(days: number): void;
  setDaysToAvailable(days: number): void;
  setPointRestoreMode(mode: PointRestoreMode): void;
  setZonePointCounts(next: ZonePointCounts): void;
  setEnabledZones(next: EnabledZones): void;
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
): [
  AppState & { lastInGroup: Record<ZoneGroup, string | null>; zoneData: ZoneRuntimeData },
  AppActions,
] {
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
    daysToAvailable: DEFAULT_DAYS_TO_AVAILABLE,
    pointRestoreMode: DEFAULT_POINT_RESTORE_MODE,
    zonePointCounts: DEFAULT_ZONE_POINT_COUNTS,
    enabledZones: DEFAULT_ENABLED_ZONES,
  });
  const saveRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onAutoLockFiredRef = useRef(onAutoLockFired);
  onAutoLockFiredRef.current = onAutoLockFired;

  // Recomputed only when zonePointCounts/enabledZones changes, not on every
  // render — see data/zones.ts's buildZoneData. Read through a ref (below) by
  // the useCallback bodies further down so they can stay stable ([] deps)
  // instead of needing zoneData as a dependency.
  const zoneData = useMemo(
    () => buildZoneData(state.zonePointCounts, state.enabledZones),
    [state.zonePointCounts, state.enabledZones],
  );
  const zoneDataRef = useRef(zoneData);
  zoneDataRef.current = zoneData;

  // Load from storage on mount. zonePointCounts/enabledZones load first since
  // loadStorage needs the resulting active-points list to know which point
  // ids to backfill defaults for; the rest loads together (rather than each
  // in its own .then()) so the just-reopened-the-app auto-lock check below
  // always sees the real persisted interfaceLocked value instead of racing
  // against it.
  useEffect(() => {
    Promise.all([
      StorageService.loadZonePointCounts(),
      StorageService.loadEnabledZones(),
    ]).then(([zonePointCounts, enabledZones]) => {
      const activePoints = buildZoneData(zonePointCounts, enabledZones).points;
      Promise.all([
        StorageService.loadStorage(activePoints),
        StorageService.loadMirrored(),
        StorageService.loadInterfaceLocked(),
        StorageService.loadAutoLock(),
        StorageService.loadDaysToWhite(),
        StorageService.loadDaysToAvailable(),
        StorageService.loadPointRestoreMode(),
      ]).then(([stored, mirrored, storedInterfaceLocked, autoLock, daysToWhite, daysToAvailable, pointRestoreMode]) => {
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
          daysToAvailable,
          pointRestoreMode,
          zonePointCounts,
          enabledZones,
          isLoaded: true,
        }));
      });
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
      const point = zoneDataRef.current.pointMap[pointId];
      if (!point) return prev;

      const currentPointState = prev.pointStates[pointId];
      const result = PointService.onPress(
        currentPointState,
        now,
        prev.daysToWhite,
        prev.daysToAvailable,
        prev.pointRestoreMode,
      );
      if (
        result.type === PressResultType.Blocked ||
        result.type === PressResultType.Unavailable
      )
        return prev;

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
      const nextEvents = appendEvent(prev.events, event);
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
      const point = zoneDataRef.current.pointMap[pointId];
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
      const nextEvents = appendEvent(prev.events, event);
      const next: AppStorage = { pointStates: nextPointStates, events: nextEvents };
      scheduleSave(next);
      return { ...prev, ...next, now };
    });
  }, []);

  const unblockPoint = useCallback((pointId: string) => {
    setState((prev) => {
      const now = Date.now();
      const point = zoneDataRef.current.pointMap[pointId];
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
      const nextEvents = appendEvent(prev.events, event);
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
      const point = zoneDataRef.current.pointMap[pointId];
      if (!point) return prev;

      const currentPointState = prev.pointStates[pointId];
      const result = PointService.onPress(
        currentPointState,
        timestamp,
        prev.daysToWhite,
        prev.daysToAvailable,
        prev.pointRestoreMode,
      );
      if (
        result.type === PressResultType.Blocked ||
        result.type === PressResultType.Unavailable
      )
        return prev;

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
      const nextEvents = appendEvent(prev.events, event);
      const next: AppStorage = { pointStates: nextPointStates, events: nextEvents };
      scheduleSave(next);
      return { ...prev, ...next, now };
    });
  }, []);

  const clearPoint = useCallback((pointId: string) => {
    setState((prev) => {
      const now = Date.now();
      const point = zoneDataRef.current.pointMap[pointId];
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
      const nextEvents = appendEvent(prev.events, event);
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

  // Resets exactly the selected marks/settings categories to their
  // defaults, leaving every unselected category — and, within marks, the
  // unselected partition — untouched. Mirrors exportData's selection
  // semantics as an in-place reset instead of a file write (see
  // ClearOptionsDialog, built on AppDataSelector). Doesn't reset
  // themeMode/languageMode: like applyImport, the caller resets those via
  // ThemeProvider/LanguageProvider's own setMode when
  // selection.settings[ExportSettingKey.Theme/Language] is checked.
  const clearSelected = useCallback((selection: ExportSelection) => {
    setState((prev) => {
      const next: AppState = { ...prev };

      const activePointsSelected = selection.marks[ExportMarksKey.ActivePoints];
      const blockedPointsSelected = selection.marks[ExportMarksKey.BlockedPoints];
      if (activePointsSelected || blockedPointsSelected) {
        const { active, blocked } = partitionPointStatesByBlock(prev.pointStates);
        const { active: activeEvents, blocked: blockedEvents } =
          partitionEventsByBlock(prev.events);
        if (activePointsSelected && blockedPointsSelected) {
          next.pointStates = resetPointStates(Object.keys(prev.pointStates));
          next.events = [];
        } else if (activePointsSelected) {
          next.pointStates = {
            ...blocked,
            ...resetPointStates(Object.keys(active)),
          };
          next.events = blockedEvents;
        } else {
          next.pointStates = {
            ...active,
            ...resetPointStates(Object.keys(blocked)),
          };
          next.events = activeEvents;
        }
        StorageService.saveStorage({
          pointStates: next.pointStates,
          events: next.events,
        });
      }

      if (selection.settings[ExportSettingKey.Mirrored]) {
        next.mirrored = false;
        StorageService.saveMirrored(false);
      }

      if (selection.settings[ExportSettingKey.AutoLock]) {
        next.autoLockEnabled = false;
        next.autoLockAfterMarkSeconds = DEFAULT_AUTO_LOCK_AFTER_MARK_SECONDS;
        next.autoLockAfterUnlockSeconds = DEFAULT_AUTO_LOCK_AFTER_UNLOCK_SECONDS;
        next.autoLockDeadline = null;
        StorageService.saveAutoLock({
          enabled: false,
          afterMarkSeconds: DEFAULT_AUTO_LOCK_AFTER_MARK_SECONDS,
          afterUnlockSeconds: DEFAULT_AUTO_LOCK_AFTER_UNLOCK_SECONDS,
          deadline: null,
        });
      }

      // Same combined-backfill treatment as applyImport/setZonePointCounts/
      // setEnabledZones, since resetting either the grid or the zone
      // selection may bring previously out-of-range/disabled slots into
      // range — handled together so resetting only one still recomputes
      // active points against the other's current value instead of stale
      // data.
      if (
        selection.settings[ExportSettingKey.ZonePointCounts] ||
        selection.settings[ExportSettingKey.EnabledZones]
      ) {
        const nextZonePointCounts = selection.settings[
          ExportSettingKey.ZonePointCounts
        ]
          ? DEFAULT_ZONE_POINT_COUNTS
          : prev.zonePointCounts;
        const nextEnabledZones = selection.settings[
          ExportSettingKey.EnabledZones
        ]
          ? DEFAULT_ENABLED_ZONES
          : prev.enabledZones;
        const nextActivePoints = buildZoneData(
          nextZonePointCounts,
          nextEnabledZones,
        ).points;
        const normalized = normalizeStorage(
          { pointStates: next.pointStates, events: next.events },
          nextActivePoints,
        );
        next.pointStates = normalized.pointStates;
        next.events = normalized.events;
        if (selection.settings[ExportSettingKey.ZonePointCounts]) {
          next.zonePointCounts = DEFAULT_ZONE_POINT_COUNTS;
          StorageService.saveZonePointCounts(DEFAULT_ZONE_POINT_COUNTS);
        }
        if (selection.settings[ExportSettingKey.EnabledZones]) {
          next.enabledZones = DEFAULT_ENABLED_ZONES;
          StorageService.saveEnabledZones(DEFAULT_ENABLED_ZONES);
        }
      }

      if (selection.settings[ExportSettingKey.PointRestoreMode]) {
        next.pointRestoreMode = DEFAULT_POINT_RESTORE_MODE;
        StorageService.savePointRestoreMode(DEFAULT_POINT_RESTORE_MODE);
      }

      if (selection.settings[ExportSettingKey.DaysToWhite]) {
        next.daysToWhite = DEFAULT_DAYS_TO_WHITE;
        StorageService.saveDaysToWhite(DEFAULT_DAYS_TO_WHITE);
      }

      if (selection.settings[ExportSettingKey.DaysToAvailable]) {
        next.daysToAvailable = DEFAULT_DAYS_TO_AVAILABLE;
        StorageService.saveDaysToAvailable(DEFAULT_DAYS_TO_AVAILABLE);
      }

      return next;
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

  // Raw value is clamped only to its own absolute bounds here — its
  // effective cap against the current daysToWhite is applied at the point of
  // use (see PointService.daysUntilAvailable), not by mutating this setting.
  const setDaysToAvailable = useCallback((days: number) => {
    const clamped = Math.min(
      MAX_DAYS_TO_WHITE,
      Math.max(MIN_DAYS_TO_AVAILABLE, days),
    );
    setState((prev) => ({ ...prev, daysToAvailable: clamped }));
    StorageService.saveDaysToAvailable(clamped);
  }, []);

  const setPointRestoreMode = useCallback((mode: PointRestoreMode) => {
    setState((prev) => ({ ...prev, pointRestoreMode: mode }));
    StorageService.savePointRestoreMode(mode);
  }, []);

  // Backfills default states for any slot newly brought into range by the
  // grid change (normalizeStorage), while leaving every other point's
  // history — including slots now outside the grid — untouched, so shrinking
  // then re-growing a zone's grid restores its old history (see CLAUDE.md's
  // "Zones and points").
  const setZonePointCounts = useCallback((next: ZonePointCounts) => {
    setState((prev) => {
      const nextActivePoints = buildZoneData(next, prev.enabledZones).points;
      const normalized = normalizeStorage(
        { pointStates: prev.pointStates, events: prev.events },
        nextActivePoints,
      );
      scheduleSave(normalized);
      return {
        ...prev,
        zonePointCounts: next,
        pointStates: normalized.pointStates,
        events: normalized.events,
      };
    });
    StorageService.saveZonePointCounts(next);
  }, []);

  // Same backfill-defaults treatment as setZonePointCounts — re-enabling a
  // zone reveals its points (and their history) again, since a disabled
  // zone's points are simply excluded from buildZoneData's active-points
  // list (see CLAUDE.md's "Zones and points") rather than deleted.
  const setEnabledZones = useCallback((next: EnabledZones) => {
    setState((prev) => {
      const nextActivePoints = buildZoneData(prev.zonePointCounts, next).points;
      const normalized = normalizeStorage(
        { pointStates: prev.pointStates, events: prev.events },
        nextActivePoints,
      );
      scheduleSave(normalized);
      return {
        ...prev,
        enabledZones: next,
        pointStates: normalized.pointStates,
        events: normalized.events,
      };
    });
    StorageService.saveEnabledZones(next);
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
      const activePointsSelected = selection.marks[ExportMarksKey.ActivePoints];
      const blockedPointsSelected = selection.marks[ExportMarksKey.BlockedPoints];
      if (activePointsSelected && blockedPointsSelected) {
        data.pointStates = state.pointStates;
        data.events = state.events;
      } else if (activePointsSelected || blockedPointsSelected) {
        const { active: activePointStates, blocked: blockedPointStates } =
          partitionPointStatesByBlock(state.pointStates);
        const { active: activeEvents, blocked: blockedEvents } =
          partitionEventsByBlock(state.events);
        data.pointStates = activePointsSelected
          ? activePointStates
          : blockedPointStates;
        data.events = activePointsSelected ? activeEvents : blockedEvents;
      }
      if (selection.settings[ExportSettingKey.Mirrored]) {
        data.mirrored = state.mirrored;
      }
      if (selection.settings[ExportSettingKey.AutoLock]) {
        data.autoLockEnabled = state.autoLockEnabled;
        data.autoLockAfterMarkSeconds = state.autoLockAfterMarkSeconds;
        data.autoLockAfterUnlockSeconds = state.autoLockAfterUnlockSeconds;
      }
      if (selection.settings[ExportSettingKey.EnabledZones]) {
        data.enabledZones = state.enabledZones;
      }
      if (selection.settings[ExportSettingKey.ZonePointCounts]) {
        data.zonePointCounts = state.zonePointCounts;
      }
      if (selection.settings[ExportSettingKey.PointRestoreMode]) {
        data.pointRestoreMode = state.pointRestoreMode;
      }
      if (selection.settings[ExportSettingKey.DaysToWhite]) {
        data.daysToWhite = state.daysToWhite;
      }
      if (selection.settings[ExportSettingKey.DaysToAvailable]) {
        data.daysToAvailable = state.daysToAvailable;
      }
      if (selection.settings[ExportSettingKey.Language]) {
        data.languageMode = languageMode;
      }
      if (selection.settings[ExportSettingKey.Theme]) {
        data.themeMode = themeMode;
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
      state.daysToAvailable,
      state.pointRestoreMode,
      state.zonePointCounts,
      state.enabledZones,
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

      // Same backfill-defaults treatment as setZonePointCounts/
      // setEnabledZones, since an imported grid or zone selection may bring
      // previously out-of-range/disabled slots into range. Handled together
      // (rather than as two independent ifs) so a file carrying only one of
      // the two still recomputes active points against the other's current
      // value instead of stale data.
      if (data.zonePointCounts !== undefined || data.enabledZones !== undefined) {
        const nextZonePointCounts = data.zonePointCounts ?? prev.zonePointCounts;
        const nextEnabledZones = data.enabledZones ?? prev.enabledZones;
        const nextActivePoints = buildZoneData(
          nextZonePointCounts,
          nextEnabledZones,
        ).points;
        const normalized = normalizeStorage(
          {
            pointStates: next.pointStates,
            events: next.events,
          },
          nextActivePoints,
        );
        next.pointStates = normalized.pointStates;
        next.events = normalized.events;
        if (data.zonePointCounts !== undefined) {
          next.zonePointCounts = data.zonePointCounts;
          StorageService.saveZonePointCounts(data.zonePointCounts);
        }
        if (data.enabledZones !== undefined) {
          next.enabledZones = data.enabledZones;
          StorageService.saveEnabledZones(data.enabledZones);
        }
      }

      if (data.pointRestoreMode !== undefined) {
        StorageService.savePointRestoreMode(data.pointRestoreMode);
        next.pointRestoreMode = data.pointRestoreMode;
      }

      if (data.daysToWhite !== undefined) {
        StorageService.saveDaysToWhite(data.daysToWhite);
        next.daysToWhite = data.daysToWhite;
      }

      if (data.daysToAvailable !== undefined) {
        StorageService.saveDaysToAvailable(data.daysToAvailable);
        next.daysToAvailable = data.daysToAvailable;
      }

      return next;
    });
    StorageService.importStorage(data);
  }, []);

  const lastInGroup = lastPressedByGroup(state.pointStates, zoneData.pointMap);

  return [
    { ...state, lastInGroup, zoneData },
    {
      pressPoint,
      blockPoint,
      unblockPoint,
      markPointAt,
      clearPoint,
      undo,
      clearSelected,
      setMirrored,
      setInterfaceLocked,
      enableAutoLock,
      disableAutoLock,
      updateAutoLockTimes,
      setDaysToWhite,
      setDaysToAvailable,
      setPointRestoreMode,
      setZonePointCounts,
      setEnabledZones,
      exportData,
      pickImportFile: () => StorageService.pickImportFile(zoneDataRef.current.points),
      applyImport,
    },
  ];
}
