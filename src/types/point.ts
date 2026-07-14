import { ZoneId } from './zone';

export enum PointColor {
  White = 'white',
  Maroon = 'maroon',
  Red = 'red',
  DarkOrange = 'dark-orange',
  Orange = 'orange',
  DarkYellow = 'dark-yellow',
  Yellow = 'yellow',
  DarkGreen = 'dark-green',
  Green = 'green',
  Black = 'black',
  Gray = 'gray',
  // Point restore mode: Manual — a point's own permanent "used" color, once
  // it's ever been marked. Deliberately distinct from Black (system
  // blackout, only ever set in Auto mode) even though both render as the
  // same near-black hex — see PointService.computePointColor/onPress and
  // CLAUDE.md's "Point restore mode" section.
  Marked = 'marked',
}

export interface PointDefinition {
  id: string;
  zoneId: ZoneId;
}

// Body-relative "address" of a point — see POINT_ADDRESS in data/zones.ts.
export interface PointAddress {
  row: number;
  column: number;
}

// Persisted per-point state
export interface StoredPointState {
  pointId: string;
  lastInjectionAt?: number;
  blackoutStartedAt?: number;
  blackoutDurationDays?: number;
  isManuallyBlocked: boolean;
  manuallyBlockedAt?: number;
}
