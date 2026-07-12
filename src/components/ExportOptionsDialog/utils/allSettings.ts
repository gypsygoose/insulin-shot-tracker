import { ExportSettingKey } from "../../../types";

export function allSettings(value: boolean): Record<ExportSettingKey, boolean> {
  return {
    [ExportSettingKey.Mirrored]: value,
    [ExportSettingKey.AutoLock]: value,
    [ExportSettingKey.DaysToWhite]: value,
    [ExportSettingKey.Theme]: value,
    [ExportSettingKey.Language]: value,
    [ExportSettingKey.ZonePointCounts]: value,
    [ExportSettingKey.EnabledZones]: value,
  };
}
