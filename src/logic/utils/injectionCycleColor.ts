import { PointColor } from "../../types";
import { PointService } from "../PointService";

export function injectionCycleColor(
  daysSince: number,
  daysToWhite: number,
): PointColor {
  const active = PointService.activeCycleColors(daysToWhite);
  return daysSince < active.length ? active[daysSince] : PointColor.White;
}
