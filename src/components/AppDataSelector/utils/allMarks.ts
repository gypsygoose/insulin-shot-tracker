import { ExportMarksKey } from "../../../types";

export function allMarks(value: boolean): Record<ExportMarksKey, boolean> {
  return {
    [ExportMarksKey.ActivePoints]: value,
    [ExportMarksKey.BlockedPoints]: value,
  };
}
