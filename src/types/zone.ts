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
// theme/palette.ts) — this groups them for that lookup, distinct from
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
