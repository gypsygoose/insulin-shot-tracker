import { EnabledZones, ZoneId } from "../../types";

const ZONE_IDS: ZoneId[] = Object.values(ZoneId);

export function isValidEnabledZones(value: unknown): value is EnabledZones {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<Record<ZoneId, unknown>>;
  return ZONE_IDS.every((zoneId) => typeof candidate[zoneId] === "boolean");
}
