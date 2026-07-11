import { useCallback, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  Image,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import { ZoneContainer } from "../components/ZoneContainer";
import { BottomMenu } from "../components/BottomMenu";
import { PointContextMenu } from "../components/PointContextMenu";
import { MarkDialog } from "../components/MarkDialog";
import { ConfirmDialog } from "../components/common/ConfirmDialog";
import { ToastEntry, ToastStack } from "../components/common/ToastStack";
import { useAppStore } from "../store/useAppStore";
import { useTheme } from "../theme/ThemeContext";
import { useLanguage } from "../i18n/LanguageContext";
import {
  computePointColor,
  onPress,
  PressResultType,
} from "../logic/stateMachine";
import {
  ZONES,
  POINT_MAP,
  ZONE_MAP,
  POINT_ADDRESS,
  ZONE_LABEL_KEY,
} from "../data/zones";
import {
  PointColor,
  StoredPointState,
  ThemeMode,
  ToastStatus,
  ZoneGroup,
} from "../types";
import { formatDateTime } from "../format";
import {
  APP_NAME,
  IMG_ASPECT,
  INTERFACE_LOCKED_TOAST_DURATION_MS,
  MARK_BACKDATED_THRESHOLD_MS,
  MAX_STACKED_TOASTS,
  TOAST_DURATION_MS,
} from "../constants";

// Shared "<zone label>, ряд <row>, место <column> от центра тела" suffix used
// by every point-specific toast (mark/block/clear) to name which point it's
// about via its body-relative address.
function buildPointAddressSuffix(
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

interface MarkToastMessage {
  message: string;
  status: ToastStatus;
}

// Toast shown after a point is marked (tap or the context menu's "Отметить"
// dialog), confirming which point it was via its body-relative address, plus
// the marked time if it's backdated and a note if the mark triggered a
// system blackout (site reused too early) — which also bumps the toast's
// status from Success to Warn.
function buildMarkToastMessage(
  t: TFunction,
  locale: string,
  pointId: string,
  pointState: StoredPointState,
  timestamp: number,
  daysToWhite: number,
): MarkToastMessage | null {
  const addressSuffix = buildPointAddressSuffix(t, pointId);
  if (!addressSuffix) return null;

  let message = t("toast.pointMarked", { address: addressSuffix });
  let status = ToastStatus.Success;

  const result = onPress(pointState, timestamp, daysToWhite);
  if (result.type === PressResultType.Blackout) {
    const days = result.newState.blackoutDurationDays!;
    message += t("toast.markBlackoutSuffix", { count: days });
    status = ToastStatus.Warn;
  }

  if (Date.now() - timestamp > MARK_BACKDATED_THRESHOLD_MS) {
    message += t("toast.markBackdatedSuffix", {
      dateTime: formatDateTime(timestamp, locale),
    });
  }

  return { message, status };
}

export function MainScreen() {
  // Long-pressed point awaiting an action from the menu / follow-up dialogs.
  const [menuPointId, setMenuPointId] = useState<string | null>(null);
  const [markPointId, setMarkPointId] = useState<string | null>(null);
  const [clearPointId, setClearPointId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastEntry[]>([]);
  const nextToastIdRef = useRef(0);

  const showToast = useCallback(
    (
      message: string,
      status: ToastStatus,
      duration: number = TOAST_DURATION_MS,
    ) => {
      const id = `toast-${nextToastIdRef.current++}`;
      setToasts((prev) =>
        [{ id, message, status, duration }, ...prev].slice(
          0,
          MAX_STACKED_TOASTS,
        ),
      );
    },
    [],
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const { t, i18n } = useTranslation();

  const [state, actions] = useAppStore(
    useCallback(
      () => showToast(t("toast.autoLockFired"), ToastStatus.Info),
      [showToast, t],
    ),
  );

  // ThemeProvider/LanguageProvider are mounted in App.tsx, above MainScreen,
  // so they're read through context here like any other descendant.
  const { resolvedScheme, colors, mode: themeMode, setMode: onSetThemeMode } =
    useTheme();
  const { mode: languageMode, setMode: onSetLanguageMode } = useLanguage();

  const handlePress = useCallback(
    (id: string) => {
      const color = computePointColor(
        state.pointStates[id],
        state.now,
        state.daysToWhite,
      );

      if (color === PointColor.Gray || color === PointColor.Black) {
        showToast(t("toast.blocked"), ToastStatus.Info, TOAST_DURATION_MS);
        return;
      }

      if (state.interfaceLocked) {
        showToast(
          t("toast.interfaceLocked"),
          ToastStatus.Info,
          INTERFACE_LOCKED_TOAST_DURATION_MS,
        );
        return;
      }

      const timestamp = Date.now();
      actions.pressPoint(id);
      const toast = buildMarkToastMessage(
        t,
        i18n.language,
        id,
        state.pointStates[id],
        timestamp,
        state.daysToWhite,
      );
      if (toast) showToast(toast.message, toast.status, TOAST_DURATION_MS);
    },
    [
      actions,
      state.pointStates,
      state.now,
      state.daysToWhite,
      state.interfaceLocked,
      showToast,
      t,
      i18n.language,
    ],
  );
  const handleLongPress = useCallback((id: string) => setMenuPointId(id), []);

  const menuZone = menuPointId
    ? ZONE_MAP[POINT_MAP[menuPointId]?.zoneId]
    : undefined;
  const menuZoneLabel = menuZone ? t(ZONE_LABEL_KEY[menuZone.id]) : undefined;
  const menuPointState = menuPointId
    ? state.pointStates[menuPointId]
    : undefined;
  const menuPointColor = menuPointState
    ? computePointColor(menuPointState, state.now, state.daysToWhite)
    : undefined;

  if (!state.isLoaded) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.icon} />
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={
          resolvedScheme === ThemeMode.Light
            ? "dark-content"
            : "light-content"
        }
        backgroundColor={colors.background}
      />

      <ToastStack toasts={toasts} onDismiss={dismissToast} />

      {/* Header */}
      <SafeAreaView
        style={[styles.headerSafe, { backgroundColor: colors.background }]}
        edges={["top"]}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.screenTitle }]}>
            {APP_NAME}
          </Text>
        </View>
      </SafeAreaView>

      {/* Body image + points overlay */}
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
            <Text style={[styles.sideLabel, { color: colors.sectionLabel }]}>
              {t("mainScreen.rightSideLabel")}
            </Text>
            <Text style={[styles.sideLabel, { color: colors.sectionLabel }]}>
              {t("mainScreen.leftSideLabel")}
            </Text>
          </View>

          {ZONES.map((zone) => (
            <ZoneContainer
              key={zone.id}
              zoneId={zone.id}
              mirrored={state.mirrored}
              getColor={(pointId) =>
                computePointColor(
                  state.pointStates[pointId],
                  state.now,
                  state.daysToWhite,
                )
              }
              isCheckmarked={(pointId) =>
                state.lastInGroup[ZoneGroup.Thighs] === pointId ||
                state.lastInGroup[ZoneGroup.ShouldersAndBelly] === pointId
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
              ? t("toast.interfaceLockEnabled")
              : t("toast.interfaceLockDisabled"),
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
        themeMode={themeMode}
        onSetThemeMode={onSetThemeMode}
        languageMode={languageMode}
        onSetLanguageMode={onSetLanguageMode}
        onExport={(selection) =>
          actions.exportData(
            themeMode,
            languageMode,
            t("menu.exportOptionsDialog.shareDialogTitle", {
              appName: APP_NAME,
            }),
            selection,
          )
        }
        onPickImportFile={actions.pickImportFile}
        onApplyImport={(data) => {
          actions.applyImport(data);
          if (data.themeMode !== undefined) onSetThemeMode(data.themeMode);
          if (data.languageMode !== undefined)
            onSetLanguageMode(data.languageMode);
        }}
        onNotify={showToast}
      />

      {/* Long-press menu for a single point */}
      <PointContextMenu
        visible={menuPointId !== null}
        pointId={menuPointId ?? undefined}
        zoneLabel={menuZoneLabel}
        color={menuPointColor}
        pointState={menuPointState}
        now={state.now}
        onBlock={() => {
          if (menuPointId) {
            actions.blockPoint(menuPointId);
            const addressSuffix = buildPointAddressSuffix(t, menuPointId);
            if (addressSuffix) {
              showToast(
                t("toast.labeledValue", {
                  label: t("toast.manualBlockPrefix"),
                  value: addressSuffix,
                }),
                ToastStatus.Success,
              );
            }
          }
          setMenuPointId(null);
        }}
        onUnblock={() => {
          if (menuPointId) {
            actions.unblockPoint(menuPointId);
            const addressSuffix = buildPointAddressSuffix(t, menuPointId);
            if (addressSuffix) {
              showToast(
                t("toast.labeledValue", {
                  label: t("toast.manualUnblockPrefix"),
                  value: addressSuffix,
                }),
                ToastStatus.Success,
              );
            }
          }
          setMenuPointId(null);
        }}
        onMark={() => {
          setMarkPointId(menuPointId);
          setMenuPointId(null);
        }}
        onClear={() => {
          setClearPointId(menuPointId);
          setMenuPointId(null);
        }}
        onCancel={() => setMenuPointId(null)}
      />

      <MarkDialog
        visible={markPointId !== null}
        minDate={
          markPointId
            ? state.pointStates[markPointId]?.lastInjectionAt
            : undefined
        }
        onConfirm={(timestamp) => {
          if (markPointId) {
            const toast = buildMarkToastMessage(
              t,
              i18n.language,
              markPointId,
              state.pointStates[markPointId],
              timestamp,
              state.daysToWhite,
            );
            actions.markPointAt(markPointId, timestamp);
            if (toast) showToast(toast.message, toast.status);
          }
          setMarkPointId(null);
        }}
        onCancel={() => setMarkPointId(null)}
      />

      <ConfirmDialog
        visible={clearPointId !== null}
        title={t("mainScreen.clearPointConfirm.title")}
        message={t("mainScreen.clearPointConfirm.message")}
        confirmLabel={t("common.clear")}
        onConfirm={() => {
          if (clearPointId) {
            actions.clearPoint(clearPointId);
            const addressSuffix = buildPointAddressSuffix(t, clearPointId);
            if (addressSuffix) {
              showToast(
                t("toast.labeledValue", {
                  label: t("toast.pointClearedPrefix"),
                  value: addressSuffix,
                }),
                ToastStatus.Success,
              );
            }
          }
          setClearPointId(null);
        }}
        onCancel={() => setClearPointId(null)}
        destructive
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerSafe: {},
  header: {
    paddingTop: 12,
    paddingBottom: 12,
    alignItems: "center",
  },
  title: {
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
    fontSize: 12,
    fontWeight: "400",
    textTransform: "uppercase",
    textAlign: "center",
  },
});
