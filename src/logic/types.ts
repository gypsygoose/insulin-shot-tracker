import { StoredPointState } from "../types";

export enum PressResultType {
  Injection = "injection",
  Blackout = "blackout",
  Blocked = "blocked",
}

export type PressResult =
  | { type: PressResultType.Injection; newState: StoredPointState }
  | { type: PressResultType.Blackout; newState: StoredPointState }
  | { type: PressResultType.Blocked };

// Which sentence PointService.colorLabel() (PointService.ts) describes —
// kept as a descriptor rather than a formatted string so that file (tested
// without an RN renderer) stays free of an i18next dependency; the UI layer
// (HelpSheet.tsx) formats it via t('stateMachine.colorLabel.*', { count }).
export enum ColorLabelType {
  White = "white",
  Maroon = "maroon",
  Black = "black",
  Gray = "gray",
  Days = "days",
}

export interface ColorLabelDescriptor {
  type: ColorLabelType;
  count?: number;
}
