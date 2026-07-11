// Combined fill/stroke opacity baked into the colour (matches the
// fill-opacity 0.22 / stroke-opacity 0.88, both under a 0.78 group opacity,
// from the Figma "with buttons" frame, node 27:744, file grYg39698ogy0nEBd88Fup).
// Used with ThemeColors.zoneColors in dark theme.
export const DARK_FILL_ALPHA = "2C"; // ~17%
export const DARK_BORDER_ALPHA = "AF"; // ~69%
// Light theme pairs these with LIGHT_COLORS.zoneColors' darker shades and
// also raises the alpha itself, since the same faint wash reads even less
// visibly against the light app background.
export const LIGHT_FILL_ALPHA = "4D"; // ~30%
export const LIGHT_BORDER_ALPHA = "CC"; // ~80%
