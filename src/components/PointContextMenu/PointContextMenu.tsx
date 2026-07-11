import { useTranslation } from "react-i18next";
import { PointColor, StoredPointState } from "../../types";
import { PointService } from "../../logic";
import { ContextMenu, ContextMenuItem } from "../common";
import { POINT_ADDRESS } from "../../data";
import { formatDateTime } from "../../utils";
import { formatCountdown } from "./utils";

interface Props {
  visible: boolean;
  pointId?: string;
  zoneLabel?: string;
  color?: PointColor;
  pointState?: StoredPointState;
  now: number;
  onBlock: () => void;
  onUnblock: () => void;
  onMark: () => void;
  onClear: () => void;
  onCancel: () => void;
}

export function PointContextMenu({
  visible,
  pointId,
  zoneLabel,
  color,
  pointState,
  now,
  onBlock,
  onUnblock,
  onMark,
  onClear,
  onCancel,
}: Props) {
  const { t, i18n } = useTranslation();
  const isGray = color === PointColor.Gray;
  const isBlack = color === PointColor.Black;
  const blackoutEndAt = pointState
    ? PointService.getBlackoutEndAt(pointState)
    : undefined;
  const address = pointId ? POINT_ADDRESS[pointId] : undefined;

  const infoLines: string[] = [];
  if (pointState?.lastInjectionAt !== undefined) {
    infoLines.push(
      t("pointMenu.lastMark", {
        dateTime: formatDateTime(pointState.lastInjectionAt, i18n.language),
      }),
    );
  }
  if (isGray && pointState?.manuallyBlockedAt !== undefined) {
    infoLines.push(
      t("pointMenu.manuallyBlockedAt", {
        dateTime: formatDateTime(pointState.manuallyBlockedAt, i18n.language),
      }),
    );
  }
  if (isBlack && blackoutEndAt !== undefined) {
    infoLines.push(
      t("pointMenu.systemBlockedCountdown", {
        countdown: formatCountdown(t, blackoutEndAt - now),
      }),
    );
  }

  const items: ContextMenuItem[] = [];
  if (isGray) {
    items.push({ key: "unblock", label: t("pointMenu.unblock"), onPress: onUnblock });
  }
  if (!isGray && !isBlack) {
    items.push({ key: "block", label: t("pointMenu.block"), onPress: onBlock });
    items.push({ key: "mark", label: t("common.mark"), onPress: onMark });
  }
  items.push({
    key: "clear",
    label: t("common.clear"),
    onPress: onClear,
    destructive: true,
  });

  return (
    <ContextMenu
      visible={visible}
      title={
        zoneLabel
          ? t("pointMenu.titlePrefix", { zoneLabel })
          : t("pointMenu.titleFallback")
      }
      subtitle={
        address
          ? t("pointMenu.addressSubtitle", {
              row: address.row,
              column: address.column,
            })
          : undefined
      }
      infoLines={infoLines}
      items={items}
      onCancel={onCancel}
    />
  );
}
