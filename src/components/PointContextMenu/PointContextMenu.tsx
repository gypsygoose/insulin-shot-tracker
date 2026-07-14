import { useTranslation } from "react-i18next";
import { PointAddress, PointColor, StoredPointState } from "../../types";
import { PointService } from "../../logic";
import { ContextMenu, ContextMenuItem } from "../common";
import { formatDateTime } from "../../utils";
import { formatCountdown } from "./utils";

interface Props {
  visible: boolean;
  zoneLabel?: string;
  color?: PointColor;
  pointState?: StoredPointState;
  address?: PointAddress;
  now: number;
  // Days remaining until the "days to available" setting allows marking
  // this point again, or undefined if it can already be marked — see
  // PointService.daysUntilAvailable. Only meaningful when the point isn't
  // gray/black, which are gated by their own, unrelated rules.
  daysUntilAvailable?: number;
  onBlock: () => void;
  onUnblock: () => void;
  onMark: () => void;
  onClear: () => void;
  onCancel: () => void;
}

export function PointContextMenu({
  visible,
  zoneLabel,
  color,
  pointState,
  address,
  now,
  daysUntilAvailable,
  onBlock,
  onUnblock,
  onMark,
  onClear,
  onCancel,
}: Props) {
  const { t, i18n } = useTranslation();
  const isGray = color === PointColor.Gray;
  const isBlack = color === PointColor.Black;
  const isMarked = color === PointColor.Marked;
  const isUnavailable = daysUntilAvailable !== undefined;
  const blackoutEndAt = pointState
    ? PointService.getBlackoutEndAt(pointState)
    : undefined;

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
  if (isUnavailable) {
    infoLines.push(
      t("pointMenu.availableIn", { count: daysUntilAvailable }),
    );
  }

  const items: ContextMenuItem[] = [];
  if (isGray) {
    items.push({ key: "unblock", label: t("pointMenu.unblock"), onPress: onUnblock });
  }
  if (!isGray && !isBlack) {
    items.push({ key: "block", label: t("pointMenu.block"), onPress: onBlock });
    items.push({
      key: "mark",
      label: t("common.mark"),
      onPress: onMark,
      disabled: isUnavailable || isMarked,
    });
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
