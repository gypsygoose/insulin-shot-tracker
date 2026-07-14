import { PointService } from './PointService';
import { ColorLabelType, PressResultType } from './types';
import { DAY_MS } from './constants';
import { PointColor, PointRestoreMode, StoredPointState } from '../types';

const DAY = DAY_MS;
const NOW = 1000000000000; // fixed reference timestamp

const fresh: StoredPointState = { pointId: 'x', isManuallyBlocked: false };

// ---------------------------------------------------------------------------
// computePointColor — normal injection cycle
// ---------------------------------------------------------------------------

describe('computePointColor — normal cycle', () => {
  test('white when never used', () => {
    expect(PointService.computePointColor(fresh, NOW)).toBe(PointColor.White);
  });

  test('maroon on day 0', () => {
    const s = { ...fresh, lastInjectionAt: NOW };
    expect(PointService.computePointColor(s, NOW)).toBe(PointColor.Maroon);
  });

  test('maroon stays until local midnight, regardless of elapsed hours', () => {
    const pressedAt = new Date(2024, 6, 3, 15, 30).getTime(); // 3 July, 15:30 local
    const sameEvening = new Date(2024, 6, 3, 23, 59).getTime(); // still 3 July
    const s = { ...fresh, lastInjectionAt: pressedAt };
    expect(PointService.computePointColor(s, sameEvening)).toBe(PointColor.Maroon);
  });

  test('turns red right after local midnight, even before 24 h have elapsed', () => {
    const pressedAt = new Date(2024, 6, 3, 15, 30).getTime(); // 3 July, 15:30 local
    const nextMidnight = new Date(2024, 6, 4, 0, 0).getTime(); // 4 July, 00:00 local
    const s = { ...fresh, lastInjectionAt: pressedAt };
    expect(PointService.computePointColor(s, nextMidnight)).toBe(PointColor.Red);
  });

  test('red on day 1', () => {
    const s = { ...fresh, lastInjectionAt: NOW - DAY };
    expect(PointService.computePointColor(s, NOW)).toBe(PointColor.Red);
  });

  test('dark-orange on day 2', () => {
    const s = { ...fresh, lastInjectionAt: NOW - 2 * DAY };
    expect(PointService.computePointColor(s, NOW)).toBe(PointColor.DarkOrange);
  });

  test('orange on day 3', () => {
    const s = { ...fresh, lastInjectionAt: NOW - 3 * DAY };
    expect(PointService.computePointColor(s, NOW)).toBe(PointColor.Orange);
  });

  test('dark-yellow on day 4', () => {
    const s = { ...fresh, lastInjectionAt: NOW - 4 * DAY };
    expect(PointService.computePointColor(s, NOW)).toBe(PointColor.DarkYellow);
  });

  test('yellow on day 5', () => {
    const s = { ...fresh, lastInjectionAt: NOW - 5 * DAY };
    expect(PointService.computePointColor(s, NOW)).toBe(PointColor.Yellow);
  });

  test('dark-green on day 6', () => {
    const s = { ...fresh, lastInjectionAt: NOW - 6 * DAY };
    expect(PointService.computePointColor(s, NOW)).toBe(PointColor.DarkGreen);
  });

  test('green on day 7', () => {
    const s = { ...fresh, lastInjectionAt: NOW - 7 * DAY };
    expect(PointService.computePointColor(s, NOW)).toBe(PointColor.Green);
  });

  test('white on day 8', () => {
    const s = { ...fresh, lastInjectionAt: NOW - 8 * DAY };
    expect(PointService.computePointColor(s, NOW)).toBe(PointColor.White);
  });

  test('white on day 30', () => {
    const s = { ...fresh, lastInjectionAt: NOW - 30 * DAY };
    expect(PointService.computePointColor(s, NOW)).toBe(PointColor.White);
  });
});

// ---------------------------------------------------------------------------
// computePointColor — manual block
// ---------------------------------------------------------------------------

describe('computePointColor — gray (manual block)', () => {
  test('gray overrides normal cycle', () => {
    const s = { ...fresh, lastInjectionAt: NOW - DAY, isManuallyBlocked: true };
    expect(PointService.computePointColor(s, NOW)).toBe(PointColor.Gray);
  });

  test('gray overrides blackout', () => {
    const s: StoredPointState = {
      ...fresh,
      blackoutStartedAt: NOW - DAY,
      blackoutDurationDays: 4,
      isManuallyBlocked: true,
    };
    expect(PointService.computePointColor(s, NOW)).toBe(PointColor.Gray);
  });
});

