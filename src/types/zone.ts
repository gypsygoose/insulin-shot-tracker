// Type-only: point.ts imports ZoneId from this file, so a runtime import
// here would be circular — the type-only form is elided at compile time.
import type { PointDefinition, PointAddress } from './point';

export enum ZoneGroup {
  Thighs = 'thighs',
  ShouldersAndBelly = 'shoulders-and-belly',
}

export enum ZoneId {
  ShoulderRight = 'shoulder-right',
  ShoulderLeft = 'shoulder-left',
  BellyRight = 'belly-right',
  BellyLeft = 'belly-left',
  ThighRight = 'thigh-right',
  ThighLeft = 'thigh-left',
}

// Left/right zones of the same body part share one accent/glow colour pair
// (see ZONE_TYPE in data/zones.ts and ThemeColors.zoneColors in
// theme/types.ts) — this groups them for that lookup, distinct from
// ZoneGroup above (which groups by checkmark-sharing behaviour instead).
export enum ZoneType {
  Shoulder = 'shoulder',
  Belly = 'belly',
  Thigh = 'thigh',
}

export interface Zone {
  id: ZoneId;
  group: ZoneGroup;
}

// Zone container layout: position + size as fraction of the body image
// container (0..1), plus the point grid dimensions inside it.
export interface ZoneLayout {
  x: number;
  y: number;
  width: number;
  height: number;
  rows: number;
  cols: number;
}

// User-configurable point grid size for one zone type (see ZonePointCounts
// below) — minimum 1 row/column (src/constants.ts's MIN_ZONE_ROWS/
// MIN_ZONE_COLS), maximum varies per zone type (ZONE_MAX_GRID in
// data/zones.ts), default = today's fixed counts (DEFAULT_ZONE_POINT_COUNTS,
// also in data/zones.ts).
export interface ZoneGridConfig {
  rows: number;
  cols: number;
}

// One grid config per ZoneType (shared by both zones of a left/right pair —
// see CLAUDE.md's "Zones and points"), not per ZoneId.
export type ZonePointCounts = Record<ZoneType, ZoneGridConfig>;

// Whether each individual zone is shown on the body / usable for injections
// (see ZonesDialog and CLAUDE.md's "Zones and points") — unlike
// ZonePointCounts, this is per ZoneId, not per ZoneType, since left/right
// sides of the same body part are toggled independently.
export type EnabledZones = Record<ZoneId, boolean>;

// Bundle returned by data/zones.ts's buildZoneData(zonePointCounts) — all of
// this used to be static module-level consts computed once from a fixed
// ZONE_LAYOUT; now it's recomputed whenever ZonePointCounts changes, so it's
// threaded through as a single value instead (see useAppStore.ts's
// `zoneData`).
export interface ZoneRuntimeData {
  zoneLayout: Record<ZoneId, ZoneLayout>;
  points: PointDefinition[];
  pointMap: Record<string, PointDefinition>;
  pointsByZone: Record<ZoneId, PointDefinition[]>;
  pointAddress: Record<string, PointAddress>;
}
