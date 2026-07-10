import {
  computeButtonColor,
  onPress,
  toggleManualBlock,
  blackoutDurationFor,
  activeCycleColors,
  colorLabel,
  ColorLabelType,
  PressResultType,
  DAY_MS,
} from './stateMachine';
import { ButtonColor, StoredButtonState } from '../types';

const DAY = DAY_MS;
const NOW = 1000000000000; // fixed reference timestamp

const fresh: StoredButtonState = { buttonId: 'x', isManuallyBlocked: false };

// ---------------------------------------------------------------------------
// computeButtonColor — normal injection cycle
// ---------------------------------------------------------------------------

describe('computeButtonColor — normal cycle', () => {
  test('white when never used', () => {
    expect(computeButtonColor(fresh, NOW)).toBe(ButtonColor.White);
  });

  test('maroon on day 0', () => {
    const s = { ...fresh, lastInjectionAt: NOW };
    expect(computeButtonColor(s, NOW)).toBe(ButtonColor.Maroon);
  });

  test('maroon stays until local midnight, regardless of elapsed hours', () => {
    const pressedAt = new Date(2024, 6, 3, 15, 30).getTime(); // 3 July, 15:30 local
    const sameEvening = new Date(2024, 6, 3, 23, 59).getTime(); // still 3 July
    const s = { ...fresh, lastInjectionAt: pressedAt };
    expect(computeButtonColor(s, sameEvening)).toBe(ButtonColor.Maroon);
  });

  test('turns red right after local midnight, even before 24 h have elapsed', () => {
    const pressedAt = new Date(2024, 6, 3, 15, 30).getTime(); // 3 July, 15:30 local
    const nextMidnight = new Date(2024, 6, 4, 0, 0).getTime(); // 4 July, 00:00 local
    const s = { ...fresh, lastInjectionAt: pressedAt };
    expect(computeButtonColor(s, nextMidnight)).toBe(ButtonColor.Red);
  });

  test('red on day 1', () => {
    const s = { ...fresh, lastInjectionAt: NOW - DAY };
    expect(computeButtonColor(s, NOW)).toBe(ButtonColor.Red);
  });

  test('dark-orange on day 2', () => {
    const s = { ...fresh, lastInjectionAt: NOW - 2 * DAY };
    expect(computeButtonColor(s, NOW)).toBe(ButtonColor.DarkOrange);
  });

  test('orange on day 3', () => {
    const s = { ...fresh, lastInjectionAt: NOW - 3 * DAY };
    expect(computeButtonColor(s, NOW)).toBe(ButtonColor.Orange);
  });

  test('dark-yellow on day 4', () => {
    const s = { ...fresh, lastInjectionAt: NOW - 4 * DAY };
    expect(computeButtonColor(s, NOW)).toBe(ButtonColor.DarkYellow);
  });

  test('yellow on day 5', () => {
    const s = { ...fresh, lastInjectionAt: NOW - 5 * DAY };
    expect(computeButtonColor(s, NOW)).toBe(ButtonColor.Yellow);
  });

  test('dark-green on day 6', () => {
    const s = { ...fresh, lastInjectionAt: NOW - 6 * DAY };
    expect(computeButtonColor(s, NOW)).toBe(ButtonColor.DarkGreen);
  });

  test('green on day 7', () => {
    const s = { ...fresh, lastInjectionAt: NOW - 7 * DAY };
    expect(computeButtonColor(s, NOW)).toBe(ButtonColor.Green);
  });

  test('white on day 8', () => {
    const s = { ...fresh, lastInjectionAt: NOW - 8 * DAY };
    expect(computeButtonColor(s, NOW)).toBe(ButtonColor.White);
  });

  test('white on day 30', () => {
    const s = { ...fresh, lastInjectionAt: NOW - 30 * DAY };
    expect(computeButtonColor(s, NOW)).toBe(ButtonColor.White);
  });
});

// ---------------------------------------------------------------------------
// computeButtonColor — manual block
// ---------------------------------------------------------------------------

describe('computeButtonColor — gray (manual block)', () => {
  test('gray overrides normal cycle', () => {
    const s = { ...fresh, lastInjectionAt: NOW - DAY, isManuallyBlocked: true };
    expect(computeButtonColor(s, NOW)).toBe(ButtonColor.Gray);
  });

  test('gray overrides blackout', () => {
    const s: StoredButtonState = {
      ...fresh,
      blackoutStartedAt: NOW - DAY,
      blackoutDurationDays: 4,
      isManuallyBlocked: true,
    };
    expect(computeButtonColor(s, NOW)).toBe(ButtonColor.Gray);
  });
});

// ---------------------------------------------------------------------------
// computeButtonColor — blackout cycle
// ---------------------------------------------------------------------------

