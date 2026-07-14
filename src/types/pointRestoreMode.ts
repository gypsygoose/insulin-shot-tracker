// Point restore mode — Auto resolves a point's color from the existing
// day-based rotation cycle (see CLAUDE.md's "Point colour state machine");
// Manual instead marks a point permanently (black) the moment it's used and
// leaves it disabled for re-marking until the user manually clears it.
export enum PointRestoreMode {
  Auto = 'auto',
  Manual = 'manual',
}
