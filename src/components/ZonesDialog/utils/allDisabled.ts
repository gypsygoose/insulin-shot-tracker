import { EnabledZones, ZoneId } from "../../../types";

// True once every zone would be off — used by ZonesDialog to reject a
// toggle that would leave the body diagram with no usable injection site.
export function allDisabled(enabledZones: EnabledZones): boolean {
  return (Object.values(ZoneId) as ZoneId[]).every(
    (zoneId) => !enabledZones[zoneId],
  );
}
