import { PointColor } from "../types";

export const DAY_MS = 24 * 60 * 60 * 1000;

// Full injection cycle (day 0 → day 7), used when daysToWhite is at its
// maximum. Reducing daysToWhite drops colors from this list per
// COLOR_REMOVAL_ORDER, compressing the remaining colors into fewer days.
export const FULL_CYCLE_COLORS: PointColor[] = [
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
export const COLOR_REMOVAL_ORDER: PointColor[] = [
  PointColor.DarkYellow,
  PointColor.DarkOrange,
  PointColor.DarkGreen,
  PointColor.Orange,
  PointColor.Green,
  PointColor.Red,
  PointColor.Yellow,
];

// Hex values for each color
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
