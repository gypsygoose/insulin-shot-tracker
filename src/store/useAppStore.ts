import { useState, useEffect, useCallback, useRef } from 'react';
import { AppStorage, AppEvent, StoredButtonState, ZoneGroup } from '../types';
import {
  loadStorage,
  saveStorage,
  clearStorage,
  loadMirrored,
  saveMirrored,
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
}

// Derive last-pressed buttonId per group from event log
function lastPressedByGroup(events: AppEvent[]): Record<ZoneGroup, string | null> {
  const result: Record<ZoneGroup, string | null> = {
    thighs: null,
    'shoulders-and-belly': null,
  };
  // Buttons whose most-recent event (walking backwards) has already been seen.
  // A 'manual-clear' resolves a button to "not currently used" and hides any
  // older injection/blackout events for it, so clearing a checked button lets
  // the checkmark fall back to the group's previous press.
  const resolved = new Set<string>();
  // events are appended newest-last, walk from end
  for (let i = events.length - 1; i >= 0; i--) {
    const ev = events[i];
    if (resolved.has(ev.buttonId)) continue;
    if (ev.type === 'manual-clear') {
      resolved.add(ev.buttonId);
      continue;
    }
    if (ev.type !== 'injection' && ev.type !== 'blackout') continue;
    resolved.add(ev.buttonId);
    const zone = ZONE_MAP[ev.zoneId];
    if (!zone) continue;
    if (result[zone.group] === null) {
      result[zone.group] = ev.buttonId;
    }
    if (result.thighs !== null && result['shoulders-and-belly'] !== null) break;
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

  const lastInGroup = lastPressedByGroup(state.events);

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
    },
  ];
}
