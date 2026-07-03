import { Zone, ButtonDefinition, ZoneLayout } from "../types";

// Zones from Figma design (grYg39698ogy0nEBd88Fup, node 26:3)
// Group label follows patient perspective: "правое" = patient's right = screen LEFT

export const ZONES: Zone[] = [
  { id: "shoulder-right", label: "Правое плечо", group: "shoulders-and-belly" },
  { id: "shoulder-left", label: "Левое плечо", group: "shoulders-and-belly" },
  { id: "belly-right", label: "Живот справа", group: "shoulders-and-belly" },
  { id: "belly-left", label: "Живот слева", group: "shoulders-and-belly" },
  { id: "thigh-right", label: "Правое бедро", group: "thighs" },
  { id: "thigh-left", label: "Левое бедро", group: "thighs" },
];

export const ZONE_MAP: Record<string, Zone> = Object.fromEntries(
  ZONES.map((z) => [z.id, z]),
);

// Maps each zone to its left/right counterpart, used when mirror mode is on:
// a zone then renders in the screen position its counterpart normally
// occupies (see ZONE_LAYOUT), while keeping its own colour/button identity.
export const ZONE_MIRROR_MAP: Record<string, string> = {
  "shoulder-right": "shoulder-left",
  "shoulder-left": "shoulder-right",
  "belly-right": "belly-left",
  "belly-left": "belly-right",
  "thigh-right": "thigh-left",
  "thigh-left": "thigh-right",
};

// Per-zone accent colours, taken from the Figma "with buttons" frame
// (node 27:744, file grYg39698ogy0nEBd88Fup): `accent` is the zone container
// fill/border colour, `glow` is the darker shade used for the radial shadow
// behind each injection button in that zone.
export const ZONE_COLORS: Record<string, { accent: string; glow: string }> = {
  "shoulder-right": { accent: "#F5D020", glow: "#C4A800" },
  "shoulder-left": { accent: "#F5D020", glow: "#C4A800" },
  "belly-right": { accent: "#36D97A", glow: "#22A85E" },
  "belly-left": { accent: "#36D97A", glow: "#22A85E" },
  "thigh-right": { accent: "#FF8C33", glow: "#CC6800" },
  "thigh-left": { accent: "#FF8C33", glow: "#CC6800" },
};

// ---------------------------------------------------------------------------
// Zone container layout — bounding box of each zone as a fraction (0..1) of
// the body image container (393.46×621.91), derived from the zone rectangles
// in the Figma "with buttons" frame (node 27:744, file grYg39698ogy0nEBd88Fup)
// / assets/images/body_icon.svg. Each zone renders as an absolutely
// positioned block matching this box; `rows`/`cols` describe the button grid
// laid out *inside* that block (buttons are positioned relative to their own
// zone container, not by global coordinates).
// ---------------------------------------------------------------------------

export const ZONE_LAYOUT: Record<string, ZoneLayout> = {
  "shoulder-right": {
    x: 0.08,
    y: 0.2,
    width: 0.12,
    height: 0.2,
    rows: 3,
    cols: 1,
  },
  "shoulder-left": {
    x: 0.815,
    y: 0.2,
    width: 0.12,
    height: 0.2,
    rows: 3,
    cols: 1,
  },
  "belly-right": {
    x: 0.215,
    y: 0.33,
    width: 0.28,
    height: 0.2,
    rows: 3,
    cols: 3,
  },
  "belly-left": {
    x: 0.52,
    y: 0.33,
    width: 0.28,
    height: 0.2,
    rows: 3,
    cols: 3,
  },
  "thigh-right": {
    x: 0.21,
    y: 0.7,
    width: 0.21,
    height: 0.2,
    rows: 3,
    cols: 2,
  },
  "thigh-left": {
    x: 0.605,
    y: 0.7,
    width: 0.2,
    height: 0.2,
    rows: 3,
    cols: 2,
  },
};

// Buttons within each zone, in row-major order (matches ZONE_LAYOUT rows/cols
// for that zone) — position on screen comes from the flex grid inside the
// zone container, not from stored coordinates.

const shoulderRight: ButtonDefinition[] = [
  { id: "sr-0", zoneId: "shoulder-right" },
  { id: "sr-1", zoneId: "shoulder-right" },
  { id: "sr-2", zoneId: "shoulder-right" },
];

const shoulderLeft: ButtonDefinition[] = [
  { id: "sl-0", zoneId: "shoulder-left" },
  { id: "sl-1", zoneId: "shoulder-left" },
  { id: "sl-2", zoneId: "shoulder-left" },
];

const bellyRight: ButtonDefinition[] = [
  { id: "br-0", zoneId: "belly-right" },
  { id: "br-1", zoneId: "belly-right" },
  { id: "br-2", zoneId: "belly-right" },
  { id: "br-3", zoneId: "belly-right" },
  { id: "br-4", zoneId: "belly-right" },
  { id: "br-5", zoneId: "belly-right" },
  { id: "br-6", zoneId: "belly-right" },
  { id: "br-7", zoneId: "belly-right" },
  { id: "br-8", zoneId: "belly-right" },
];

const bellyLeft: ButtonDefinition[] = [
  { id: "bl-0", zoneId: "belly-left" },
  { id: "bl-1", zoneId: "belly-left" },
  { id: "bl-2", zoneId: "belly-left" },
  { id: "bl-3", zoneId: "belly-left" },
  { id: "bl-4", zoneId: "belly-left" },
  { id: "bl-5", zoneId: "belly-left" },
  { id: "bl-6", zoneId: "belly-left" },
  { id: "bl-7", zoneId: "belly-left" },
  { id: "bl-8", zoneId: "belly-left" },
];

const thighRight: ButtonDefinition[] = [
  { id: "tr-0", zoneId: "thigh-right" },
  { id: "tr-1", zoneId: "thigh-right" },
  { id: "tr-2", zoneId: "thigh-right" },
  { id: "tr-3", zoneId: "thigh-right" },
  { id: "tr-4", zoneId: "thigh-right" },
  { id: "tr-5", zoneId: "thigh-right" },
];

const thighLeft: ButtonDefinition[] = [
  { id: "tl-0", zoneId: "thigh-left" },
  { id: "tl-1", zoneId: "thigh-left" },
  { id: "tl-2", zoneId: "thigh-left" },
  { id: "tl-3", zoneId: "thigh-left" },
  { id: "tl-4", zoneId: "thigh-left" },
  { id: "tl-5", zoneId: "thigh-left" },
];

export const BUTTONS: ButtonDefinition[] = [
  ...shoulderRight,
  ...shoulderLeft,
  ...bellyRight,
  ...bellyLeft,
  ...thighRight,
  ...thighLeft,
];

export const BUTTON_MAP: Record<string, ButtonDefinition> = Object.fromEntries(
  BUTTONS.map((b) => [b.id, b]),
);

export const BUTTONS_BY_ZONE: Record<string, ButtonDefinition[]> = ZONES.reduce(
  (acc, zone) => {
    acc[zone.id] = BUTTONS.filter((b) => b.zoneId === zone.id);
    return acc;
  },
  {} as Record<string, ButtonDefinition[]>,
);
