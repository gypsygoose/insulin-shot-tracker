import { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  Image,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ZoneContainer } from "../components/ZoneContainer";
import { BottomMenu } from "../components/BottomMenu";
import { ButtonContextMenu } from "../components/ButtonContextMenu";
import { MarkDialog } from "../components/MarkDialog";
import { ConfirmDialog } from "../components/common/ConfirmDialog";
import { Toast } from "../components/common/Toast";
import { useAppStore } from "../store/useAppStore";
import {
  computeButtonColor,
  onPress,
  PressResultType,
} from "../logic/stateMachine";
import { ZONES, BUTTON_MAP, ZONE_MAP, BUTTON_ADDRESS } from "../data/zones";
import { ButtonColor, StoredButtonState, ToastStatus, ZoneGroup } from "../types";
import { formatDateTime, pluralDays } from "../format";
import {
  APP_NAME,
  AUTO_LOCK_FIRED_TOAST_MESSAGE,
  BACKGROUND_COLOR,
  BLOCKED_TOAST_MESSAGE,
  CLEAR_LABEL,
  SCREEN_TITLE_COLOR,
  ICON_COLOR,
  IMG_ASPECT,
  INTERFACE_LOCK_DISABLED_TOAST_MESSAGE,
  INTERFACE_LOCK_ENABLED_TOAST_MESSAGE,
  INTERFACE_LOCKED_TOAST_DURATION_MS,
  INTERFACE_LOCKED_TOAST_MESSAGE,
  LEFT_SIDE_LABEL,
  MANUAL_BLOCK_TOAST_PREFIX,
  MANUAL_UNBLOCK_TOAST_PREFIX,
  MARK_BACKDATED_THRESHOLD_MS,
  POINT_CLEARED_TOAST_PREFIX,
  RIGHT_SIDE_LABEL,
  PRIMARY_SECTION_LABEL_COLOR,
  TOAST_DURATION_MS,
} from "../constants";

// Shared "<zone label>, ряд <row>, место <column> от центра тела" suffix used
// by every point-specific toast (mark/block/clear) to name which point it's
// about via its body-relative address.
function buildPointAddressSuffix(buttonId: string): string | null {
  const btn = BUTTON_MAP[buttonId];
  const zone = btn ? ZONE_MAP[btn.zoneId] : undefined;
  const address = BUTTON_ADDRESS[buttonId];
  if (!zone || !address) return null;
  return `${zone.label}, ряд ${address.row}, место ${address.column} от центра тела`;
}

// Toast shown after a point is marked (tap or the context menu's "Отметить"
// dialog), confirming which point it was via its body-relative address, plus
// the marked time if it's backdated and a note if the mark triggered a
// system blackout (site reused too early) — which also bumps the toast's
// status from Success to Warn.
function buildMarkToastMessage(
  buttonId: string,
  buttonState: StoredButtonState,
  timestamp: number,
  daysToWhite: number,
): { message: string; status: ToastStatus } | null {
  const addressSuffix = buildPointAddressSuffix(buttonId);
  if (!addressSuffix) return null;

  let message = `Точка отмечена: ${addressSuffix}`;
  let status = ToastStatus.Success;

  const result = onPress(buttonState, timestamp, daysToWhite);
  if (result.type === PressResultType.Blackout) {
    const days = result.newState.blackoutDurationDays!;
    message += `\nТочка заблокирована системой на ${days} ${pluralDays(days)}.`;
    status = ToastStatus.Warn;
  }

  if (Date.now() - timestamp > MARK_BACKDATED_THRESHOLD_MS) {
    message += `\nВремя отметки: ${formatDateTime(timestamp)}`;
  }

  return { message, status };
}

