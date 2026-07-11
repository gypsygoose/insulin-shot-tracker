import { PointColor } from "../../../types";
import { PointService } from "../../../logic";

// Color scheme rows shown in order: white (free), the active injection
// cycle (fewer entries when daysToWhite is reduced), then the two block
// states.
export function colorOrder(daysToWhite: number): PointColor[] {
  return [
    PointColor.White,
    ...PointService.activeCycleColors(daysToWhite),
    PointColor.Black,
    PointColor.Gray,
  ];
}