describe('computeButtonColor — blackout state', () => {
  test('black during blackout period', () => {
    const s: StoredButtonState = {
      ...fresh,
      lastInjectionAt: NOW,
      blackoutStartedAt: NOW,
      blackoutDurationDays: 4,
    };
    expect(computeButtonColor(s, NOW + DAY)).toBe(ButtonColor.Black);
    expect(computeButtonColor(s, NOW + 3 * DAY)).toBe(ButtonColor.Black);
  });

  test('red on day 0 after blackout ends', () => {
    const s: StoredButtonState = {
      ...fresh,
      blackoutStartedAt: NOW - 4 * DAY,
      blackoutDurationDays: 4,
    };
    expect(computeButtonColor(s, NOW)).toBe(ButtonColor.Red);
  });

  test('post-blackout cycle skips maroon (starts at red)', () => {
    const s: StoredButtonState = {
      ...fresh,
      blackoutStartedAt: NOW - 4 * DAY,
      blackoutDurationDays: 4,
    };
    // day 0 after blackout end = red
    expect(computeButtonColor(s, NOW)).toBe(ButtonColor.Red);
    // day 1 after end = dark-orange
    expect(computeButtonColor(s, NOW + DAY)).toBe(ButtonColor.DarkOrange);
    // day 6 after end = green
    expect(computeButtonColor(s, NOW + 6 * DAY)).toBe(ButtonColor.Green);
    // day 7 after end = white
    expect(computeButtonColor(s, NOW + 7 * DAY)).toBe(ButtonColor.White);
  });

  test('new injection after blackout overrides post-blackout cycle', () => {
    const s: StoredButtonState = {
      ...fresh,
      blackoutStartedAt: NOW - 5 * DAY,  // blackout started 5 days ago
      blackoutDurationDays: 4,             // ended 1 day ago
      lastInjectionAt: NOW,               // new injection just now (> blackoutStartedAt)
    };
    expect(computeButtonColor(s, NOW)).toBe(ButtonColor.Maroon);
  });
});

// ---------------------------------------------------------------------------
// blackoutDurationFor
// ---------------------------------------------------------------------------

describe('blackoutDurationFor', () => {
  test('4 days for maroon', () => expect(blackoutDurationFor(ButtonColor.Maroon)).toBe(4));
  test('4 days for red', () => expect(blackoutDurationFor(ButtonColor.Red)).toBe(4));
  test('2 days for dark-orange', () => expect(blackoutDurationFor(ButtonColor.DarkOrange)).toBe(2));
  test('2 days for orange', () => expect(blackoutDurationFor(ButtonColor.Orange)).toBe(2));
  test('1 day for dark-yellow', () => expect(blackoutDurationFor(ButtonColor.DarkYellow)).toBe(1));
  test('1 day for yellow', () => expect(blackoutDurationFor(ButtonColor.Yellow)).toBe(1));
  test('null for white', () => expect(blackoutDurationFor(ButtonColor.White)).toBeNull());
  test('null for green', () => expect(blackoutDurationFor(ButtonColor.Green)).toBeNull());
  test('null for dark-green', () => expect(blackoutDurationFor(ButtonColor.DarkGreen)).toBeNull());
});

// ---------------------------------------------------------------------------
// onPress
// ---------------------------------------------------------------------------

