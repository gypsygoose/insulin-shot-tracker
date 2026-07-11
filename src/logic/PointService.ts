import { PointColor, StoredPointState } from "../types";
import { DEFAULT_DAYS_TO_WHITE } from "../constants";
import { daysBetween, injectionCycleColor, postBlackoutColor } from "./utils";
import { DAY_MS, FULL_CYCLE_COLORS, COLOR_REMOVAL_ORDER } from "./constants";
import {
  PressResultType,
  PressResult,
  ColorLabelType,
  ColorLabelDescriptor,
} from "./types";

// Injection-site color computation and press handling — every method is
// static, so callers reach it as PointService.computePointColor() etc.
// without needing to create/thread an instance (see CLAUDE.md's "Helper
// function / hook placement" — same role StorageService plays for AsyncStorage).
export class PointService {
  // ---------------------------------------------------------------------
  // Color computation
  // ---------------------------------------------------------------------

  // Colors used for the normal injection cycle at a given daysToWhite
  // setting, in day order (index === days since injection). White is
  // reached once daysSince >= this list's length, i.e. on day `daysToWhite`.
  static activeCycleColors(daysToWhite: number): PointColor[] {
    const removeCount = FULL_CYCLE_COLORS.length - daysToWhite;
    const removed = new Set(COLOR_REMOVAL_ORDER.slice(0, removeCount));
    return FULL_CYCLE_COLORS.filter((color) => !removed.has(color));
  }

  static computePointColor(
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
  static getBlackoutEndAt(state: StoredPointState): number | undefined {
    if (
      state.blackoutStartedAt === undefined ||
      state.blackoutDurationDays === undefined
    ) {
      return undefined;
    }
    return state.blackoutStartedAt + state.blackoutDurationDays * DAY_MS;
  }

  // ---------------------------------------------------------------------
  // Blackout duration by current color (days)
  // ---------------------------------------------------------------------

  private static blackoutDurationFor(color: PointColor): number | null {
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

  // ---------------------------------------------------------------------
  // State transitions
  // ---------------------------------------------------------------------

  static onPress(
    state: StoredPointState,
    now: number,
    daysToWhite: number = DEFAULT_DAYS_TO_WHITE,
  ): PressResult {
    const color = PointService.computePointColor(state, now, daysToWhite);

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
    const days = PointService.blackoutDurationFor(color)!;
    return {
      type: PressResultType.Blackout,
      newState: {
        ...state,
        blackoutStartedAt: now,
        blackoutDurationDays: days,
      },
    };
  }

  // Descriptor for when a color is reached, dependent on the daysToWhite
  // setting for colors that are part of the injection cycle.
  static colorLabel(
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
        const days = PointService.activeCycleColors(daysToWhite).indexOf(color);
        return { type: ColorLabelType.Days, count: days };
      }
    }
  }

  // Contrast text color for checkmark/text on each background
  static checkmarkColor(bg: PointColor): string {
    switch (bg) {
      case PointColor.White:
      case PointColor.Yellow:
      case PointColor.Orange:
        return "#111111";
      default:
        return "#FFFFFF";
    }
  }
}
