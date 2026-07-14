import { PointColor, PointRestoreMode } from "../../../types";
import { PointService } from "../../../logic";

// Color scheme rows shown in order. Auto: white (free), the active
// injection cycle (fewer entries when daysToWhite is reduced), then the two
// block states. Manual restore mode has only three states — the day-based
// cycle and system blackout never apply — see CLAUDE.md's "Point restore
// mode" section.
export function colorOrder(
  daysToWhite: number,
  pointRestoreMode: PointRestoreMode,
): PointColor[] {
  if (pointRestoreMode === PointRestoreMode.Manual) {
    return [PointColor.White, PointColor.Marked, PointColor.Gray];
  }
  return [
    PointColor.White,
    ...PointService.activeCycleColors(daysToWhite),
    PointColor.Black,
    PointColor.Gray,
  ];
}
