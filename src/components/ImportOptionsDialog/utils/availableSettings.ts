import { ExportedAppData, ExportSettingKey } from "../../../types";
import { SETTING_KEYS } from "../../ImportExportOptions";

const SETTING_AVAILABLE: Record<
  ExportSettingKey,
  (data: ExportedAppData) => boolean
> = {
  [ExportSettingKey.Mirrored]: (data) => data.mirrored !== undefined,
  [ExportSettingKey.AutoLock]: (data) => data.autoLockEnabled !== undefined,
  [ExportSettingKey.DaysToWhite]: (data) => data.daysToWhite !== undefined,
  [ExportSettingKey.Theme]: (data) => data.themeMode !== undefined,
  [ExportSettingKey.Language]: (data) => data.languageMode !== undefined,
  [ExportSettingKey.ZonePointCounts]: (data) => data.zonePointCounts !== undefined,
  [ExportSettingKey.EnabledZones]: (data) => data.enabledZones !== undefined,
};

export function availableSettings(
  data: ExportedAppData,
): Record<ExportSettingKey, boolean> {
  const result = {} as Record<ExportSettingKey, boolean>;
  for (const key of SETTING_KEYS) {
    result[key] = SETTING_AVAILABLE[key](data);
  }
  return result;
}
