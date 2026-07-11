import { MAX_DAYS_TO_WHITE, MIN_DAYS_TO_WHITE } from "../../constants";

export function clampDaysToWhite(days: number): number {
  return Math.min(MAX_DAYS_TO_WHITE, Math.max(MIN_DAYS_TO_WHITE, days));
}