// ---------------------------------------------------------------------------
// computePointColor — blackout cycle
// ---------------------------------------------------------------------------

describe('computePointColor — blackout state', () => {
  test('black during blackout period', () => {
    const s: StoredPointState = {
      ...fresh,
      lastInjectionAt: NOW,
      blackoutStartedAt: NOW,
      blackoutDurationDays: 4,
    };
    expect(PointService.computePointColor(s, NOW + DAY)).toBe(PointColor.Black);
    expect(PointService.computePointColor(s, NOW + 3 * DAY)).toBe(PointColor.Black);
  });

  test('red on day 0 after blackout ends', () => {
    const s: StoredPointState = {
      ...fresh,
      blackoutStartedAt: NOW - 4 * DAY,
      blackoutDurationDays: 4,
    };
    expect(PointService.computePointColor(s, NOW)).toBe(PointColor.Red);
  });

  test('post-blackout cycle skips maroon (starts at red)', () => {
    const s: StoredPointState = {
      ...fresh,
      blackoutStartedAt: NOW - 4 * DAY,
      blackoutDurationDays: 4,
    };
    // day 0 after blackout end = red
    expect(PointService.computePointColor(s, NOW)).toBe(PointColor.Red);
    // day 1 after end = dark-orange
    expect(PointService.computePointColor(s, NOW + DAY)).toBe(PointColor.DarkOrange);
    // day 6 after end = green
    expect(PointService.computePointColor(s, NOW + 6 * DAY)).toBe(PointColor.Green);
    // day 7 after end = white
    expect(PointService.computePointColor(s, NOW + 7 * DAY)).toBe(PointColor.White);
  });

  test('new injection after blackout overrides post-blackout cycle', () => {
    const s: StoredPointState = {
      ...fresh,
      blackoutStartedAt: NOW - 5 * DAY,  // blackout started 5 days ago
      blackoutDurationDays: 4,             // ended 1 day ago
      lastInjectionAt: NOW,               // new injection just now (> blackoutStartedAt)
    };
    expect(PointService.computePointColor(s, NOW)).toBe(PointColor.Maroon);
  });
});

// ---------------------------------------------------------------------------
// onPress
// ---------------------------------------------------------------------------
//
// blackoutDurationFor is private (only reached through onPress); its 4/2/1-day
// mapping is exercised indirectly below via the resulting blackoutDurationDays.

describe('onPress', () => {
  test('injection on white point', () => {
    const result = PointService.onPress(fresh, NOW);
    expect(result.type).toBe(PressResultType.Injection);
    if (result.type === PressResultType.Injection) {
      expect(result.newState.lastInjectionAt).toBe(NOW);
      expect(result.newState.blackoutStartedAt).toBeUndefined();
    }
  });

  test('injection on dark-green point (day 6)', () => {
    const s = { ...fresh, lastInjectionAt: NOW - 6 * DAY };
    const result = PointService.onPress(s, NOW);
    expect(result.type).toBe(PressResultType.Injection);
  });

  test('injection on green point (day 7)', () => {
    const s = { ...fresh, lastInjectionAt: NOW - 7 * DAY };
    const result = PointService.onPress(s, NOW);
    expect(result.type).toBe(PressResultType.Injection);
  });

  test('blackout on maroon point — 4 days', () => {
    const s = { ...fresh, lastInjectionAt: NOW - 0 * DAY };
    const result = PointService.onPress(s, NOW);
    expect(result.type).toBe(PressResultType.Blackout);
    if (result.type === PressResultType.Blackout) {
      expect(result.newState.blackoutDurationDays).toBe(4);
    }
  });

  test('blackout on red point — 4 days', () => {
    const s = { ...fresh, lastInjectionAt: NOW - DAY };
    const result = PointService.onPress(s, NOW);
    expect(result.type).toBe(PressResultType.Blackout);
    if (result.type === PressResultType.Blackout) {
      expect(result.newState.blackoutDurationDays).toBe(4);
    }
  });

  test('blackout on orange point — 2 days', () => {
    const s = { ...fresh, lastInjectionAt: NOW - 3 * DAY };
    const result = PointService.onPress(s, NOW);
    expect(result.type).toBe(PressResultType.Blackout);
    if (result.type === PressResultType.Blackout) {
      expect(result.newState.blackoutDurationDays).toBe(2);
    }
  });

  test('blackout on yellow point — 1 day', () => {
    const s = { ...fresh, lastInjectionAt: NOW - 5 * DAY };
    const result = PointService.onPress(s, NOW);
    expect(result.type).toBe(PressResultType.Blackout);
    if (result.type === PressResultType.Blackout) {
      expect(result.newState.blackoutDurationDays).toBe(1);
    }
  });

  test('blocked on gray (manually blocked) point', () => {
    const s = { ...fresh, isManuallyBlocked: true };
    expect(PointService.onPress(s, NOW).type).toBe(PressResultType.Blocked);
  });

  test('blocked on black (blackout active) point', () => {
    const s: StoredPointState = {
      ...fresh,
      blackoutStartedAt: NOW,
      blackoutDurationDays: 4,
    };
    expect(PointService.onPress(s, NOW + DAY).type).toBe(PressResultType.Blocked);
  });
});

