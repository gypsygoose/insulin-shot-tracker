import { PointColor } from "../../types";
import { PointService } from "../PointService";

// After blackout ends: cycle starts at red (maroon is skipped)
export function postBlackoutColor(
  daysSinceEnd: number,
  daysToWhite: number,
): PointColor {
  const active = PointService.activeCycleColors(daysToWhite).filter(
    (color) => color !== PointColor.Maroon,
  );
  return daysSinceEnd < active.length
    ? active[daysSinceEnd]
    : PointColor.White;
}
