import { ButtonColor, StoredButtonState } from "../types";
import { getBlackoutEndAt } from "../logic/stateMachine";
import { ContextMenu, ContextMenuItem } from "./ContextMenu";

interface Props {
  visible: boolean;
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

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

function formatDateTime(timestamp: number): string {
  const d = new Date(timestamp);
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return "0 мин";
  const totalMinutes = Math.ceil(ms / 60_000);
  const days = Math.floor(totalMinutes / (24 * 60));
  const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
  const minutes = totalMinutes % 60;
  const parts: string[] = [];
  if (days > 0) parts.push(`${days} дн`);
  if (days > 0 || hours > 0) parts.push(`${hours} ч`);
  parts.push(`${minutes} мин`);
  return parts.join(" ");
}

export function ButtonContextMenu({
  visible,
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
  const isGray = color === ButtonColor.Gray;
  const isBlack = color === ButtonColor.Black;
  const blackoutEndAt = buttonState ? getBlackoutEndAt(buttonState) : undefined;

  const infoLines: string[] = [];
  if (buttonState?.lastInjectionAt !== undefined) {
    infoLines.push(
      `Последняя отметка: ${formatDateTime(buttonState.lastInjectionAt)}`,
    );
  }
  if (isGray && buttonState?.manuallyBlockedAt !== undefined) {
    infoLines.push(
      `Заблокировано вручную: ${formatDateTime(buttonState.manuallyBlockedAt)}`,
    );
  }
  if (isBlack && blackoutEndAt !== undefined) {
    infoLines.push(
      `Заблокировано системой.\nДо разблокировки: ${formatCountdown(blackoutEndAt - now)}`,
    );
  }

  const items: ContextMenuItem[] = [];
  if (isGray) {
    items.push({ key: "unblock", label: "Разблокировать", onPress: onUnblock });
  }
  if (!isGray && !isBlack) {
    items.push({ key: "block", label: "Заблокировать", onPress: onBlock });
    items.push({ key: "mark", label: "Отметить", onPress: onMark });
  }
  items.push({ key: "clear", label: "Очистить", onPress: onClear, destructive: true });

  return (
    <ContextMenu
      visible={visible}
      title={zoneLabel ? `Точка · ${zoneLabel}` : "Действия с точкой"}
      infoLines={infoLines}
      items={items}
      onCancel={onCancel}
    />
  );
}
