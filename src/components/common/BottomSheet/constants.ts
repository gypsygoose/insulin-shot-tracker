import { Dimensions } from "react-native";

export const SCREEN_HEIGHT = Dimensions.get("window").height;
export const DISMISS_DISTANCE = 80;
export const DISMISS_VELOCITY = 0.5;
export const SHEET_OPEN_MS = 250;
export const SHEET_CLOSE_MS = 200;
// Minimum vertical drag before treating a touch as a sheet-drag gesture
// rather than a tap on the content underneath.
export const VERTICAL_MOVE_THRESHOLD = 2;
