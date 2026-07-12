import {
  Zone,
  PointDefinition,
  ZoneLayout,
  ZoneGroup,
  ZoneId,
  ZoneType,
  ZonePointCounts,
  EnabledZones,
  ZoneRuntimeData,
  PointAddress,
} from "../types";
// Imported directly from i18n/types.ts, not the "../i18n" barrel — that
// barrel re-exports ./hooks, which reaches LanguageContext.tsx ->
// StorageService -> data/ (this file's own folder), so importing the
// barrel here would be circular.
import type { TranslationKey } from "../i18n/types";

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

// Group-level label for each ZoneType (shared by both zones of a left/right
// pair) — used by ZonePointsDialog's per-type accordion headers, distinct
// from ZONE_LABEL_KEY above (per individual ZoneId).
export const ZONE_TYPE_LABEL_KEY: Record<ZoneType, TranslationKey> = {
  [ZoneType.Shoulder]: "zones.groupShoulder",
  [ZoneType.Belly]: "zones.groupBelly",
  [ZoneType.Thigh]: "zones.groupThigh",
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
// (theme/types.ts's ThemeColors.zoneColors, keyed by ZoneType) — this maps
// each ZoneId to that shared type instead of duplicating the pair per zone.
export const ZONE_TYPE: Record<ZoneId, ZoneType> = {
  [ZoneId.ShoulderRight]: ZoneType.Shoulder,
  [ZoneId.ShoulderLeft]: ZoneType.Shoulder,
  [ZoneId.BellyRight]: ZoneType.Belly,
  [ZoneId.BellyLeft]: ZoneType.Belly,
  [ZoneId.ThighRight]: ZoneType.Thigh,
  [ZoneId.ThighLeft]: ZoneType.Thigh,
};

// Both ZoneIds sharing a given ZoneType (right then left, matching ZONES'
// own ordering) — used by ZonesDialog's per-type accordion to bulk-toggle
// both zones of a type at once.
export const ZONE_TYPE_ZONE_IDS: Record<ZoneType, ZoneId[]> = {
  [ZoneType.Shoulder]: [ZoneId.ShoulderRight, ZoneId.ShoulderLeft],
  [ZoneType.Belly]: [ZoneId.BellyRight, ZoneId.BellyLeft],
  [ZoneType.Thigh]: [ZoneId.ThighRight, ZoneId.ThighLeft],
};

// Every zone enabled — the starting value for the configurable setting
// (ZonesDialog).
export const DEFAULT_ENABLED_ZONES: EnabledZones = {
  [ZoneId.ShoulderRight]: true,
  [ZoneId.ShoulderLeft]: true,
  [ZoneId.BellyRight]: true,
  [ZoneId.BellyLeft]: true,
  [ZoneId.ThighRight]: true,
  [ZoneId.ThighLeft]: true,
};

// Default point grid per zone type — today's fixed counts, kept as the
// starting value for the configurable setting (ZonePointsDialog) and as the
// shape legacy (pre-setting) point ids were generated under, used by
// storage/utils/migrateLegacyPointIds.ts to reinterpret them.
export const DEFAULT_ZONE_POINT_COUNTS: ZonePointCounts = {
  [ZoneType.Shoulder]: { rows: 3, cols: 1 },
  [ZoneType.Belly]: { rows: 3, cols: 3 },
  [ZoneType.Thigh]: { rows: 3, cols: 2 },
};

// Maximum grid size per zone type — differs per type since not every zone
// has the same amount of usable space (the minimum, MIN_ZONE_ROWS/
// MIN_ZONE_COLS in src/constants.ts, is uniform at 1). Used by
// ZonePointsDialog to build each type's own row/column picker options and by
// storage/utils/clampZonePointCounts.ts/isValidZonePointCounts.ts to
// clamp/validate a stored or imported value.
export const ZONE_MAX_GRID: ZonePointCounts = {
  [ZoneType.Shoulder]: { rows: 3, cols: 2 },
  [ZoneType.Belly]: { rows: 4, cols: 4 },
  [ZoneType.Thigh]: { rows: 4, cols: 3 },
};

// ---------------------------------------------------------------------------
// Zone container layout — bounding box of each zone as a fraction (0..1) of
// the body image container (393.46×621.91), derived from the zone rectangles
// in the Figma "with buttons" frame (node 27:744, file grYg39698ogy0nEBd88Fup).
// The box now resizes with the zone type's configured point grid instead of
// being fixed: `centerX`/`centerY` (below) are the anchors that stay put —
// both width and height grow/shrink symmetrically around their respective
// center, so points never drift across the picture in either axis and a
// zone never grows only toward one neighbor (e.g. Shoulder growing only
// downward into Belly, or shrinking away from it and leaving a gap) — see
// buildZoneLayout.
// ---------------------------------------------------------------------------

// Fixed center, per zone (fraction of the body image) — centerX/centerY =
// original x + width/2 / original y + height/2, so at
// DEFAULT_ZONE_POINT_COUNTS the computed ZoneLayout below reproduces today's
// exact numbers.
const ZONE_ANCHOR: Record<ZoneId, { centerX: number; centerY: number }> = {
  [ZoneId.ShoulderRight]: { centerX: 0.08 + 0.12 / 2, centerY: 0.15 + 0.2 / 2 },
  [ZoneId.ShoulderLeft]: { centerX: 0.815 + 0.12 / 2, centerY: 0.15 + 0.2 / 2 },
  [ZoneId.BellyRight]: { centerX: 0.215 + 0.28 / 2, centerY: 0.29 + 0.2 / 2 },
  [ZoneId.BellyLeft]: { centerX: 0.52 + 0.28 / 2, centerY: 0.29 + 0.2 / 2 },
  [ZoneId.ThighRight]: { centerX: 0.21 + 0.21 / 2, centerY: 0.65 + 0.2 / 2 },
  [ZoneId.ThighLeft]: { centerX: 0.605 + 0.2 / 2, centerY: 0.65 + 0.2 / 2 },
};

// Per-point cell size, per zone (fraction of the body image) — original
// width/height divided by the original (default) cols/rows, so at
// DEFAULT_ZONE_POINT_COUNTS the computed ZoneLayout below reproduces
// today's exact numbers.
const ZONE_CELL_SIZE: Record<
  ZoneId,
  { cellWidth: number; cellHeight: number }
> = {
  [ZoneId.ShoulderRight]: { cellWidth: 0.12 / 1, cellHeight: 0.2 / 3 },
  [ZoneId.ShoulderLeft]: { cellWidth: 0.12 / 1, cellHeight: 0.2 / 3 },
  [ZoneId.BellyRight]: { cellWidth: 0.28 / 3, cellHeight: 0.2 / 3 },
  [ZoneId.BellyLeft]: { cellWidth: 0.28 / 3, cellHeight: 0.2 / 3 },
  [ZoneId.ThighRight]: { cellWidth: 0.21 / 2, cellHeight: 0.2 / 3 },
  [ZoneId.ThighLeft]: { cellWidth: 0.2 / 2, cellHeight: 0.2 / 3 },
};

// Body-relative "address" of each point is independent of mirror mode
// (mirroring only changes on-screen left/right, never the point's own
// address): `row` counts top-to-bottom within its zone (1 = topmost), and
// `column` counts outward from the body's own vertical midline (1 = closest
// to center), regardless of which screen half the zone falls on.
const BODY_MIDLINE_X = 0.5;

// Whether a zone's canonical (unmirrored) position falls left of the body's
// own vertical midline — exported so storage/utils/migrateLegacyPointIds.ts
// can reapply the same center-relative flip below when reinterpreting
// pre-setting point ids.
export function isZoneLeftOfMidline(zoneId: ZoneId): boolean {
  return ZONE_ANCHOR[zoneId].centerX < BODY_MIDLINE_X;
}

// Minimum vertical gap (fraction of the body image height) kept between the
// shoulder zone's bottom edge and the belly zone's top edge whenever the
// shoulder zones are raised (see shouldRaiseShoulderZones/
// raisedShoulderCenterY below).
const SHOULDER_BELLY_MIN_GAP = 0.02;

// Widening either zone's own columns grows its box symmetrically around a
// fixed centerX (see the module comment above), which can push the shoulder
// zone's box far enough right, and/or the belly zone's box far enough left/
// up, that the two start overlapping on screen — the shoulder zone's fixed
// centerY was only ever tuned against DEFAULT_ZONE_POINT_COUNTS, so it has no
// built-in margin for that. Two grid shapes cause this: widening the
// shoulder zone itself (its right edge extends toward the belly zone's
// existing left edge) only matters once the belly zone is already at least
// as wide as its default (3 cols); widening the belly zone on its own past
// its default width reaches the shoulder zone's box regardless of the
// shoulder zone's own width.
function shouldRaiseShoulderZones(zonePointCounts: ZonePointCounts): boolean {
  const { cols: shoulderCols } = zonePointCounts[ZoneType.Shoulder];
  const { cols: bellyCols } = zonePointCounts[ZoneType.Belly];
  return shoulderCols + bellyCols > 4;
}

// Recomputes the shoulder zone's centerY so its box clears the belly zone's
// current top edge (which itself moves as the belly zone's row count
// changes) by SHOULDER_BELLY_MIN_GAP, instead of using the shoulder zone's
// own fixed ZONE_ANCHOR centerY. BellyRight/BellyLeft share the same
// centerY/cellHeight (see ZONE_ANCHOR/ZONE_CELL_SIZE above), so either can be
// read here regardless of which shoulder zone is being laid out.
function raisedShoulderCenterY(
  zonePointCounts: ZonePointCounts,
  shoulderHeight: number,
): number {
  const bellyAnchor = ZONE_ANCHOR[ZoneId.BellyRight];
  const bellyCellSize = ZONE_CELL_SIZE[ZoneId.BellyRight];
  const bellyHeight =
    bellyCellSize.cellHeight * zonePointCounts[ZoneType.Belly].rows;
  const bellyTopY = bellyAnchor.centerY - bellyHeight / 2;
  return bellyTopY - SHOULDER_BELLY_MIN_GAP - shoulderHeight / 2;
}

// Minimum horizontal gap (fraction of the body image width) kept between the
// belly-right/belly-left zones' inner edges whenever they're widened — equal
// to their gap today at DEFAULT_ZONE_POINT_COUNTS's cols (3): ZONE_ANCHOR's
// BellyLeft.centerX (0.66) - BellyRight.centerX (0.355) - default width
// (0.28) = 0.025, so this reproduces today's spacing exactly rather than
// picking a new value.
const BELLY_ZONES_MIN_GAP = 0.025;

// Widening the belly zone's own columns grows each belly zone's box
// symmetrically around its own fixed centerX (see the module comment above),
// which eventually closes the gap between the belly-right and belly-left
// zones and makes their boxes overlap in the middle — cols beyond the
// default (3) is the only grid shape that does this, since the fixed anchors
// already carry BELLY_ZONES_MIN_GAP of margin at the default width.
function shouldWidenBellyGap(zonePointCounts: ZonePointCounts): boolean {
  return zonePointCounts[ZoneType.Belly].cols > 3;
}

// The belly zones' own visual midline — the midpoint of their two fixed
// ZONE_ANCHOR centerX values (0.355, 0.66), which is 0.5075, not exactly
// BODY_MIDLINE_X (0.5). BODY_MIDLINE_X is a generic 0.5 used only to classify
// which side of the body a zone falls on (isZoneLeftOfMidline); the belly
// zones' actual illustrated center (relative to the navel in body.png) is
// offset from that by design, per the original Figma rectangles. Deriving it
// here instead of widening symmetrically around BODY_MIDLINE_X keeps the
// widened gap visually centered exactly where the fixed-width belly zones
// already are, instead of drifting off the navel.
const BELLY_ZONES_MIDLINE_X =
  (ZONE_ANCHOR[ZoneId.BellyRight].centerX +
    ZONE_ANCHOR[ZoneId.BellyLeft].centerX) /
  2;

// Recomputes a belly zone's centerX so its inner (toward-midline) edge sits
// BELLY_ZONES_MIN_GAP / 2 away from BELLY_ZONES_MIDLINE_X, instead of using
// the belly zone's own fixed ZONE_ANCHOR centerX — keeping the two belly
// zones symmetric around their actual shared midline the same way their
// fixed anchors already are.
function widenedBellyCenterX(zoneId: ZoneId, bellyWidth: number): number {
  const halfWidth = bellyWidth / 2;
  const halfGap = BELLY_ZONES_MIN_GAP / 2;
  return isZoneLeftOfMidline(zoneId)
    ? BELLY_ZONES_MIDLINE_X - halfGap - halfWidth
    : BELLY_ZONES_MIDLINE_X + halfGap + halfWidth;
}

// How far (fraction of the body image height) the shoulder and belly zones
// are nudged down together whenever shouldLowerShoulderAndBellyZones is
// true. A tall combined shoulder+belly row count grows both zones' boxes
// noticeably taller than at DEFAULT_ZONE_POINT_COUNTS; nudging both down by
// the same small amount keeps them better centered against the body
// illustration's torso artwork instead of only growing upward off it.
const SHOULDER_BELLY_ROWS_LOWER_OFFSET = 0.03;

// Shoulder rows can only shrink from their default/max (3); belly rows can
// grow up to 4 (see ZONE_MAX_GRID) — so this only fires once belly rows
// reaches 4 with shoulder rows still at 3 (3 + 4 = 7), the one combination
// whose combined row count exceeds the default sum (3 + 3 = 6).
function shouldLowerShoulderAndBellyZones(
  zonePointCounts: ZonePointCounts,
): boolean {
  const { rows: shoulderRows } = zonePointCounts[ZoneType.Shoulder];
  const { rows: bellyRows } = zonePointCounts[ZoneType.Belly];
  return shoulderRows + bellyRows > 6;
}

function buildZoneLayout(
  zonePointCounts: ZonePointCounts,
): Record<ZoneId, ZoneLayout> {
  const zoneLayout = {} as Record<ZoneId, ZoneLayout>;
  const widenBellyGap = shouldWidenBellyGap(zonePointCounts);
  const raiseShoulderZones = shouldRaiseShoulderZones(zonePointCounts);
  const lowerShoulderAndBelly =
    raiseShoulderZones && shouldLowerShoulderAndBellyZones(zonePointCounts);
  for (const zone of ZONES) {
    const zoneType = ZONE_TYPE[zone.id];
    const { rows, cols } = zonePointCounts[zoneType];
    const { centerX, centerY } = ZONE_ANCHOR[zone.id];
    const { cellWidth, cellHeight } = ZONE_CELL_SIZE[zone.id];
    const width = cellWidth * cols;
    const height = cellHeight * rows;
    const resolvedCenterX =
      widenBellyGap && zoneType === ZoneType.Belly
        ? widenedBellyCenterX(zone.id, width)
        : centerX;
    let resolvedCenterY =
      raiseShoulderZones && zoneType === ZoneType.Shoulder
        ? raisedShoulderCenterY(zonePointCounts, height)
        : centerY;
    if (
      lowerShoulderAndBelly &&
      (zoneType === ZoneType.Shoulder || zoneType === ZoneType.Belly)
    ) {
      resolvedCenterY += SHOULDER_BELLY_ROWS_LOWER_OFFSET;
    }
    zoneLayout[zone.id] = {
      x: resolvedCenterX - width / 2,
      y: resolvedCenterY - height / 2,
      width,
      height,
      rows,
      cols,
    };
  }
  return zoneLayout;
}

// Short id prefix per zone, matching each ZoneId (unchanged from the
// original point ids, e.g. "sr-0" -> "sr-r1c1").
const ZONE_ID_PREFIX: Record<ZoneId, string> = {
  [ZoneId.ShoulderRight]: "sr",
  [ZoneId.ShoulderLeft]: "sl",
  [ZoneId.BellyRight]: "br",
  [ZoneId.BellyLeft]: "bl",
  [ZoneId.ThighRight]: "tr",
  [ZoneId.ThighLeft]: "tl",
};

// Builds every zone/point-derived value from the current ZonePointCounts
// setting — replaces what used to be static consts (POINTS/POINT_MAP/
// POINTS_BY_ZONE/ZONE_LAYOUT/POINT_ADDRESS) computed once from a fixed
// layout. Called once per ZonePointCounts/EnabledZones change (see
// useAppStore.ts's `zoneData`, memoized on both settings) rather than on
// every render.
//
// Point ids are keyed by (row, column) within their zone type's grid — e.g.
// "br-r2c3" — rather than a flat sequential index, so a point's identity
// (and therefore its injection history) survives a grid resize: shrinking
// the grid just stops rendering/using out-of-range slots (their stored state
// is left untouched in AsyncStorage), and growing back reveals their old
// history again. A flat index can't do this since its row/col meaning
// changes whenever `cols` changes.
//
// Crucially, `column` here already *is* the body-relative address column
// (1 = closest to the body's own midline, see isZoneLeftOfMidline above) —
// not a raw left-to-right position that would need re-flipping against the
// *current* `cols` every time the grid resizes. Baking the center-relative
// column into the id/address at generation time means a point's own address
// never changes just because some other column was added or removed —
// resizing only ever adds/removes the outermost (farthest-from-center)
// column, never renumbers an existing one. Rendering order (left-to-right
// on screen) is derived from this same column, per zone side, below.
//
// `enabledZones` (see ZonesDialog) is treated the same way a shrunk grid
// treats an out-of-range slot: a disabled zone contributes no entries to
// `points`/`pointMap`/`pointAddress`/`pointsByZone` (so it's excluded from
// normalizeStorage's active-points list and from group indicators), but
// `zoneLayout` is still computed for it unconditionally — MainScreen simply
// skips rendering a ZoneContainer for a disabled zone rather than relying on
// an empty layout.
export function buildZoneData(
  zonePointCounts: ZonePointCounts,
  enabledZones: EnabledZones,
): ZoneRuntimeData {
  const zoneLayout = buildZoneLayout(zonePointCounts);
  const pointMap: Record<string, PointDefinition> = {};
  const pointsByZone = {} as Record<ZoneId, PointDefinition[]>;
  const pointAddress: Record<string, PointAddress> = {};

  for (const zone of ZONES) {
    if (!enabledZones[zone.id]) {
      pointsByZone[zone.id] = [];
      continue;
    }
    const layout = zoneLayout[zone.id];
    const zoneIsLeftOfMidline = isZoneLeftOfMidline(zone.id);
    const prefix = ZONE_ID_PREFIX[zone.id];
    const points: PointDefinition[] = [];

    // Left-to-right screen order: a zone left of the midline has the body's
    // center to its *right*, so its closest-to-center column (1) renders
    // last (rightmost) — descending order. A zone right of the midline has
    // the center to its *left*, so column 1 renders first — ascending order.
    const rowColumns = zoneIsLeftOfMidline
      ? Array.from({ length: layout.cols }, (_, index) => layout.cols - index)
      : Array.from({ length: layout.cols }, (_, index) => index + 1);

    for (let row = 1; row <= layout.rows; row++) {
      for (const column of rowColumns) {
        const point: PointDefinition = {
          id: `${prefix}-r${row}c${column}`,
          zoneId: zone.id,
        };
        points.push(point);
        pointMap[point.id] = point;
        pointAddress[point.id] = { row, column };
      }
    }

    pointsByZone[zone.id] = points;
  }

  const points = ZONES.flatMap((zone) => pointsByZone[zone.id]);

  return { zoneLayout, points, pointMap, pointsByZone, pointAddress };
}