describe('onPress', () => {
  test('injection on white button', () => {
    const result = onPress(fresh, NOW);
    expect(result.type).toBe(PressResultType.Injection);
    if (result.type === PressResultType.Injection) {
      expect(result.newState.lastInjectionAt).toBe(NOW);
      expect(result.newState.blackoutStartedAt).toBeUndefined();
    }
  });

  test('injection on dark-green button (day 6)', () => {
    const s = { ...fresh, lastInjectionAt: NOW - 6 * DAY };
    const result = onPress(s, NOW);
    expect(result.type).toBe(PressResultType.Injection);
  });

  test('injection on green button (day 7)', () => {
    const s = { ...fresh, lastInjectionAt: NOW - 7 * DAY };
    const result = onPress(s, NOW);
    expect(result.type).toBe(PressResultType.Injection);
  });

  test('blackout on maroon button — 4 days', () => {
    const s = { ...fresh, lastInjectionAt: NOW - 0 * DAY };
    const result = onPress(s, NOW);
    expect(result.type).toBe(PressResultType.Blackout);
    if (result.type === PressResultType.Blackout) {
      expect(result.newState.blackoutDurationDays).toBe(4);
    }
  });

  test('blackout on red button — 4 days', () => {
    const s = { ...fresh, lastInjectionAt: NOW - DAY };
    const result = onPress(s, NOW);
    expect(result.type).toBe(PressResultType.Blackout);
    if (result.type === PressResultType.Blackout) {
      expect(result.newState.blackoutDurationDays).toBe(4);
    }
  });

  test('blackout on orange button — 2 days', () => {
    const s = { ...fresh, lastInjectionAt: NOW - 3 * DAY };
    const result = onPress(s, NOW);
    expect(result.type).toBe(PressResultType.Blackout);
    if (result.type === PressResultType.Blackout) {
      expect(result.newState.blackoutDurationDays).toBe(2);
    }
  });

  test('blackout on yellow button — 1 day', () => {
    const s = { ...fresh, lastInjectionAt: NOW - 5 * DAY };
    const result = onPress(s, NOW);
    expect(result.type).toBe(PressResultType.Blackout);
    if (result.type === PressResultType.Blackout) {
      expect(result.newState.blackoutDurationDays).toBe(1);
    }
  });

  test('blocked on gray (manually blocked) button', () => {
    const s = { ...fresh, isManuallyBlocked: true };
    expect(onPress(s, NOW).type).toBe(PressResultType.Blocked);
  });

  test('blocked on black (blackout active) button', () => {
    const s: StoredButtonState = {
      ...fresh,
      blackoutStartedAt: NOW,
      blackoutDurationDays: 4,
    };
    expect(onPress(s, NOW + DAY).type).toBe(PressResultType.Blocked);
  });
});

// ---------------------------------------------------------------------------
// toggleManualBlock
// ---------------------------------------------------------------------------

describe('toggleManualBlock', () => {
  test('blocks active button', () => {
    const result = toggleManualBlock(fresh);
    expect(result.isManuallyBlocked).toBe(true);
  });

  test('unblocks gray button, keeps cycle running', () => {
    const s: StoredButtonState = {
      ...fresh,
      isManuallyBlocked: true,
      lastInjectionAt: NOW - 2 * DAY,
    };
    const result = toggleManualBlock(s);
    expect(result.isManuallyBlocked).toBe(false);
    // cycle is intact
    expect(computeButtonColor(result, NOW)).toBe(ButtonColor.DarkOrange);
  });
});

// ---------------------------------------------------------------------------
// Configurable daysToWhite
// ---------------------------------------------------------------------------

function colorOnDay(daysSince: number, daysToWhite: number): ButtonColor {
  const s = { ...fresh, lastInjectionAt: NOW - daysSince * DAY };
  return computeButtonColor(s, NOW, daysToWhite);
}

describe('activeCycleColors', () => {
  test('daysToWhite 8 (default) keeps the full 8-color cycle', () => {
    expect(activeCycleColors(8)).toEqual([
      ButtonColor.Maroon,
      ButtonColor.Red,
      ButtonColor.DarkOrange,
      ButtonColor.Orange,
      ButtonColor.DarkYellow,
      ButtonColor.Yellow,
      ButtonColor.DarkGreen,
      ButtonColor.Green,
    ]);
  });

  test('daysToWhite 7 drops dark-yellow', () => {
    expect(activeCycleColors(7)).toEqual([
      ButtonColor.Maroon,
      ButtonColor.Red,
      ButtonColor.DarkOrange,
      ButtonColor.Orange,
      ButtonColor.Yellow,
      ButtonColor.DarkGreen,
      ButtonColor.Green,
    ]);
  });

  test('daysToWhite 6 drops dark-yellow and dark-orange', () => {
    expect(activeCycleColors(6)).toEqual([
      ButtonColor.Maroon,
      ButtonColor.Red,
      ButtonColor.Orange,
      ButtonColor.Yellow,
      ButtonColor.DarkGreen,
      ButtonColor.Green,
    ]);
  });

  test('daysToWhite 1 keeps only maroon', () => {
    expect(activeCycleColors(1)).toEqual([ButtonColor.Maroon]);
  });
});

