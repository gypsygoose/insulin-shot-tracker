import { ThemeMode, ZoneType } from "../types";

// Theme-dependent chrome colors — everything that visually differs between
// light and dark mode. Other domain/status colors (PointColor cycle, toast
// status colors) are deliberately NOT here: they carry fixed semantic
// meaning and read fine on either background (see CLAUDE.md's "Toast
// statuses" / "Point colour state machine" sections). Per-zone accent/glow
// (zoneColors below) is the one domain color set that IS here: the same hue
// per ZoneType, but one shade darker in LIGHT_COLORS since the original
// pair read too faint against the light theme's bright background (used by
// ZoneContainer's block, InjectionPoint's glow halo, and HelpSheet's zone
// legend — see CLAUDE.md's "Zones and points").
export interface ThemeColors {
  background: string; // root screen / bottom bar background
  icon: string; // bottom-menu icon default fill/stroke
  iconDisabled: string; // bottom-menu icon disabled fill/stroke
  surface: string; // card/sheet/toast background
  primaryText: string; // title/label/value text on a surface
  secondaryText: string; // message/info body text
  mutedText: string; // field labels/descriptions
  sectionLabel: string; // faint uppercase section titles
  cardBorder: string; // hairline border on a surface
  divider: string; // hairline row/section divider
  modalOverlay: string; // full-screen modal backdrop scrim
  primaryAction: string; // confirm/primary button background
  destructive: string; // destructive action background/label
  // Label color for text sitting directly on primaryAction/destructive
  // buttons — those backgrounds are fixed, saturated colors in both themes
  // (see DARK_COLORS/LIGHT_COLORS below), so their label needs a fixed
  // high-contrast color too, independent of primaryText.
  actionLabel: string;
  cancelButtonBorder: string;
  cancelButtonText: string;
  cancelButtonBackground: string;
  switchThumb: string;
  switchTrackOn: string;
  switchTrackOff: string;
  screenTitle: string; // app title text — sits directly on the root background
  bottomSheetBackdrop: string; // lighter than modalOverlay, content stays legible while dragged
  bottomSheetHandle: string; // sheet drag-handle pill
  // Per-body-part zone accent/glow (see ZONE_TYPE in data/zones.ts to map a
  // ZoneId to its ZoneType). `accent` is the zone container fill/border
  // colour, `glow` is the shade used for InjectionPoint's radial glow halo.
  zoneColors: Record<ZoneType, ZoneColorPair>;
}

export interface ZoneColorPair {
  accent: string;
  glow: string;
}

export type ResolvedScheme = ThemeMode.Light | ThemeMode.Dark;

export interface ThemeContextValue {
  mode: ThemeMode;
  resolvedScheme: ResolvedScheme;
  colors: ThemeColors;
  setMode: (mode: ThemeMode) => void;
}
