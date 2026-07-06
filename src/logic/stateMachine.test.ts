import {
  computeButtonColor,
  onPress,
  toggleManualBlock,
  blackoutDurationFor,
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

  test('maroon within day 0 (same day, 23 h later)', () => {
    const s = { ...fresh, lastInjectionAt: NOW };
    expect(computeButtonColor(s, NOW + 23 * 60 * 60 * 1000)).toBe(ButtonColor.Maroon);
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
