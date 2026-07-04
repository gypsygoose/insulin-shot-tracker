import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  StyleSheet,
} from "react-native";
import { ButtonColor, StoredButtonState } from "../types";
import { getBlackoutEndAt } from "../logic/stateMachine";

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

export default function ButtonActionMenu({
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
  const isGray = color === "gray";
  const isBlack = color === "black";
  const blackoutEndAt = buttonState ? getBlackoutEndAt(buttonState) : undefined;
  const hasInfo =
    buttonState?.lastInjectionAt !== undefined ||
    (isGray && buttonState?.manuallyBlockedAt !== undefined) ||
    (isBlack && blackoutEndAt !== undefined);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} />

        <View style={styles.box}>
          <Text style={styles.title}>
            {zoneLabel ? `Точка · ${zoneLabel}` : "Действия с точкой"}
          </Text>

          {hasInfo ? (
            <View style={styles.infoBlock}>
              {buttonState?.lastInjectionAt !== undefined ? (
                <Text style={styles.infoLine}>
                  Последняя отметка:{" "}
                  {formatDateTime(buttonState.lastInjectionAt)}
                </Text>
              ) : null}

              {isGray && buttonState?.manuallyBlockedAt !== undefined ? (
                <Text style={styles.infoLine}>
                  Заблокировано вручную:{" "}
                  {formatDateTime(buttonState.manuallyBlockedAt)}
                </Text>
              ) : null}

              {isBlack && blackoutEndAt !== undefined ? (
                <Text style={styles.infoLine}>
                  Заблокировано системой.{"\n"}До разблокировки:{" "}
                  {formatCountdown(blackoutEndAt - now)}
                </Text>
              ) : null}
            </View>
          ) : null}

          {hasInfo ? <View style={styles.divider} /> : null}

          {isGray ? (
            <>
              <TouchableOpacity
                style={styles.row}
                onPress={onUnblock}
                activeOpacity={0.7}
              >
                <Text style={styles.rowLabel}>Разблокировать</Text>
              </TouchableOpacity>
              <View style={styles.divider} />
            </>
          ) : null}

          {!isGray && !isBlack ? (
            <>
              <TouchableOpacity
                style={styles.row}
                onPress={onBlock}
                activeOpacity={0.7}
              >
                <Text style={styles.rowLabel}>Заблокировать</Text>
              </TouchableOpacity>
              <View style={styles.divider} />

              <TouchableOpacity
                style={styles.row}
                onPress={onMark}
                activeOpacity={0.7}
              >
                <Text style={styles.rowLabel}>Отметить</Text>
              </TouchableOpacity>
              <View style={styles.divider} />
            </>
          ) : null}

          <TouchableOpacity
            style={styles.row}
            onPress={onClear}
            activeOpacity={0.7}
          >
            <Text style={[styles.rowLabel, styles.destructiveLabel]}>
              Очистить
            </Text>
          </TouchableOpacity>

          <View style={styles.gap} />

          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={onCancel}
            activeOpacity={0.8}
          >
            <Text style={styles.cancelLabel}>Отмена</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  box: {
    backgroundColor: "#141824",
    borderRadius: 16,
    padding: 8,
    width: "100%",
    maxWidth: 360,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.1)",
  },
  title: {
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(255,255,255,0.4)",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    paddingTop: 12,
    paddingBottom: 10,
    paddingHorizontal: 12,
  },
  infoBlock: {
    paddingHorizontal: 12,
    paddingBottom: 10,
    gap: 4,
  },
  infoLine: {
    fontSize: 13,
    fontWeight: "500",
    color: "rgba(255,255,255,0.6)",
  },
  row: {
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  destructiveLabel: {
    color: "#DC2626",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(255,255,255,0.1)",
    marginHorizontal: 12,
  },
  gap: {
    height: 8,
  },
  cancelBtn: {
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    marginHorizontal: 4,
    marginBottom: 4,
  },
  cancelLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "rgba(255,255,255,0.7)",
  },
});