// ---------------------------------------------------------------------------
// Configurable daysToWhite
// ---------------------------------------------------------------------------

function colorOnDay(daysSince: number, daysToWhite: number): PointColor {
  const s = { ...fresh, lastInjectionAt: NOW - daysSince * DAY };
  return PointService.computePointColor(s, NOW, daysToWhite);
}

describe('activeCycleColors', () => {
  test('daysToWhite 8 (default) keeps the full 8-color cycle', () => {
    expect(PointService.activeCycleColors(8)).toEqual([
      PointColor.Maroon,
      PointColor.Red,
      PointColor.DarkOrange,
      PointColor.Orange,
      PointColor.DarkYellow,
      PointColor.Yellow,
      PointColor.DarkGreen,
      PointColor.Green,
    ]);
  });

  test('daysToWhite 7 drops dark-yellow', () => {
    expect(PointService.activeCycleColors(7)).toEqual([
      PointColor.Maroon,
      PointColor.Red,
      PointColor.DarkOrange,
      PointColor.Orange,
      PointColor.Yellow,
      PointColor.DarkGreen,
      PointColor.Green,
    ]);
  });

  test('daysToWhite 6 drops dark-yellow and dark-orange', () => {
    expect(PointService.activeCycleColors(6)).toEqual([
      PointColor.Maroon,
      PointColor.Red,
      PointColor.Orange,
      PointColor.Yellow,
      PointColor.DarkGreen,
      PointColor.Green,
    ]);
  });

  test('daysToWhite 1 keeps only maroon', () => {
    expect(PointService.activeCycleColors(1)).toEqual([PointColor.Maroon]);
  });
});

describe('computePointColor — configurable daysToWhite', () => {
  test('daysToWhite 8 (default) matches unmodified behavior', () => {
    expect(colorOnDay(0, 8)).toBe(PointColor.Maroon);
    expect(colorOnDay(3, 8)).toBe(PointColor.Orange);
    expect(colorOnDay(7, 8)).toBe(PointColor.Green);
    expect(colorOnDay(8, 8)).toBe(PointColor.White);
  });

  test('daysToWhite 7 — orange on day 3, yellow on day 4, green on day 6, white on day 7', () => {
    expect(colorOnDay(3, 7)).toBe(PointColor.Orange);
    expect(colorOnDay(4, 7)).toBe(PointColor.Yellow);
    expect(colorOnDay(6, 7)).toBe(PointColor.Green);
    expect(colorOnDay(7, 7)).toBe(PointColor.White);
  });

  test('daysToWhite 6 — red on day 1, orange on day 2, yellow on day 3, green on day 5, white on day 6', () => {
    expect(colorOnDay(1, 6)).toBe(PointColor.Red);
    expect(colorOnDay(2, 6)).toBe(PointColor.Orange);
    expect(colorOnDay(3, 6)).toBe(PointColor.Yellow);
    expect(colorOnDay(5, 6)).toBe(PointColor.Green);
    expect(colorOnDay(6, 6)).toBe(PointColor.White);
  });

  test('daysToWhite 1 — white on day 1', () => {
    expect(colorOnDay(0, 1)).toBe(PointColor.Maroon);
    expect(colorOnDay(1, 1)).toBe(PointColor.White);
  });

  test('calling without a third argument defaults to 8', () => {
    const s = { ...fresh, lastInjectionAt: NOW - 3 * DAY };
    expect(PointService.computePointColor(s, NOW)).toBe(PointColor.Orange);
  });

  test('post-blackout cycle also compresses with daysToWhite', () => {
    const s: StoredPointState = {
      ...fresh,
      blackoutStartedAt: NOW - 4 * DAY,
      blackoutDurationDays: 4,
    };
    // daysToWhite 6 → active cycle minus maroon: red, orange, yellow, dark-green, green
    expect(PointService.computePointColor(s, NOW, 6)).toBe(PointColor.Red);
    expect(PointService.computePointColor(s, NOW + DAY, 6)).toBe(PointColor.Orange);
    expect(PointService.computePointColor(s, NOW + 4 * DAY, 6)).toBe(PointColor.Green);
    expect(PointService.computePointColor(s, NOW + 5 * DAY, 6)).toBe(PointColor.White);
  });

  test('post-blackout is immediately white when daysToWhite is 1 (no colors besides maroon)', () => {
    const s: StoredPointState = {
      ...fresh,
      blackoutStartedAt: NOW - 4 * DAY,
      blackoutDurationDays: 4,
    };
    expect(PointService.computePointColor(s, NOW, 1)).toBe(PointColor.White);
  });
});

