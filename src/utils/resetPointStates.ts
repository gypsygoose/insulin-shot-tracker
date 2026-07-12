import { StoredPointState } from "../types";

// Builds a fresh, unblocked StoredPointState for each given point id — used
// by useAppStore's clearSelected to reset a partition of pointStates
// (produced by partitionPointStatesByBlock) back to its default value.
export function resetPointStates(
  pointIds: string[],
): Record<string, StoredPointState> {
  const reset: Record<string, StoredPointState> = {};
  for (const pointId of pointIds) {
    reset[pointId] = { pointId, isManuallyBlocked: false };
  }
  return reset;
}
