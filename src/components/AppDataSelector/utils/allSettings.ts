import { ExportSettingKey } from "../../../types";

export function allSettings(value: boolean): Record<ExportSettingKey, boolean> {
  return {
    [ExportSettingKey.Mirrored]: value,
    [ExportSettingKey.AutoLock]: value,
    [ExportSettingKey.EnabledZones]: value,
    [ExportSettingKey.ZonePointCounts]: value,
    [ExportSettingKey.PointRestoreMode]: value,
    [ExportSettingKey.DaysToWhite]: value,
    [ExportSettingKey.DaysToAvailable]: value,
    [ExportSettingKey.Language]: value,
    [ExportSettingKey.Theme]: value,
  };
}
