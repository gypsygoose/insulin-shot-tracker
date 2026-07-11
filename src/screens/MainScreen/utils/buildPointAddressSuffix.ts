import { TFunction } from "i18next";
import { POINT_ADDRESS, POINT_MAP, ZONE_LABEL_KEY, ZONE_MAP } from "../../../data";

// Shared "<zone label>, ряд <row>, место <column> от центра тела" suffix used
// by every point-specific toast (mark/block/clear) to name which point it's
// about via its body-relative address.
export function buildPointAddressSuffix(
  t: TFunction,
  pointId: string,
): string | null {
  const point = POINT_MAP[pointId];
  const zone = point ? ZONE_MAP[point.zoneId] : undefined;
  const address = POINT_ADDRESS[pointId];
  if (!zone || !address) return null;
  return t("toast.pointAddressSuffix", {
    zoneLabel: t(ZONE_LABEL_KEY[zone.id]),
    row: address.row,
    column: address.column,
  });
}
