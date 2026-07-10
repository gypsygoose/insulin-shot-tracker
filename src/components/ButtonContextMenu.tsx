import { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import { ButtonColor, StoredButtonState } from "../types";
import { getBlackoutEndAt } from "../logic/stateMachine";
import { ContextMenu, ContextMenuItem } from "./common/ContextMenu";
import { BUTTON_ADDRESS } from "../data/zones";
import { MINUTES_PER_DAY } from "../constants";
import { formatDateTime } from "../format";

interface Props {
  visible: boolean;
  buttonId?: string;
  zoneLabel?: string;
  color?: ButtonColor;
  buttonState?: StoredButtonState;
  now: number;
  onBlock: () => void;
  onUnblock: () => void;
  onMark: () => void;
  onClear: () => void;
  onCancel: () => void;
}

function formatCountdown(t: TFunction, ms: number): string {
  if (ms <= 0) return t("common.minutesAbbrev", { count: 0 });
  const totalMinutes = Math.ceil(ms / 60_000);
  const days = Math.floor(totalMinutes / MINUTES_PER_DAY);
  const hours = Math.floor((totalMinutes % MINUTES_PER_DAY) / 60);
  const minutes = totalMinutes % 60;
  const parts: string[] = [];
  if (days > 0) parts.push(t("common.daysAbbrev", { count: days }));
  if (days > 0 || hours > 0)
    parts.push(t("common.hoursAbbrev", { count: hours }));
  parts.push(t("common.minutesAbbrev", { count: minutes }));
  return parts.join(" ");
}

export function ButtonContextMenu({
  visible,
  buttonId,
  zoneLabel,
  color,
  buttonState,
  now,
  onBlock,
  onUnblock,
  onMark,
  onClear,
  onCancel,
}: Props) {
  const { t, i18n } = useTranslation();
  const isGray = color === ButtonColor.Gray;
  const isBlack = color === ButtonColor.Black;
  const blackoutEndAt = buttonState ? getBlackoutEndAt(buttonState) : undefined;
  const address = buttonId ? BUTTON_ADDRESS[buttonId] : undefined;

  const infoLines: string[] = [];
  if (buttonState?.lastInjectionAt !== undefined) {
    infoLines.push(
      t("pointMenu.lastMark", {
        dateTime: formatDateTime(buttonState.lastInjectionAt, i18n.language),
      }),
    );
  }
  if (isGray && buttonState?.manuallyBlockedAt !== undefined) {
    infoLines.push(
      t("pointMenu.manuallyBlockedAt", {
        dateTime: formatDateTime(buttonState.manuallyBlockedAt, i18n.language),
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
