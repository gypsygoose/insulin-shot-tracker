import { localDayIndex } from "./localDayIndex";

// Number of local-calendar-day boundaries crossed between `from` and `to`.
// A press at 15:30 counts as day 0 until local midnight, then becomes day 1,
// regardless of how many hours have actually elapsed.
export function daysBetween(from: number, to: number): number {
  return localDayIndex(to) - localDayIndex(from);
}
