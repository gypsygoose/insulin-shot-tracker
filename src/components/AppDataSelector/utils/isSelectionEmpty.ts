import { ExportSelection } from "../../../types";
import { MARKS_KEYS, SETTING_KEYS } from "../constants";

export function isSelectionEmpty(selection: ExportSelection): boolean {
  return (
    MARKS_KEYS.every((key) => !selection.marks[key]) &&
    SETTING_KEYS.every((key) => !selection.settings[key])
  );
}
