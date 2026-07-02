import { ButtonColor, StoredButtonState } from "../types";

const DAY_MS = 24 * 60 * 60 * 1000;

// ---------------------------------------------------------------------------
// Color computation
// ---------------------------------------------------------------------------

function injectionCycleColor(daysSince: number): ButtonColor {
  switch (daysSince) {
    case 0:
      return "maroon";
    case 1:
      return "red";
    case 2:
      return "dark-orange";
    case 3:
      return "orange";
    case 4:
      return "dark-yellow";
    case 5:
      return "yellow";
    case 6:
      return "dark-green";
    case 7:
      return "green";
    default:
      return "white";
  }
}

// After blackout ends: cycle starts at red (maroon is skipped)
function postBlackoutColor(daysSinceEnd: number): ButtonColor {
  switch (daysSinceEnd) {
    case 0:
      return "red";
    case 1:
      return "dark-orange";
    case 2:
      return "orange";
    case 3:
      return "dark-yellow";
    case 4:
      return "yellow";
    case 5:
      return "dark-green";
    case 6:
      return "green";
    default:
      return "white";
  }
}

export function computeButtonColor(
  state: StoredButtonState,
  now: number,
): ButtonColor {
  if (state.isManuallyBlocked) return "gray";

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
      if (now < blackoutEnd) return "black";
      const days = Math.floor((now - blackoutEnd) / DAY_MS);
      return postBlackoutColor(days);
    }
  }

  if (state.lastInjectionAt === undefined) return "white";
  const days = Math.floor((now - state.lastInjectionAt) / DAY_MS);
  return injectionCycleColor(days);
}

// ---------------------------------------------------------------------------
// Blackout duration by current color (days)
// ---------------------------------------------------------------------------

export function blackoutDurationFor(color: ButtonColor): number | null {
  switch (color) {
    case "maroon":
    case "red":
      return 4;
    case "dark-orange":
    case "orange":
      return 2;
    case "dark-yellow":
    case "yellow":
      return 1;
    default:
      return null; // not a blockable color
  }
}

// ---------------------------------------------------------------------------
// State transitions
// ---------------------------------------------------------------------------

export type PressResult =
  | { kind: "injection"; newState: StoredButtonState }
  | { kind: "blackout"; newState: StoredButtonState }
  | { kind: "blocked" };

export function onPress(state: StoredButtonState, now: number): PressResult {
  const color = computeButtonColor(state, now);

  if (color === "gray" || color === "black") return { kind: "blocked" };

  // White, dark-green, green → fresh injection
  if (color === "white" || color === "dark-green" || color === "green") {
    return {
      kind: "injection",
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
    kind: "blackout",
    newState: {
      ...state,
      blackoutStartedAt: now,
      blackoutDurationDays: days,
    },
  };
}

export function toggleManualBlock(state: StoredButtonState): StoredButtonState {
  return { ...state, isManuallyBlocked: !state.isManuallyBlocked };
}

// ---------------------------------------------------------------------------
// Hex values for each color
// ---------------------------------------------------------------------------

export const COLOR_HEX: Record<ButtonColor, string> = {
  white: "#EBEBEB",
  maroon: "#7B1D1D",
  red: "#DC2626",
  "dark-orange": "#C2410C",
  orange: "#EA580C",
  "dark-yellow": "#A16207",
  yellow: "#EAB308",
  "dark-green": "#166534",
  green: "#16A34A",
  black: "#111111",
  gray: "#6B7280",
};

export const COLOR_LABEL: Record<ButtonColor, string> = {
  white: "Свободно (не использовалось 8+ дней)",
  maroon: "Только что (день 0)",
  red: "1 день",
  "dark-orange": "2 дня",
  orange: "3 дня",
  "dark-yellow": "4 дня",
  yellow: "5 дней",
  "dark-green": "6 дней",
  green: "7 дней",
  black: "Заблокировано системой из-за частого использования",
  gray: "Заблокировано вручную (травма/синяк)",
};

// Contrast text color for checkmark/text on each background
export function checkmarkColor(bg: ButtonColor): string {
  switch (bg) {
    case "white":
    case "yellow":
    case "orange":
      return "#111111";
    default:
      return "#FFFFFF";
  }
}
