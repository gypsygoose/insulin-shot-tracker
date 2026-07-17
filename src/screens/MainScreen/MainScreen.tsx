import { useCallback, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import {
  ZoneContainer,
  BottomMenu,
  PointContextMenu,
  MarkDialog,
  ConfirmDialog,
  ToastEntry,
  ToastStack,
  BodyImage,
} from "../../components";
import { useAppStore } from "../../hooks";
import { useTheme } from "../../theme";
import { useLanguage } from "../../i18n";
import { PointService } from "../../logic";
import { ZONES, ZONE_MAP, ZONE_LABEL_KEY } from "../../data";
import { PointColor, ThemeMode, ToastStatus, ZoneGroup } from "../../types";
import {
  APP_NAME,
  INTERFACE_LOCKED_TOAST_DURATION_MS,
  MAX_STACKED_TOASTS,
  TOAST_DURATION_MS,
} from "../../constants";
import { buildPointAddressSuffix, buildMarkToastMessage } from "./utils";

// See CLAUDE.md's "more than 2 parameters" coding-convention bullet — local
// to this file (only ≤2 other local types would apply here), so it stays
// declared near its one use rather than moving to ./types.
interface ShowToastParams {
  message: string;
  status: ToastStatus;
  duration?: number;
}

export function MainScreen() {
  // Long-pressed point awaiting an action from the menu / follow-up dialogs.
  const [menuPointId, setMenuPointId] = useState<string | null>(null);
  const [markPointId, setMarkPointId] = useState<string | null>(null);
  const [clearPointId, setClearPointId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastEntry[]>([]);
  const nextToastIdRef = useRef(0);

  const showToast = useCallback(
    ({ message, status, duration = TOAST_DURATION_MS }: ShowToastParams) => {
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
      () =>
        showToast({ message: t("toast.autoLockFired"), status: ToastStatus.Info }),
      [showToast, t],
    ),
  );
  const {
    pointStates,
    now,
    daysToWhite,
    daysToAvailable,
    pointRestoreMode,
    interfaceLocked,
    zoneData,
    isLoaded,
    gender,
    mirrored,
    enabledZones,
    lastInGroup,
    events,
    autoLockEnabled,
    autoLockAfterMarkSeconds,
    autoLockAfterUnlockSeconds,
    zonePointCounts,
  } = state;

  // ThemeProvider/LanguageProvider are mounted in App.tsx, above MainScreen,
  // so they're read through context here like any other descendant.
  const {
    resolvedScheme,
    colors,
    mode: themeMode,
    setMode: onSetThemeMode,
  } = useTheme();
  const { mode: languageMode, setMode: onSetLanguageMode } = useLanguage();

  const handlePress = useCallback(
    (id: string) => {
      const color = PointService.computePointColor({
        state: pointStates[id],
        now,
        daysToWhite,
        pointRestoreMode,
      });

      if (
        color === PointColor.Gray ||
        color === PointColor.Black ||
        color === PointColor.Marked
      ) {
        showToast({
          message: t("toast.blocked"),
          status: ToastStatus.Info,
          duration: TOAST_DURATION_MS,
        });
        return;
      }

      if (interfaceLocked) {
        showToast({
          message: t("toast.interfaceLocked"),
          status: ToastStatus.Info,
          duration: INTERFACE_LOCKED_TOAST_DURATION_MS,
        });
        return;
      }

      const daysUntilAvailable = PointService.daysUntilAvailable({
        state: pointStates[id],
        now,
        daysToWhite,
        daysToAvailable,
        pointRestoreMode,
      });
      if (daysUntilAvailable !== undefined) {
        showToast({
          message: t("toast.pointUnavailable", { count: daysUntilAvailable }),
          status: ToastStatus.Info,
          duration: TOAST_DURATION_MS,
        });
        return;
      }

      const timestamp = Date.now();
      actions.pressPoint(id);
      const toast = buildMarkToastMessage({
        t,
        locale: i18n.language,
        pointId: id,
        pointState: pointStates[id],
        timestamp,
        daysToWhite,
        daysToAvailable,
        pointMap: zoneData.pointMap,
        pointAddress: zoneData.pointAddress,
        pointRestoreMode,
      });
      if (toast)
        showToast({
          message: toast.message,
          status: toast.status,
          duration: TOAST_DURATION_MS,
        });
    },
    [
      actions,
      pointStates,
      now,
      daysToWhite,
      daysToAvailable,
      pointRestoreMode,
      interfaceLocked,
      zoneData,
      showToast,
      t,
      i18n.language,
    ],
  );
  const handleLongPress = useCallback((id: string) => setMenuPointId(id), []);

  const menuZone = menuPointId
    ? ZONE_MAP[zoneData.pointMap[menuPointId]?.zoneId]
    : undefined;
  const menuZoneLabel = menuZone ? t(ZONE_LABEL_KEY[menuZone.id]) : undefined;
  const menuPointState = menuPointId ? pointStates[menuPointId] : undefined;
  const menuPointColor = menuPointState
    ? PointService.computePointColor({
        state: menuPointState,
        now,
        daysToWhite,
        pointRestoreMode,
      })
    : undefined;
  const menuDaysUntilAvailable = menuPointState
    ? PointService.daysUntilAvailable({
        state: menuPointState,
        now,
        daysToWhite,
        daysToAvailable,
        pointRestoreMode,
      })
    : undefined;
  const menuPointAddress = menuPointId
    ? zoneData.pointAddress[menuPointId]
    : undefined;

  if (!isLoaded) {
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
          resolvedScheme === ThemeMode.Light ? "dark-content" : "light-content"
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
          <BodyImage gender={gender} style={[styles.image]} />
        </View>

        <View
          style={[styles.sideLabels, mirrored && styles.sideLabelsMirrored]}
        >
          <Text style={[styles.sideLabel, { color: colors.sectionLabel }]}>
            {t("mainScreen.rightSideLabel")}
          </Text>
          <Text style={[styles.sideLabel, { color: colors.sectionLabel }]}>
            {t("mainScreen.leftSideLabel")}
          </Text>
        </View>

        {ZONES.filter((zone) => enabledZones[zone.id]).map((zone) => (
          <ZoneContainer
            key={zone.id}
            zoneId={zone.id}
            mirrored={mirrored}
            zoneLayout={zoneData.zoneLayout}
            pointsByZone={zoneData.pointsByZone}
            getColor={(pointId) =>
              PointService.computePointColor({
                state: pointStates[pointId],
                now,
                daysToWhite,
                pointRestoreMode,
              })
            }
            isCheckmarked={(pointId) =>
              lastInGroup[ZoneGroup.Thighs] === pointId ||
              lastInGroup[ZoneGroup.ShouldersAndBelly] === pointId
            }
            isUnavailable={(pointId) =>
              PointService.daysUntilAvailable({
                state: pointStates[pointId],
                now,
                daysToWhite,
                daysToAvailable,
                pointRestoreMode,
              }) !== undefined
            }
            onPress={handlePress}
            onLongPress={handleLongPress}
          />
        ))}
      </View>

      {/* Bottom menu */}
      <BottomMenu
        canUndo={events.length > 0}
        onUndo={actions.undo}
        onClear={actions.clearSelected}
        mirrored={mirrored}
        onToggleMirrored={actions.setMirrored}
        interfaceLocked={interfaceLocked}
        onToggleInterfaceLocked={() => {
          const nextLocked = !interfaceLocked;
          actions.setInterfaceLocked(nextLocked);
          showToast({
            message: nextLocked
              ? t("toast.interfaceLockEnabled")
              : t("toast.interfaceLockDisabled"),
            status: ToastStatus.Info,
          });
        }}
        autoLockEnabled={autoLockEnabled}
        autoLockAfterMarkSeconds={autoLockAfterMarkSeconds}
        autoLockAfterUnlockSeconds={autoLockAfterUnlockSeconds}
        onEnableAutoLock={actions.enableAutoLock}
        onDisableAutoLock={actions.disableAutoLock}
        onUpdateAutoLockTimes={actions.updateAutoLockTimes}
        daysToWhite={daysToWhite}
        onSetDaysToWhite={actions.setDaysToWhite}
        daysToAvailable={daysToAvailable}
        onSetDaysToAvailable={actions.setDaysToAvailable}
        pointRestoreMode={pointRestoreMode}
        onSetPointRestoreMode={actions.setPointRestoreMode}
        gender={gender}
        onSetGender={actions.setGender}
        zonePointCounts={zonePointCounts}
        onSetZonePointCounts={actions.setZonePointCounts}
        enabledZones={enabledZones}
        onSetEnabledZones={actions.setEnabledZones}
        themeMode={themeMode}
        onSetThemeMode={onSetThemeMode}
        languageMode={languageMode}
        onSetLanguageMode={onSetLanguageMode}
        onExport={(selection) =>
          actions.exportData({
            themeMode,
            languageMode,
            dialogTitle: t("menu.exportOptionsDialog.shareDialogTitle", {
              appName: APP_NAME,
            }),
            selection,
          })
        }
        onPickImportFile={actions.pickImportFile}
        onApplyImport={(data) => {
          actions.applyImport(data);
          if (data.themeMode !== undefined) onSetThemeMode(data.themeMode);
          if (data.languageMode !== undefined)
            onSetLanguageMode(data.languageMode);
        }}
        onNotify={(message, status) => showToast({ message, status })}
      />

      {/* Long-press menu for a single point */}
      <PointContextMenu
        visible={menuPointId !== null}
        zoneLabel={menuZoneLabel}
        color={menuPointColor}
        pointState={menuPointState}
        address={menuPointAddress}
        now={now}
        daysUntilAvailable={menuDaysUntilAvailable}
        onBlock={() => {
          if (menuPointId) {
            actions.blockPoint(menuPointId);
            const addressSuffix = buildPointAddressSuffix({
              t,
              pointId: menuPointId,
              pointMap: zoneData.pointMap,
              pointAddress: zoneData.pointAddress,
            });
            if (addressSuffix) {
              showToast({
                message: t("toast.labeledValue", {
                  label: t("toast.manualBlockPrefix"),
                  value: addressSuffix,
                }),
                status: ToastStatus.Success,
              });
            }
          }
          setMenuPointId(null);
        }}
        onUnblock={() => {
          if (menuPointId) {
            actions.unblockPoint(menuPointId);
            const addressSuffix = buildPointAddressSuffix({
              t,
              pointId: menuPointId,
              pointMap: zoneData.pointMap,
              pointAddress: zoneData.pointAddress,
            });
            if (addressSuffix) {
              showToast({
                message: t("toast.labeledValue", {
                  label: t("toast.manualUnblockPrefix"),
                  value: addressSuffix,
                }),
                status: ToastStatus.Success,
              });
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
          markPointId ? pointStates[markPointId]?.lastInjectionAt : undefined
        }
        onConfirm={(timestamp) => {
          if (markPointId) {
            const toast = buildMarkToastMessage({
              t,
              locale: i18n.language,
              pointId: markPointId,
              pointState: pointStates[markPointId],
              timestamp,
              daysToWhite,
              daysToAvailable,
              pointMap: zoneData.pointMap,
              pointAddress: zoneData.pointAddress,
              pointRestoreMode,
            });
            actions.markPointAt(markPointId, timestamp);
            if (toast)
              showToast({ message: toast.message, status: toast.status });
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
            const addressSuffix = buildPointAddressSuffix({
              t,
              pointId: clearPointId,
              pointMap: zoneData.pointMap,
              pointAddress: zoneData.pointAddress,
            });
            if (addressSuffix) {
              showToast({
                message: t("toast.labeledValue", {
                  label: t("toast.pointClearedPrefix"),
                  value: addressSuffix,
                }),
                status: ToastStatus.Success,
              });
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
    position: "relative",
    maxWidth: "100%",
    alignSelf: "center",
  },
  imageContainer: {
    width: "100%",
    height: "100%",
    paddingHorizontal: 20,
  },
  image: {
    width: "100%",
    height: "100%",
    maxWidth: "100%",
    maxHeight: "100%",
  },
  sideLabels: {
    position: "absolute",
    top: 0,
    left: 0,
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
