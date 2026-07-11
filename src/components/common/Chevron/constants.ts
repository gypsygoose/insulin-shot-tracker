import { ChevronDirection } from "./Chevron";

export const DEFAULT_SIZE = 10;
export const STROKE_WIDTH = 2;

// CSS/RN "corner" trick: a box with only its right+bottom borders drawn
// forms a right-angle corner; rotating it turns that corner into an arrow
// tip pointing in the given direction. -45deg/45deg are exactly 90deg apart,
// so animating between them reads as the corner swinging from "right" to
// "down" rather than jumping.
export const ROTATION_DEG: Record<ChevronDirection, number> = {
  right: -45,
  down: 45,
};