describe('computeButtonColor — configurable daysToWhite', () => {
  test('daysToWhite 8 (default) matches unmodified behavior', () => {
    expect(colorOnDay(0, 8)).toBe(ButtonColor.Maroon);
    expect(colorOnDay(3, 8)).toBe(ButtonColor.Orange);
    expect(colorOnDay(7, 8)).toBe(ButtonColor.Green);
    expect(colorOnDay(8, 8)).toBe(ButtonColor.White);
  });

  test('daysToWhite 7 — orange on day 3, yellow on day 4, green on day 6, white on day 7', () => {
    expect(colorOnDay(3, 7)).toBe(ButtonColor.Orange);
    expect(colorOnDay(4, 7)).toBe(ButtonColor.Yellow);
    expect(colorOnDay(6, 7)).toBe(ButtonColor.Green);
    expect(colorOnDay(7, 7)).toBe(ButtonColor.White);
  });

  test('daysToWhite 6 — red on day 1, orange on day 2, yellow on day 3, green on day 5, white on day 6', () => {
    expect(colorOnDay(1, 6)).toBe(ButtonColor.Red);
    expect(colorOnDay(2, 6)).toBe(ButtonColor.Orange);
    expect(colorOnDay(3, 6)).toBe(ButtonColor.Yellow);
    expect(colorOnDay(5, 6)).toBe(ButtonColor.Green);
    expect(colorOnDay(6, 6)).toBe(ButtonColor.White);
  });

  test('daysToWhite 1 — white on day 1', () => {
    expect(colorOnDay(0, 1)).toBe(ButtonColor.Maroon);
    expect(colorOnDay(1, 1)).toBe(ButtonColor.White);
  });

  test('calling without a third argument defaults to 8', () => {
    const s = { ...fresh, lastInjectionAt: NOW - 3 * DAY };
    expect(computeButtonColor(s, NOW)).toBe(ButtonColor.Orange);
  });

  test('post-blackout cycle also compresses with daysToWhite', () => {
    const s: StoredButtonState = {
      ...fresh,
      blackoutStartedAt: NOW - 4 * DAY,
      blackoutDurationDays: 4,
    };
    // daysToWhite 6 → active cycle minus maroon: red, orange, yellow, dark-green, green
    expect(computeButtonColor(s, NOW, 6)).toBe(ButtonColor.Red);
    expect(computeButtonColor(s, NOW + DAY, 6)).toBe(ButtonColor.Orange);
    expect(computeButtonColor(s, NOW + 4 * DAY, 6)).toBe(ButtonColor.Green);
    expect(computeButtonColor(s, NOW + 5 * DAY, 6)).toBe(ButtonColor.White);
  });

  test('post-blackout is immediately white when daysToWhite is 1 (no colors besides maroon)', () => {
    const s: StoredButtonState = {
      ...fresh,
      blackoutStartedAt: NOW - 4 * DAY,
      blackoutDurationDays: 4,
    };
    expect(computeButtonColor(s, NOW, 1)).toBe(ButtonColor.White);
  });
});

describe('onPress — respects daysToWhite', () => {
  test('injection on orange button that is now green under a reduced cycle', () => {
    // Under daysToWhite 6, day 5 is green (was yellow under the default 8-cycle)
    const s = { ...fresh, lastInjectionAt: NOW - 5 * DAY };
    const result = onPress(s, NOW, 6);
    expect(result.type).toBe(PressResultType.Injection);
  });

  test('blackout duration is unaffected by daysToWhite (still keyed by color)', () => {
    // Under daysToWhite 6, day 1 is red → still a 4-day blackout
    const s = { ...fresh, lastInjectionAt: NOW - DAY };
    const result = onPress(s, NOW, 6);
    expect(result.type).toBe(PressResultType.Blackout);
    if (result.type === PressResultType.Blackout) {
      expect(result.newState.blackoutDurationDays).toBe(4);
    }
  });
});

describe('colorLabel', () => {
  test('returns a descriptor at daysToWhite 8', () => {
    expect(colorLabel(ButtonColor.Maroon, 8)).toEqual({
      type: ColorLabelType.Maroon,
    });
    expect(colorLabel(ButtonColor.Red, 8)).toEqual({
      type: ColorLabelType.Days,
      count: 1,
    });
    expect(colorLabel(ButtonColor.DarkOrange, 8)).toEqual({
      type: ColorLabelType.Days,
      count: 2,
    });
    expect(colorLabel(ButtonColor.Green, 8)).toEqual({
      type: ColorLabelType.Days,
      count: 7,
    });
    expect(colorLabel(ButtonColor.White, 8)).toEqual({
      type: ColorLabelType.White,
      count: 8,
    });
  });

  test('reflects a reduced daysToWhite', () => {
    expect(colorLabel(ButtonColor.Orange, 7)).toEqual({
      type: ColorLabelType.Days,
      count: 3,
    });
    expect(colorLabel(ButtonColor.Green, 7)).toEqual({
      type: ColorLabelType.Days,
      count: 6,
    });
    expect(colorLabel(ButtonColor.White, 7)).toEqual({
      type: ColorLabelType.White,
      count: 7,
    });
  });

  test('block-state descriptors are unaffected by daysToWhite', () => {
    expect(colorLabel(ButtonColor.Black, 5)).toEqual({
      type: ColorLabelType.Black,
    });
    expect(colorLabel(ButtonColor.Gray, 5)).toEqual({
      type: ColorLabelType.Gray,
    });
  });
});
