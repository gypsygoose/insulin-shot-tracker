import { ExportSelection } from "../../../types";
import { SETTING_KEYS } from "../constants";

export function isSelectionEmpty(selection: ExportSelection): boolean {
  return !selection.marks && SETTING_KEYS.every((key) => !selection.settings[key]);
}
