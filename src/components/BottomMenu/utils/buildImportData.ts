import { ExportedAppData, ExportSelection, ExportSettingKey } from "../../../types";

// Narrows a parsed import file down to just the categories the user kept
// checked in ImportOptionsDialog, mirroring useAppStore's exportData filter
// on the way out.
export function buildImportData(
  data: ExportedAppData,
  selection: ExportSelection,
): ExportedAppData {
  const filtered: ExportedAppData = {};
  if (selection.marks) {
    filtered.pointStates = data.pointStates;
    filtered.events = data.events;
  }
  if (selection.settings[ExportSettingKey.Mirrored]) {
    filtered.mirrored = data.mirrored;
  }
  if (selection.settings[ExportSettingKey.AutoLock]) {
    filtered.autoLockEnabled = data.autoLockEnabled;
    filtered.autoLockAfterMarkSeconds = data.autoLockAfterMarkSeconds;
    filtered.autoLockAfterUnlockSeconds = data.autoLockAfterUnlockSeconds;
  }
  if (selection.settings[ExportSettingKey.DaysToWhite]) {
    filtered.daysToWhite = data.daysToWhite;
  }
  if (selection.settings[ExportSettingKey.Theme]) {
    filtered.themeMode = data.themeMode;
  }
  if (selection.settings[ExportSettingKey.Language]) {
    filtered.languageMode = data.languageMode;
  }
  return filtered;
}