describe('onPress — respects daysToWhite', () => {
  test('injection on orange point that is now green under a reduced cycle', () => {
    // Under daysToWhite 6, day 5 is green (was yellow under the default 8-cycle)
    const s = { ...fresh, lastInjectionAt: NOW - 5 * DAY };
    const result = PointService.onPress(s, NOW, 6);
    expect(result.type).toBe(PressResultType.Injection);
  });

  test('blackout duration is unaffected by daysToWhite (still keyed by color)', () => {
    // Under daysToWhite 6, day 1 is red → still a 4-day blackout
    const s = { ...fresh, lastInjectionAt: NOW - DAY };
    const result = PointService.onPress(s, NOW, 6);
    expect(result.type).toBe(PressResultType.Blackout);
    if (result.type === PressResultType.Blackout) {
      expect(result.newState.blackoutDurationDays).toBe(4);
    }
  });
});

describe('colorLabel', () => {
  test('returns a descriptor at daysToWhite 8', () => {
    expect(PointService.colorLabel(PointColor.Maroon, 8)).toEqual({
      type: ColorLabelType.Maroon,
    });
    expect(PointService.colorLabel(PointColor.Red, 8)).toEqual({
      type: ColorLabelType.Days,
      count: 1,
    });
    expect(PointService.colorLabel(PointColor.DarkOrange, 8)).toEqual({
      type: ColorLabelType.Days,
      count: 2,
    });
    expect(PointService.colorLabel(PointColor.Green, 8)).toEqual({
      type: ColorLabelType.Days,
      count: 7,
    });
    expect(PointService.colorLabel(PointColor.White, 8)).toEqual({
      type: ColorLabelType.White,
      count: 8,
    });
  });

  test('reflects a reduced daysToWhite', () => {
    expect(PointService.colorLabel(PointColor.Orange, 7)).toEqual({
      type: ColorLabelType.Days,
      count: 3,
    });
    expect(PointService.colorLabel(PointColor.Green, 7)).toEqual({
      type: ColorLabelType.Days,
      count: 6,
    });
    expect(PointService.colorLabel(PointColor.White, 7)).toEqual({
      type: ColorLabelType.White,
      count: 7,
    });
  });

  test('block-state descriptors are unaffected by daysToWhite', () => {
    expect(PointService.colorLabel(PointColor.Black, 5)).toEqual({
      type: ColorLabelType.Black,
    });
    expect(PointService.colorLabel(PointColor.Gray, 5)).toEqual({
      type: ColorLabelType.Gray,
    });
  });
});

// ---------------------------------------------------------------------------
// Configurable daysToAvailable
// ---------------------------------------------------------------------------

