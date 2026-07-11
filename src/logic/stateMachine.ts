import { PointColor, StoredPointState } from "../types";
import { DEFAULT_DAYS_TO_WHITE } from "../constants";

export const DAY_MS = 24 * 60 * 60 * 1000;

// ---------------------------------------------------------------------------
// Calendar-day helpers (local timezone)
// ---------------------------------------------------------------------------

// Index of the local calendar day containing `ts`, counted from the epoch.
// Built from local Y/M/D via Date.UTC so it stays an exact integer regardless
// of DST shifts in the device's timezone.
function localDayIndex(ts: number): number {
  const d = new Date(ts);

  d.setHours(0, 0, 0, 0);

  return Number(d) / DAY_MS;
}

// Number of local-calendar-day boundaries crossed between `from` and `to`.
// A press at 15:30 counts as day 0 until local midnight, then becomes day 1,
// regardless of how many hours have actually elapsed.
function daysBetween(from: number, to: number): number {
  return localDayIndex(to) - localDayIndex(from);
}

// ---------------------------------------------------------------------------
// Color computation
// ---------------------------------------------------------------------------

// Full injection cycle (day 0 → day 7), used when daysToWhite is at its
// maximum. Reducing daysToWhite drops colors from this list per
// COLOR_REMOVAL_ORDER, compressing the remaining colors into fewer days.
const FULL_CYCLE_COLORS: PointColor[] = [
  PointColor.Maroon,
  PointColor.Red,
  PointColor.DarkOrange,
  PointColor.Orange,
  PointColor.DarkYellow,
  PointColor.Yellow,
  PointColor.DarkGreen,
  PointColor.Green,
];

// Order in which colors are dropped from FULL_CYCLE_COLORS as daysToWhite
// decreases from MAX_DAYS_TO_WHITE. Maroon (day 0) is never dropped.
const COLOR_REMOVAL_ORDER: PointColor[] = [
  PointColor.DarkYellow,
  PointColor.DarkOrange,
  PointColor.DarkGreen,
  PointColor.Orange,
  PointColor.Green,
  PointColor.Red,
  PointColor.Yellow,
];

// Colors used for the normal injection cycle at a given daysToWhite setting,
// in day order (index === days since injection). White is reached once
// daysSince >= this list's length, i.e. on day `daysToWhite`.
export function activeCycleColors(daysToWhite: number): PointColor[] {
  const removeCount = FULL_CYCLE_COLORS.length - daysToWhite;
  const removed = new Set(COLOR_REMOVAL_ORDER.slice(0, removeCount));
  return FULL_CYCLE_COLORS.filter((c) => !removed.has(c));
}

function injectionCycleColor(
  daysSince: number,
  daysToWhite: number,
): PointColor {
  const active = activeCycleColors(daysToWhite);
  return daysSince < active.length ? active[daysSince] : PointColor.White;
}

// After blackout ends: cycle starts at red (maroon is skipped)
function postBlackoutColor(
  daysSinceEnd: number,
  daysToWhite: number,
): PointColor {
  const active = activeCycleColors(daysToWhite).filter(
    (c) => c !== PointColor.Maroon,
  );
  return daysSinceEnd < active.length
    ? active[daysSinceEnd]
    : PointColor.White;
}

export function computePointColor(
  state: StoredPointState,
  now: number,
  daysToWhite: number = DEFAULT_DAYS_TO_WHITE,
): PointColor {
  if (state.isManuallyBlocked) return PointColor.Gray;

  const hasBlackout =
    state.blackoutStartedAt !== undefined &&
    state.blackoutDurationDays !== undefined;

  if (hasBlackout) {
    const blackoutEnd =
      state.blackoutStartedAt! + state.blackoutDurationDays! * DAY_MS;
    const injectionAfterBlackout =
      state.lastInjectionAt !== undefined &&
      state.lastInjectionAt > state.blackoutStartedAt!;

    if (!injectionAfterBlackout) {
      if (now < blackoutEnd) return PointColor.Black;
      const days = daysBetween(blackoutEnd, now);
      return postBlackoutColor(days, daysToWhite);
    }
  }

  if (state.lastInjectionAt === undefined) return PointColor.White;
  const days = daysBetween(state.lastInjectionAt, now);
  return injectionCycleColor(days, daysToWhite);
}

