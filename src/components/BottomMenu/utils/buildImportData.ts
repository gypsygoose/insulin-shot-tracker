import { ExportedAppData, ExportMarksKey, ExportSelection, ExportSettingKey } from "../../../types";
import { partitionEventsByBlock, partitionPointStatesByBlock } from "../../../utils";

// Narrows a parsed import file down to just the categories the user kept
// checked in ImportOptionsDialog, mirroring useAppStore's exportData filter
// on the way out.
export function buildImportData(
  data: ExportedAppData,
  selection: ExportSelection,
): ExportedAppData {
  const filtered: ExportedAppData = {};
  const activePointsSelected = selection.marks[ExportMarksKey.ActivePoints];
  const blockedPointsSelected = selection.marks[ExportMarksKey.BlockedPoints];
  if (
    (activePointsSelected || blockedPointsSelected) &&
    data.pointStates !== undefined &&
    data.events !== undefined
  ) {
    if (activePointsSelected && blockedPointsSelected) {
      filtered.pointStates = data.pointStates;
      filtered.events = data.events;
    } else {
      const { active: activePointStates, blocked: blockedPointStates } =
        partitionPointStatesByBlock(data.pointStates);
      const { active: activeEvents, blocked: blockedEvents } =
        partitionEventsByBlock(data.events);
      filtered.pointStates = activePointsSelected
        ? activePointStates
        : blockedPointStates;
      filtered.events = activePointsSelected ? activeEvents : blockedEvents;
    }
  }
  if (selection.settings[ExportSettingKey.Mirrored]) {
    filtered.mirrored = data.mirrored;
  }
  if (selection.settings[ExportSettingKey.AutoLock]) {
    filtered.autoLockEnabled = data.autoLockEnabled;
    filtered.autoLockAfterMarkSeconds = data.autoLockAfterMarkSeconds;
    filtered.autoLockAfterUnlockSeconds = data.autoLockAfterUnlockSeconds;
  }
  if (selection.settings[ExportSettingKey.EnabledZones]) {
    filtered.enabledZones = data.enabledZones;
  }
  if (selection.settings[ExportSettingKey.ZonePointCounts]) {
    filtered.zonePointCounts = data.zonePointCounts;
  }
  if (selection.settings[ExportSettingKey.PointRestoreMode]) {
    filtered.pointRestoreMode = data.pointRestoreMode;
  }
  if (selection.settings[ExportSettingKey.DaysToWhite]) {
    filtered.daysToWhite = data.daysToWhite;
  }
  if (selection.settings[ExportSettingKey.DaysToAvailable]) {
    filtered.daysToAvailable = data.daysToAvailable;
  }
  if (selection.settings[ExportSettingKey.Language]) {
    filtered.languageMode = data.languageMode;
  }
  if (selection.settings[ExportSettingKey.Theme]) {
    filtered.themeMode = data.themeMode;
  }
  return filtered;
}