describe('daysUntilAvailable', () => {
  test('undefined (always available) when daysToAvailable is 0 (default)', () => {
    const s = { ...fresh, lastInjectionAt: NOW };
    expect(PointService.daysUntilAvailable(s, NOW, 8, 0)).toBeUndefined();
    expect(PointService.daysUntilAvailable(s, NOW)).toBeUndefined();
  });

  test('never used point is always available regardless of daysToAvailable', () => {
    expect(PointService.daysUntilAvailable(fresh, NOW, 8, 5)).toBeUndefined();
  });

  test('daysToWhite 8, daysToAvailable 5 — unavailable on day 0 (maroon), 5 days remaining', () => {
    const s = { ...fresh, lastInjectionAt: NOW };
    expect(PointService.daysUntilAvailable(s, NOW, 8, 5)).toBe(5);
  });

  test('daysToWhite 8, daysToAvailable 5 — unavailable on day 4 (dark yellow), 1 day remaining', () => {
    const s = { ...fresh, lastInjectionAt: NOW - 4 * DAY };
    expect(PointService.daysUntilAvailable(s, NOW, 8, 5)).toBe(1);
  });

  test('daysToWhite 8, daysToAvailable 5 — available from day 5 (yellow) onward', () => {
    const dayFive = { ...fresh, lastInjectionAt: NOW - 5 * DAY };
    const daySeven = { ...fresh, lastInjectionAt: NOW - 7 * DAY };
    expect(PointService.daysUntilAvailable(dayFive, NOW, 8, 5)).toBeUndefined();
    expect(PointService.daysUntilAvailable(daySeven, NOW, 8, 5)).toBeUndefined();
  });

  test('white is always available even at the maximum daysToAvailable', () => {
    const s = { ...fresh, lastInjectionAt: NOW - 30 * DAY };
    expect(PointService.daysUntilAvailable(s, NOW, 8, 8)).toBeUndefined();
  });

  test('gray/black are unaffected — daysUntilAvailable is undefined (gated separately)', () => {
    const gray = { ...fresh, lastInjectionAt: NOW, isManuallyBlocked: true };
    expect(PointService.daysUntilAvailable(gray, NOW, 8, 5)).toBeUndefined();

    const black: StoredPointState = {
      ...fresh,
      blackoutStartedAt: NOW,
      blackoutDurationDays: 4,
    };
    expect(PointService.daysUntilAvailable(black, NOW + DAY, 8, 5)).toBeUndefined();
  });

  test('at the maximum daysToAvailable (== daysToWhite), dark-green/green are unavailable too', () => {
    const darkGreen = { ...fresh, lastInjectionAt: NOW - 6 * DAY };
    const green = { ...fresh, lastInjectionAt: NOW - 7 * DAY };
    expect(PointService.daysUntilAvailable(darkGreen, NOW, 8, 8)).toBe(2);
    expect(PointService.daysUntilAvailable(green, NOW, 8, 8)).toBe(1);
  });

  test('reducing daysToWhite below a previously-set daysToAvailable shortens the effective wait', () => {
    // daysToAvailable raw value (5) exceeds the current daysToWhite (3) —
    // effective cap is min(5, 3) = 3, not 5.
    const s = { ...fresh, lastInjectionAt: NOW };
    expect(PointService.daysUntilAvailable(s, NOW, 3, 5)).toBe(3);
  });

  test('applies the same way to the post-blackout cycle', () => {
    const s: StoredPointState = {
      ...fresh,
      blackoutStartedAt: NOW - 4 * DAY, // ended just now
      blackoutDurationDays: 4,
    };
    // Post-blackout day 0 = red, day 1 = dark-orange, ... under daysToWhite 8.
    expect(PointService.daysUntilAvailable(s, NOW, 8, 3)).toBe(3);
    expect(PointService.daysUntilAvailable(s, NOW + 2 * DAY, 8, 3)).toBe(1);
    expect(PointService.daysUntilAvailable(s, NOW + 3 * DAY, 8, 3)).toBeUndefined();
  });
});

describe('onPress — respects daysToAvailable', () => {
  test('unavailable on maroon point when pressed before the availability threshold', () => {
    const s = { ...fresh, lastInjectionAt: NOW };
    const result = PointService.onPress(s, NOW, 8, 5);
    expect(result.type).toBe(PressResultType.Unavailable);
    if (result.type === PressResultType.Unavailable) {
      expect(result.daysRemaining).toBe(5);
    }
  });

  test('falls through to the normal blackout outcome once available', () => {
    // Day 5 = yellow under the default 8-cycle — available, but still a
    // blockable color, so pressing it still triggers the usual 1-day
    // blackout (the blackout table is unaffected by this setting).
    const s = { ...fresh, lastInjectionAt: NOW - 5 * DAY };
    const result = PointService.onPress(s, NOW, 8, 5);
    expect(result.type).toBe(PressResultType.Blackout);
    if (result.type === PressResultType.Blackout) {
      expect(result.newState.blackoutDurationDays).toBe(1);
    }
  });

  test('gray/black still take priority over Unavailable', () => {
    const gray = { ...fresh, lastInjectionAt: NOW, isManuallyBlocked: true };
    expect(PointService.onPress(gray, NOW, 8, 5).type).toBe(PressResultType.Blocked);
  });

  test('default daysToAvailable (0) never blocks — unchanged behavior', () => {
    const s = { ...fresh, lastInjectionAt: NOW };
    expect(PointService.onPress(s, NOW).type).toBe(PressResultType.Blackout);
  });
});

