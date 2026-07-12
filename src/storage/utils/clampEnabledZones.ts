import { EnabledZones, ZoneId } from "../../types";
import { DEFAULT_ENABLED_ZONES } from "../../data";

const ZONE_IDS: ZoneId[] = Object.values(ZoneId);

// Defaults a missing/non-boolean entry to DEFAULT_ENABLED_ZONES' value
// (enabled), same fill-in-the-gaps treatment as clampZonePointCounts. Also
// falls back to DEFAULT_ENABLED_ZONES entirely if the result would leave
// every zone disabled — that state would hide the whole body diagram with
// no way to mark an injection, so it's never allowed to persist.
export function clampEnabledZones(
  input: Partial<Record<ZoneId, boolean>> | undefined,
): EnabledZones {
  const result = {} as EnabledZones;
  for (const zoneId of ZONE_IDS) {
    const candidate = input?.[zoneId];
    result[zoneId] =
      typeof candidate === "boolean" ? candidate : DEFAULT_ENABLED_ZONES[zoneId];
  }
  if (ZONE_IDS.every((zoneId) => !result[zoneId])) return DEFAULT_ENABLED_ZONES;
  return result;
}
