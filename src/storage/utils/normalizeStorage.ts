import { AppStorage } from "../../types";
import { POINTS } from "../../data";

// Merge any points not yet present (e.g. loading data saved by an older
// app version, or a file imported from a different point in time).
export function normalizeStorage(parsed: Partial<AppStorage>): AppStorage {
  const states = parsed.pointStates ?? {};
  for (const point of POINTS) {
    if (!states[point.id]) {
      states[point.id] = { pointId: point.id, isManuallyBlocked: false };
    }
  }
  return { pointStates: states, events: parsed.events ?? [] };
}