// Timestamp when the current system blackout (black state) will end, if any.
export function getBlackoutEndAt(state: StoredPointState): number | undefined {
  if (
    state.blackoutStartedAt === undefined ||
    state.blackoutDurationDays === undefined
  ) {
    return undefined;
  }
  return state.blackoutStartedAt + state.blackoutDurationDays * DAY_MS;
}

// ---------------------------------------------------------------------------
// Blackout duration by current color (days)
// ---------------------------------------------------------------------------

export function blackoutDurationFor(color: PointColor): number | null {
  switch (color) {
    case PointColor.Maroon:
    case PointColor.Red:
      return 4;
    case PointColor.DarkOrange:
    case PointColor.Orange:
      return 2;
    case PointColor.DarkYellow:
    case PointColor.Yellow:
      return 1;
    default:
      return null; // not a blockable color
  }
}

// ---------------------------------------------------------------------------
// State transitions
// ---------------------------------------------------------------------------

export enum PressResultType {
  Injection = "injection",
  Blackout = "blackout",
  Blocked = "blocked",
}

export type PressResult =
  | { type: PressResultType.Injection; newState: StoredPointState }
  | { type: PressResultType.Blackout; newState: StoredPointState }
  | { type: PressResultType.Blocked };

export function onPress(
  state: StoredPointState,
  now: number,
  daysToWhite: number = DEFAULT_DAYS_TO_WHITE,
): PressResult {
  const color = computePointColor(state, now, daysToWhite);

  if (color === PointColor.Gray || color === PointColor.Black)
    return { type: PressResultType.Blocked };

  // White, dark-green, green → fresh injection
  if (
    color === PointColor.White ||
    color === PointColor.DarkGreen ||
    color === PointColor.Green
  ) {
    return {
      type: PressResultType.Injection,
      newState: {
        ...state,
        lastInjectionAt: now,
        blackoutStartedAt: undefined,
        blackoutDurationDays: undefined,
      },
    };
  }

  // Non-white, non-green → trigger blackout
  const days = blackoutDurationFor(color)!;
  return {
    type: PressResultType.Blackout,
    newState: {
      ...state,
      blackoutStartedAt: now,
      blackoutDurationDays: days,
    },
  };
}

export function toggleManualBlock(state: StoredPointState): StoredPointState {
  return { ...state, isManuallyBlocked: !state.isManuallyBlocked };
}

// ---------------------------------------------------------------------------
// Hex values for each color
// ---------------------------------------------------------------------------

export const COLOR_HEX: Record<PointColor, string> = {
  [PointColor.White]: "#EBEBEB",
  [PointColor.Maroon]: "#7B1D1D",
  [PointColor.Red]: "#DC2626",
  [PointColor.DarkOrange]: "#C2410C",
  [PointColor.Orange]: "#EA580C",
  [PointColor.DarkYellow]: "#A16207",
  [PointColor.Yellow]: "#EAB308",
  [PointColor.DarkGreen]: "#166534",
  [PointColor.Green]: "#16A34A",
  [PointColor.Black]: "#111111",
  [PointColor.Gray]: "#6B7280",
};

// Which sentence colorLabel() below describes — kept as a descriptor rather
// than a formatted string so this file (tested without an RN renderer) stays
// free of an i18next dependency; the UI layer (HelpSheet.tsx) formats it via
// t('stateMachine.colorLabel.*', { count }).
export enum ColorLabelType {
  White = "white",
  Maroon = "maroon",
  Black = "black",
  Gray = "gray",
  Days = "days",
}

export interface ColorLabelDescriptor {
  type: ColorLabelType;
  count?: number;
}

// Descriptor for when a color is reached, dependent on the daysToWhite
// setting for colors that are part of the injection cycle.
export function colorLabel(
  color: PointColor,
  daysToWhite: number = DEFAULT_DAYS_TO_WHITE,
): ColorLabelDescriptor {
  switch (color) {
    case PointColor.White:
      return { type: ColorLabelType.White, count: daysToWhite };
    case PointColor.Maroon:
      return { type: ColorLabelType.Maroon };
    case PointColor.Black:
      return { type: ColorLabelType.Black };
    case PointColor.Gray:
      return { type: ColorLabelType.Gray };
    default: {
      const days = activeCycleColors(daysToWhite).indexOf(color);
      return { type: ColorLabelType.Days, count: days };
    }
  }
}

// Contrast text color for checkmark/text on each background
export function checkmarkColor(bg: PointColor): string {
  switch (bg) {
    case PointColor.White:
    case PointColor.Yellow:
    case PointColor.Orange:
      return "#111111";
    default:
      return "#FFFFFF";
  }
}
