import {
  Zone,
  PointDefinition,
  ZoneLayout,
  ZoneGroup,
  ZoneId,
  ZoneType,
  PointAddress,
} from "../types";
import type { TranslationKey } from "../i18n";

// Zones from Figma design (grYg39698ogy0nEBd88Fup, node 26:3)
// Group label follows patient perspective: "правое" = patient's right = screen LEFT

export const ZONES: Zone[] = [
  { id: ZoneId.ShoulderRight, group: ZoneGroup.ShouldersAndBelly },
  { id: ZoneId.ShoulderLeft, group: ZoneGroup.ShouldersAndBelly },
  { id: ZoneId.BellyRight, group: ZoneGroup.ShouldersAndBelly },
  { id: ZoneId.BellyLeft, group: ZoneGroup.ShouldersAndBelly },
  { id: ZoneId.ThighRight, group: ZoneGroup.Thighs },
  { id: ZoneId.ThighLeft, group: ZoneGroup.Thighs },
];

// Translation key for each zone's display label (see src/i18n/locales/ru.ts
// `zones.*`) — zone data is a module-level array, not a component, so it
// can't call t() itself; readers look up this key and call t() themselves.
export const ZONE_LABEL_KEY: Record<ZoneId, TranslationKey> = {
  [ZoneId.ShoulderRight]: "zones.shoulderRight",
  [ZoneId.ShoulderLeft]: "zones.shoulderLeft",
  [ZoneId.BellyRight]: "zones.bellyRight",
  [ZoneId.BellyLeft]: "zones.bellyLeft",
  [ZoneId.ThighRight]: "zones.thighRight",
  [ZoneId.ThighLeft]: "zones.thighLeft",
};

export const ZONE_MAP: Record<ZoneId, Zone> = Object.fromEntries(
  ZONES.map((zone) => [zone.id, zone]),
) as Record<ZoneId, Zone>;

// Maps each zone to its left/right counterpart, used when mirror mode is on:
// a zone then renders in the screen position its counterpart normally
// occupies (see ZONE_LAYOUT), while keeping its own colour/point identity.
export const ZONE_MIRROR_MAP: Record<ZoneId, ZoneId> = {
  [ZoneId.ShoulderRight]: ZoneId.ShoulderLeft,
  [ZoneId.ShoulderLeft]: ZoneId.ShoulderRight,
  [ZoneId.BellyRight]: ZoneId.BellyLeft,
  [ZoneId.BellyLeft]: ZoneId.BellyRight,
  [ZoneId.ThighRight]: ZoneId.ThighLeft,
  [ZoneId.ThighLeft]: ZoneId.ThighRight,
};

// Left/right zones of the same body part share one accent/glow colour pair
// (theme/palette.ts's ThemeColors.zoneColors, keyed by ZoneType) — this maps
// each ZoneId to that shared type instead of duplicating the pair per zone.
export const ZONE_TYPE: Record<ZoneId, ZoneType> = {
  [ZoneId.ShoulderRight]: ZoneType.Shoulder,
  [ZoneId.ShoulderLeft]: ZoneType.Shoulder,
  [ZoneId.BellyRight]: ZoneType.Belly,
  [ZoneId.BellyLeft]: ZoneType.Belly,
  [ZoneId.ThighRight]: ZoneType.Thigh,
  [ZoneId.ThighLeft]: ZoneType.Thigh,
};

// ---------------------------------------------------------------------------
// Zone container layout — bounding box of each zone as a fraction (0..1) of
// the body image container (393.46×621.91), derived from the zone rectangles
// in the Figma "with buttons" frame (node 27:744, file grYg39698ogy0nEBd88Fup).
// Each zone renders as an absolutely positioned block matching this box;
// `rows`/`cols` describe the point grid
// laid out *inside* that block (points are positioned relative to their own
// zone container, not by global coordinates).
// ---------------------------------------------------------------------------

export const ZONE_LAYOUT: Record<ZoneId, ZoneLayout> = {
  [ZoneId.ShoulderRight]: {
    x: 0.08,
    y: 0.15,
    width: 0.12,
    height: 0.2,
    rows: 3,
    cols: 1,
  },
  [ZoneId.ShoulderLeft]: {
    x: 0.815,
    y: 0.15,
    width: 0.12,
    height: 0.2,
    rows: 3,
    cols: 1,
  },
  [ZoneId.BellyRight]: {
    x: 0.215,
    y: 0.29,
    width: 0.28,
    height: 0.2,
    rows: 3,
    cols: 3,
  },
  [ZoneId.BellyLeft]: {
    x: 0.52,
    y: 0.29,
    width: 0.28,
    height: 0.2,
    rows: 3,
    cols: 3,
  },
  [ZoneId.ThighRight]: {
    x: 0.21,
    y: 0.65,
    width: 0.21,
    height: 0.2,
    rows: 3,
    cols: 2,
  },
  [ZoneId.ThighLeft]: {
    x: 0.605,
    y: 0.65,
    width: 0.2,
    height: 0.2,
    rows: 3,
    cols: 2,
  },
};

