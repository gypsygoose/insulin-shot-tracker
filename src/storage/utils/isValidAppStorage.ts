import { ExportedAppData, LanguageMode, ThemeMode } from "../../types";
import { isValidEvent } from "./isValidEvent";
import { isValidPointState } from "./isValidPointState";
import { isValidZonePointCounts } from "./isValidZonePointCounts";
import { isValidEnabledZones } from "./isValidEnabledZones";

const THEME_MODES: ThemeMode[] = Object.values(ThemeMode);
const LANGUAGE_MODES: LanguageMode[] = Object.values(LanguageMode);

// Every field is optional — ExportOptionsDialog lets the user write only a
// subset of categories to the file (see ExportedAppData's comment) — so each
// check below only runs when the field is actually present.
export function isValidAppStorage(data: unknown): data is ExportedAppData {
  if (!data || typeof data !== "object") return false;
  const candidate = data as Partial<ExportedAppData>;
  if (candidate.pointStates !== undefined) {
    if (typeof candidate.pointStates !== "object") return false;
    if (!Object.values(candidate.pointStates).every(isValidPointState))
      return false;
  }
  if (candidate.events !== undefined) {
    if (!Array.isArray(candidate.events)) return false;
    if (!candidate.events.every(isValidEvent)) return false;
  }
  if (
    candidate.mirrored !== undefined &&
    typeof candidate.mirrored !== "boolean"
  )
    return false;
  if (
    candidate.autoLockEnabled !== undefined &&
    typeof candidate.autoLockEnabled !== "boolean"
  )
    return false;
  if (
    candidate.autoLockAfterMarkSeconds !== undefined &&
    typeof candidate.autoLockAfterMarkSeconds !== "number"
  )
    return false;
  if (
    candidate.autoLockAfterUnlockSeconds !== undefined &&
    typeof candidate.autoLockAfterUnlockSeconds !== "number"
  )
    return false;
  if (
    candidate.daysToWhite !== undefined &&
    typeof candidate.daysToWhite !== "number"
  )
    return false;
  if (
    candidate.themeMode !== undefined &&
    !THEME_MODES.includes(candidate.themeMode)
  )
    return false;
  if (
    candidate.languageMode !== undefined &&
    !LANGUAGE_MODES.includes(candidate.languageMode)
  )
    return false;
  if (
    candidate.zonePointCounts !== undefined &&
    !isValidZonePointCounts(candidate.zonePointCounts)
  )
    return false;
  if (
    candidate.enabledZones !== undefined &&
    !isValidEnabledZones(candidate.enabledZones)
  )
    return false;
  return true;
}
