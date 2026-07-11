import { DAY_MS } from "../constants";

// Index of the local calendar day containing `ts`, counted from the epoch.
// Built from local Y/M/D via Date.UTC so it stays an exact integer regardless
// of DST shifts in the device's timezone.
export function localDayIndex(ts: number): number {
  const date = new Date(ts);

  date.setHours(0, 0, 0, 0);

  return Number(date) / DAY_MS;
}