// Points within each zone, in row-major order (matches ZONE_LAYOUT rows/cols
// for that zone) — position on screen comes from the flex grid inside the
// zone container, not from stored coordinates.

const shoulderRight: PointDefinition[] = [
  { id: "sr-0", zoneId: ZoneId.ShoulderRight },
  { id: "sr-1", zoneId: ZoneId.ShoulderRight },
  { id: "sr-2", zoneId: ZoneId.ShoulderRight },
];

const shoulderLeft: PointDefinition[] = [
  { id: "sl-0", zoneId: ZoneId.ShoulderLeft },
  { id: "sl-1", zoneId: ZoneId.ShoulderLeft },
  { id: "sl-2", zoneId: ZoneId.ShoulderLeft },
];

const bellyRight: PointDefinition[] = [
  { id: "br-0", zoneId: ZoneId.BellyRight },
  { id: "br-1", zoneId: ZoneId.BellyRight },
  { id: "br-2", zoneId: ZoneId.BellyRight },
  { id: "br-3", zoneId: ZoneId.BellyRight },
  { id: "br-4", zoneId: ZoneId.BellyRight },
  { id: "br-5", zoneId: ZoneId.BellyRight },
  { id: "br-6", zoneId: ZoneId.BellyRight },
  { id: "br-7", zoneId: ZoneId.BellyRight },
  { id: "br-8", zoneId: ZoneId.BellyRight },
];

const bellyLeft: PointDefinition[] = [
  { id: "bl-0", zoneId: ZoneId.BellyLeft },
  { id: "bl-1", zoneId: ZoneId.BellyLeft },
  { id: "bl-2", zoneId: ZoneId.BellyLeft },
  { id: "bl-3", zoneId: ZoneId.BellyLeft },
  { id: "bl-4", zoneId: ZoneId.BellyLeft },
  { id: "bl-5", zoneId: ZoneId.BellyLeft },
  { id: "bl-6", zoneId: ZoneId.BellyLeft },
  { id: "bl-7", zoneId: ZoneId.BellyLeft },
  { id: "bl-8", zoneId: ZoneId.BellyLeft },
];

const thighRight: PointDefinition[] = [
  { id: "tr-0", zoneId: ZoneId.ThighRight },
  { id: "tr-1", zoneId: ZoneId.ThighRight },
  { id: "tr-2", zoneId: ZoneId.ThighRight },
  { id: "tr-3", zoneId: ZoneId.ThighRight },
  { id: "tr-4", zoneId: ZoneId.ThighRight },
  { id: "tr-5", zoneId: ZoneId.ThighRight },
];

const thighLeft: PointDefinition[] = [
  { id: "tl-0", zoneId: ZoneId.ThighLeft },
  { id: "tl-1", zoneId: ZoneId.ThighLeft },
  { id: "tl-2", zoneId: ZoneId.ThighLeft },
  { id: "tl-3", zoneId: ZoneId.ThighLeft },
  { id: "tl-4", zoneId: ZoneId.ThighLeft },
  { id: "tl-5", zoneId: ZoneId.ThighLeft },
];

export const POINTS: PointDefinition[] = [
  ...shoulderRight,
  ...shoulderLeft,
  ...bellyRight,
  ...bellyLeft,
  ...thighRight,
  ...thighLeft,
];

export const POINT_MAP: Record<string, PointDefinition> = Object.fromEntries(
  POINTS.map((point) => [point.id, point]),
);

export const POINTS_BY_ZONE: Record<ZoneId, PointDefinition[]> = ZONES.reduce(
  (acc, zone) => {
    acc[zone.id] = POINTS.filter((point) => point.zoneId === zone.id);
    return acc;
  },
  {} as Record<ZoneId, PointDefinition[]>,
);

// Body-relative "address" of each point, independent of mirror mode
// (mirroring only changes on-screen left/right, never the point's own
// address): `row` counts top-to-bottom within its zone (1 = topmost), and
// `column` counts outward from the body's own vertical midline (1 = closest
// to center), regardless of which screen half the zone falls on.
const BODY_MIDLINE_X = 0.5;

export const POINT_ADDRESS: Record<string, PointAddress> = ZONES.reduce(
  (acc, zone) => {
    const layout = ZONE_LAYOUT[zone.id];
    const zoneIsLeftOfMidline = layout.x + layout.width / 2 < BODY_MIDLINE_X;
    POINTS_BY_ZONE[zone.id].forEach((point, index) => {
      const row = Math.floor(index / layout.cols) + 1;
      const col = index % layout.cols;
      acc[point.id] = {
        row,
        column: zoneIsLeftOfMidline ? layout.cols - col : col + 1,
      };
    });
    return acc;
  },
  {} as Record<string, PointAddress>,
);
