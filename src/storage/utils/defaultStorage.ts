import { AppStorage, StoredPointState } from "../../types";
import { POINTS } from "../../data";

export function defaultStorage(): AppStorage {
  const pointStates: Record<string, StoredPointState> = {};
  for (const point of POINTS) {
    pointStates[point.id] = { pointId: point.id, isManuallyBlocked: false };
  }
  return { pointStates, events: [] };
}