// ---------------------------------------------------------------------------
// Point restore mode — Manual
// ---------------------------------------------------------------------------

describe('computePointColor — manual restore mode', () => {
  test('white when never used', () => {
    expect(
      PointService.computePointColor(fresh, NOW, 8, PointRestoreMode.Manual),
    ).toBe(PointColor.White);
  });

  test('marked once used, regardless of how long ago', () => {
    const justNow = { ...fresh, lastInjectionAt: NOW };
    const longAgo = { ...fresh, lastInjectionAt: NOW - 30 * DAY };
    expect(
      PointService.computePointColor(justNow, NOW, 8, PointRestoreMode.Manual),
    ).toBe(PointColor.Marked);
    expect(
      PointService.computePointColor(longAgo, NOW, 8, PointRestoreMode.Manual),
    ).toBe(PointColor.Marked);
  });

  test('gray (manual block) still overrides marked', () => {
    const s = {
      ...fresh,
      lastInjectionAt: NOW,
      isManuallyBlocked: true,
    };
    expect(
      PointService.computePointColor(s, NOW, 8, PointRestoreMode.Manual),
    ).toBe(PointColor.Gray);
  });

  test('a stale blackout is ignored entirely in manual mode', () => {
    const s: StoredPointState = {
      ...fresh,
      lastInjectionAt: NOW,
      blackoutStartedAt: NOW,
      blackoutDurationDays: 4,
    };
    expect(
      PointService.computePointColor(s, NOW, 8, PointRestoreMode.Manual),
    ).toBe(PointColor.Marked);
  });
});

describe('daysUntilAvailable — manual restore mode', () => {
  test('always undefined, regardless of daysToAvailable or color', () => {
    expect(
      PointService.daysUntilAvailable(fresh, NOW, 8, 5, PointRestoreMode.Manual),
    ).toBeUndefined();
    const marked = { ...fresh, lastInjectionAt: NOW };
    expect(
      PointService.daysUntilAvailable(marked, NOW, 8, 5, PointRestoreMode.Manual),
    ).toBeUndefined();
  });
});

describe('onPress — manual restore mode', () => {
  test('marks a fresh (white) point', () => {
    const result = PointService.onPress(
      fresh,
      NOW,
      8,
      0,
      PointRestoreMode.Manual,
    );
    expect(result.type).toBe(PressResultType.Injection);
    if (result.type === PressResultType.Injection) {
      expect(result.newState.lastInjectionAt).toBe(NOW);
    }
  });

  test('blocked once already marked — cannot press again', () => {
    const s = { ...fresh, lastInjectionAt: NOW - 30 * DAY };
    const result = PointService.onPress(s, NOW, 8, 0, PointRestoreMode.Manual);
    expect(result.type).toBe(PressResultType.Blocked);
  });

  test('blocked when manually (gray) blocked', () => {
    const s = { ...fresh, isManuallyBlocked: true };
    const result = PointService.onPress(s, NOW, 8, 0, PointRestoreMode.Manual);
    expect(result.type).toBe(PressResultType.Blocked);
  });

  test('never produces a blackout outcome', () => {
    const s = { ...fresh, lastInjectionAt: NOW };
    const result = PointService.onPress(s, NOW, 8, 0, PointRestoreMode.Manual);
    expect(result.type).not.toBe(PressResultType.Blackout);
  });
});

describe('colorLabel — marked', () => {
  test('returns a Marked descriptor', () => {
    expect(PointService.colorLabel(PointColor.Marked, 8)).toEqual({
      type: ColorLabelType.Marked,
    });
  });
});

describe('colorLabel — manual restore mode', () => {
  test('returns a WhiteManual descriptor for White, with no count', () => {
    expect(
      PointService.colorLabel(PointColor.White, 8, PointRestoreMode.Manual),
    ).toEqual({ type: ColorLabelType.WhiteManual });
  });

  test('Auto mode is unaffected', () => {
    expect(
      PointService.colorLabel(PointColor.White, 8, PointRestoreMode.Auto),
    ).toEqual({ type: ColorLabelType.White, count: 8 });
  });
});