export function MainScreen() {
  // Long-pressed button awaiting an action from the menu / follow-up dialogs.
  const [menuButtonId, setMenuButtonId] = useState<string | null>(null);
  const [markButtonId, setMarkButtonId] = useState<string | null>(null);
  const [clearButtonId, setClearButtonId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastStatus, setToastStatus] = useState<ToastStatus>(ToastStatus.Info);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const showToast = useCallback(
    (message: string, status: ToastStatus, duration: number = TOAST_DURATION_MS) => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      setToastMessage(message);
      setToastStatus(status);
      toastTimerRef.current = setTimeout(() => {
        setToastMessage(null);
      }, duration);
    },
    [],
  );

  const [state, actions] = useAppStore(
    useCallback(
      () => showToast(AUTO_LOCK_FIRED_TOAST_MESSAGE, ToastStatus.Info),
      [showToast],
    ),
  );

  const handlePress = useCallback(
    (id: string) => {
      const color = computeButtonColor(
        state.buttonStates[id],
        state.now,
        state.daysToWhite,
      );

      if (color === ButtonColor.Gray || color === ButtonColor.Black) {
        showToast(BLOCKED_TOAST_MESSAGE, ToastStatus.Info, TOAST_DURATION_MS);
        return;
      }

      if (state.interfaceLocked) {
        showToast(
          INTERFACE_LOCKED_TOAST_MESSAGE,
          ToastStatus.Info,
          INTERFACE_LOCKED_TOAST_DURATION_MS,
        );
        return;
      }

      const timestamp = Date.now();
      actions.pressButton(id);
      const toast = buildMarkToastMessage(
        id,
        state.buttonStates[id],
        timestamp,
        state.daysToWhite,
      );
      if (toast) showToast(toast.message, toast.status, TOAST_DURATION_MS);
    },
    [
      actions,
      state.buttonStates,
      state.now,
      state.daysToWhite,
      state.interfaceLocked,
      showToast,
    ],
  );
  const handleLongPress = useCallback((id: string) => setMenuButtonId(id), []);

  const menuZoneLabel = menuButtonId
    ? ZONE_MAP[BUTTON_MAP[menuButtonId]?.zoneId]?.label
    : undefined;
  const menuButtonState = menuButtonId
    ? state.buttonStates[menuButtonId]
    : undefined;
  const menuButtonColor = menuButtonState
    ? computeButtonColor(menuButtonState, state.now, state.daysToWhite)
    : undefined;

  if (!state.isLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={ICON_COLOR} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={BACKGROUND_COLOR} />

      <Toast message={toastMessage} status={toastStatus} />

      {/* Header */}
      <SafeAreaView style={styles.headerSafe} edges={["top"]}>
        <View style={styles.header}>
          <Text style={styles.title}>{APP_NAME}</Text>
        </View>
      </SafeAreaView>

      {/* Body image + buttons overlay */}
      <View style={styles.bodyWrap}>
        <View style={styles.imageContainer}>
          <Image
            source={require("../../assets/images/body.png")}
            style={[styles.image, StyleSheet.absoluteFill]}
            resizeMode="contain"
          />

          <View
            style={[
              styles.sideLabels,
              state.mirrored && styles.sideLabelsMirrored,
            ]}
          >
            <Text style={styles.sideLabel}>{RIGHT_SIDE_LABEL}</Text>
            <Text style={styles.sideLabel}>{LEFT_SIDE_LABEL}</Text>
          </View>

          {ZONES.map((zone) => (
            <ZoneContainer
              key={zone.id}
              zoneId={zone.id}
              mirrored={state.mirrored}
              getColor={(buttonId) =>
                computeButtonColor(
                  state.buttonStates[buttonId],
                  state.now,
                  state.daysToWhite,
                )
              }
              isCheckmarked={(buttonId) =>
                state.lastInGroup[ZoneGroup.Thighs] === buttonId ||
                state.lastInGroup[ZoneGroup.ShouldersAndBelly] === buttonId
              }
              onPress={handlePress}
              onLongPress={handleLongPress}
            />
          ))}
        </View>
      </View>

      {/* Bottom menu */}
      <BottomMenu
        canUndo={state.events.length > 0}
        onUndo={actions.undo}
        onClear={actions.clearAll}
        mirrored={state.mirrored}
        onToggleMirrored={actions.setMirrored}
        interfaceLocked={state.interfaceLocked}
        onToggleInterfaceLocked={() => {
          const nextLocked = !state.interfaceLocked;
          actions.setInterfaceLocked(nextLocked);
          showToast(
            nextLocked
              ? INTERFACE_LOCK_ENABLED_TOAST_MESSAGE
              : INTERFACE_LOCK_DISABLED_TOAST_MESSAGE,
            ToastStatus.Info,
          );
        }}
        autoLockEnabled={state.autoLockEnabled}
        autoLockAfterMarkSeconds={state.autoLockAfterMarkSeconds}
        autoLockAfterUnlockSeconds={state.autoLockAfterUnlockSeconds}
        onEnableAutoLock={actions.enableAutoLock}
        onDisableAutoLock={actions.disableAutoLock}
        onUpdateAutoLockTimes={actions.updateAutoLockTimes}
        daysToWhite={state.daysToWhite}
        onSetDaysToWhite={actions.setDaysToWhite}
        onExport={actions.exportData}
        onPickImportFile={actions.pickImportFile}
        onApplyImport={actions.applyImport}
        onNotify={showToast}
      />

      {/* Long-press menu for a single button */}
      <ButtonContextMenu
        visible={menuButtonId !== null}
        buttonId={menuButtonId ?? undefined}
        zoneLabel={menuZoneLabel}
        color={menuButtonColor}
        buttonState={menuButtonState}
        now={state.now}
        onBlock={() => {
          if (menuButtonId) {
            actions.blockButton(menuButtonId);
            const addressSuffix = buildPointAddressSuffix(menuButtonId);
            if (addressSuffix) {
              showToast(
                `${MANUAL_BLOCK_TOAST_PREFIX}: ${addressSuffix}`,
                ToastStatus.Success,
              );
            }
          }
          setMenuButtonId(null);
        }}
        onUnblock={() => {
          if (menuButtonId) {
            actions.unblockButton(menuButtonId);
            const addressSuffix = buildPointAddressSuffix(menuButtonId);
            if (addressSuffix) {
              showToast(
                `${MANUAL_UNBLOCK_TOAST_PREFIX}: ${addressSuffix}`,
                ToastStatus.Success,
              );
            }
          }
          setMenuButtonId(null);
        }}
        onMark={() => {
          setMarkButtonId(menuButtonId);
          setMenuButtonId(null);
        }}
        onClear={() => {
          setClearButtonId(menuButtonId);
          setMenuButtonId(null);
        }}
        onCancel={() => setMenuButtonId(null)}
      />

      <MarkDialog
        visible={markButtonId !== null}
        onConfirm={(timestamp) => {
          if (markButtonId) {
            const toast = buildMarkToastMessage(
              markButtonId,
              state.buttonStates[markButtonId],
              timestamp,
              state.daysToWhite,
            );
            actions.markButtonAt(markButtonId, timestamp);
            if (toast) showToast(toast.message, toast.status);
          }
          setMarkButtonId(null);
        }}
        onCancel={() => setMarkButtonId(null)}
      />

      <ConfirmDialog
        visible={clearButtonId !== null}
        title="Очистить точку?"
        message="Данные этой точки будут удалены, и она станет белой (свободной). Это действие нельзя отменить повторно."
        confirmLabel={CLEAR_LABEL}
        onConfirm={() => {
          if (clearButtonId) {
            actions.clearButton(clearButtonId);
            const addressSuffix = buildPointAddressSuffix(clearButtonId);
            if (addressSuffix) {
              showToast(
                `${POINT_CLEARED_TOAST_PREFIX}: ${addressSuffix}`,
                ToastStatus.Success,
              );
            }
          }
          setClearButtonId(null);
        }}
        onCancel={() => setClearButtonId(null)}
        destructive
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BACKGROUND_COLOR,
  },
  headerSafe: {
    backgroundColor: BACKGROUND_COLOR,
  },
  header: {
    paddingTop: 12,
    paddingBottom: 12,
    alignItems: "center",
  },
  title: {
    color: SCREEN_TITLE_COLOR,
    paddingBottom: 16,
    fontSize: 13,
    fontWeight: "400",
    letterSpacing: 3.1,
    textTransform: "uppercase",
  },
  bodyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  imageContainer: {
    position: "relative",
    flex: 1,
    maxWidth: "100%",
    aspectRatio: IMG_ASPECT,
    alignSelf: "center",
  },
  image: {
    width: "100%",
    height: "100%",
    maxWidth: "100%",
    maxHeight: "100%",
  },
  sideLabels: {
    position: "absolute",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 12,
    width: "100%",
    boxSizing: "border-box",
  },
  sideLabelsMirrored: {
    flexDirection: "row-reverse",
  },
  sideLabel: {
    color: PRIMARY_SECTION_LABEL_COLOR,
    fontSize: 12,
    fontWeight: "400",
    textTransform: "uppercase",
    textAlign: "center",
  },
});
