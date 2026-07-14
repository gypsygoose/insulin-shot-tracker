import { useState } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { i18next } from "../../i18n";
import { ConfirmDialog } from "../common";
import { HelpSheet } from "../HelpSheet";
import { MenuSheet } from "../MenuSheet";
import {
  SettingsSheet,
  LANGUAGE_MODE_KEY,
  POINT_RESTORE_MODE_KEY,
  THEME_MODE_KEY,
} from "../SettingsSheet";
import { AutoLockDialog } from "../AutoLockDialog";
import { DaysToWhiteDialog } from "../DaysToWhiteDialog";
import { DaysToAvailableDialog } from "../DaysToAvailableDialog";
import { ZonePointsDialog } from "../ZonePointsDialog";
import { ZonesDialog } from "../ZonesDialog";
import { ThemeDialog } from "../ThemeDialog";
import { LanguageDialog } from "../LanguageDialog";
import { PointRestoreModeDialog } from "../PointRestoreModeDialog";
import { ClearOptionsDialog } from "../ClearOptionsDialog";
import { ExportOptionsDialog } from "../ExportOptionsDialog";
import { ImportOptionsDialog } from "../ImportOptionsDialog";
import {
  UndoIcon,
  HelpIcon,
  LockClosedIcon,
  LockOpenIcon,
  MenuIcon,
} from "../icons";
import {
  AutoLockDialogMode,
  EnabledZones,
  ExportedAppData,
  ExportSelection,
  ExportSettingKey,
  LanguageMode,
  PointRestoreMode,
  ThemeMode,
  ToastStatus,
  ZonePointCounts,
} from "../../types";
import { ImportResult, ImportResultType } from "../../storage";
import { useTheme } from "../../theme";
import { buildImportData } from "./utils";

interface Props {
  canUndo: boolean;
  onUndo: () => void;
  onClear: (selection: ExportSelection) => void;
  mirrored: boolean;
  onToggleMirrored: (value: boolean) => void;
  interfaceLocked: boolean;
  onToggleInterfaceLocked: () => void;
  autoLockEnabled: boolean;
  autoLockAfterMarkSeconds: number;
  autoLockAfterUnlockSeconds: number;
  onEnableAutoLock: (
    afterMarkSeconds: number,
    afterUnlockSeconds: number,
  ) => void;
  onDisableAutoLock: () => void;
  onUpdateAutoLockTimes: (
    afterMarkSeconds: number,
    afterUnlockSeconds: number,
  ) => void;
  daysToWhite: number;
  onSetDaysToWhite: (days: number) => void;
  daysToAvailable: number;
  onSetDaysToAvailable: (days: number) => void;
  pointRestoreMode: PointRestoreMode;
  onSetPointRestoreMode: (mode: PointRestoreMode) => void;
  zonePointCounts: ZonePointCounts;
  onSetZonePointCounts: (next: ZonePointCounts) => void;
  enabledZones: EnabledZones;
  onSetEnabledZones: (next: EnabledZones) => void;
  themeMode: ThemeMode;
  onSetThemeMode: (mode: ThemeMode) => void;
  languageMode: LanguageMode;
  onSetLanguageMode: (mode: LanguageMode) => Promise<void>;
  onExport: (selection: ExportSelection) => Promise<void>;
  onPickImportFile: () => Promise<ImportResult>;
  onApplyImport: (data: ExportedAppData) => void;
  onNotify: (message: string, status: ToastStatus) => void;
}

export function BottomMenu({
  canUndo,
  onUndo,
  onClear,
  mirrored,
  onToggleMirrored,
  interfaceLocked,
  onToggleInterfaceLocked,
  autoLockEnabled,
  autoLockAfterMarkSeconds,
  autoLockAfterUnlockSeconds,
  onEnableAutoLock,
  onDisableAutoLock,
  onUpdateAutoLockTimes,
  daysToWhite,
  onSetDaysToWhite,
  daysToAvailable,
  onSetDaysToAvailable,
  pointRestoreMode,
  onSetPointRestoreMode,
  zonePointCounts,
  onSetZonePointCounts,
  enabledZones,
  onSetEnabledZones,
  themeMode,
  onSetThemeMode,
  languageMode,
  onSetLanguageMode,
  onExport,
  onPickImportFile,
  onApplyImport,
  onNotify,
}: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [showUndo, setShowUndo] = useState(false);
  const [showClearOptions, setShowClearOptions] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [autoLockDialogIntent, setAutoLockDialogIntent] =
    useState<AutoLockDialogMode | null>(null);
  const [showDaysToWhiteDialog, setShowDaysToWhiteDialog] = useState(false);
  const [showDaysToAvailableDialog, setShowDaysToAvailableDialog] =
    useState(false);
  const [showZonePointsDialog, setShowZonePointsDialog] = useState(false);
  const [showZonesDialog, setShowZonesDialog] = useState(false);
  const [showPointRestoreModeDialog, setShowPointRestoreModeDialog] =
    useState(false);
  const [showThemeDialog, setShowThemeDialog] = useState(false);
  const [showLanguageDialog, setShowLanguageDialog] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [pendingImport, setPendingImport] = useState<ExportedAppData | null>(
    null,
  );

  const handleToggleAutoLock = (value: boolean) => {
    if (value) {
      setShowSettings(false);
      setAutoLockDialogIntent(AutoLockDialogMode.Enable);
    } else {
      onDisableAutoLock();
      onNotify(t("toast.autoLockDisabled"), ToastStatus.Success);
    }
  };

  const handleEditAutoLockSettings = () => {
    setShowSettings(false);
    setAutoLockDialogIntent(AutoLockDialogMode.Edit);
  };

  const handleEditPointRestoreMode = () => {
    setShowSettings(false);
    setShowPointRestoreModeDialog(true);
  };

  const handleEditDaysToWhite = () => {
    setShowSettings(false);
    setShowDaysToWhiteDialog(true);
  };

  const handleEditDaysToAvailable = () => {
    setShowSettings(false);
    setShowDaysToAvailableDialog(true);
  };

  const handleEditZonePointCounts = () => {
    setShowSettings(false);
    setShowZonePointsDialog(true);
  };

  const handleEditZones = () => {
    setShowSettings(false);
    setShowZonesDialog(true);
  };

  const handleEditTheme = () => {
    setShowSettings(false);
    setShowThemeDialog(true);
  };

  const handleEditLanguage = () => {
    setShowSettings(false);
    setShowLanguageDialog(true);
  };

  const handleImport = async () => {
    setShowMenu(false);
    const result = await onPickImportFile();
    if (result.type === ImportResultType.Cancelled) return;
    if (result.type === ImportResultType.Invalid) {
      onNotify(t("toast.importFailure"), ToastStatus.Error);
      return;
    }
    setPendingImport(result.data);
  };

  return (
    <>
      {/* Rendered before the bar so the bar paints on top and stays
          visible/tappable while the help/menu sheet is open. */}
      <HelpSheet
        visible={showHelp}
        onClose={() => setShowHelp(false)}
        daysToWhite={daysToWhite}
        pointRestoreMode={pointRestoreMode}
      />
      <MenuSheet
        visible={showMenu}
        onClose={() => setShowMenu(false)}
        onOpenSettings={() => {
          setShowMenu(false);
          setShowSettings(true);
        }}
        onImport={handleImport}
        onExport={() => {
          setShowMenu(false);
          setShowExportOptions(true);
        }}
        onClear={() => {
          setShowMenu(false);
          setShowClearOptions(true);
        }}
      />

      <SettingsSheet
        visible={showSettings}
        onClose={() => setShowSettings(false)}
        mirrored={mirrored}
        onToggleMirrored={(value) => {
          onToggleMirrored(value);
          onNotify(
            value ? t("toast.mirrorEnabled") : t("toast.mirrorDisabled"),
            ToastStatus.Success,
          );
        }}
        autoLockEnabled={autoLockEnabled}
        autoLockAfterMarkSeconds={autoLockAfterMarkSeconds}
        autoLockAfterUnlockSeconds={autoLockAfterUnlockSeconds}
        onToggleAutoLocked={handleToggleAutoLock}
        onEditAutoLockSettings={handleEditAutoLockSettings}
        pointRestoreMode={pointRestoreMode}
        onEditPointRestoreMode={handleEditPointRestoreMode}
        daysToWhite={daysToWhite}
        onEditDaysToWhite={handleEditDaysToWhite}
        daysToAvailable={daysToAvailable}
        onEditDaysToAvailable={handleEditDaysToAvailable}
        onEditZonePointCounts={handleEditZonePointCounts}
        onEditZones={handleEditZones}
        themeMode={themeMode}
        onEditTheme={handleEditTheme}
        languageMode={languageMode}
        onEditLanguage={handleEditLanguage}
      />

      <AutoLockDialog
        visible={autoLockDialogIntent !== null}
        mode={autoLockDialogIntent ?? AutoLockDialogMode.Enable}
        initialAfterMarkSeconds={autoLockAfterMarkSeconds}
        initialAfterUnlockSeconds={autoLockAfterUnlockSeconds}
        onConfirm={(afterMarkSeconds, afterUnlockSeconds) => {
          const intent = autoLockDialogIntent;
          setAutoLockDialogIntent(null);
          if (intent === AutoLockDialogMode.Enable) {
            onEnableAutoLock(afterMarkSeconds, afterUnlockSeconds);
            onNotify(t("toast.autoLockEnabled"), ToastStatus.Success);
          } else {
            onUpdateAutoLockTimes(afterMarkSeconds, afterUnlockSeconds);
            onNotify(t("toast.autoLockUpdated"), ToastStatus.Success);
          }
        }}
        onCancel={() => setAutoLockDialogIntent(null)}
      />

      <DaysToWhiteDialog
        visible={showDaysToWhiteDialog}
        initialDays={daysToWhite}
        onConfirm={(days) => {
          setShowDaysToWhiteDialog(false);
          onSetDaysToWhite(days);
          onNotify(
            t("toast.labeledValue", {
              label: t("menu.daysToWhiteRow"),
              value: days,
            }),
            ToastStatus.Success,
          );
        }}
        onCancel={() => setShowDaysToWhiteDialog(false)}
      />

      <DaysToAvailableDialog
        visible={showDaysToAvailableDialog}
        initialDays={daysToAvailable}
        maxDays={daysToWhite}
        onConfirm={(days) => {
          setShowDaysToAvailableDialog(false);
          onSetDaysToAvailable(days);
          onNotify(
            t("toast.labeledValue", {
              label: t("menu.daysToAvailableRow"),
              value: days,
            }),
            ToastStatus.Success,
          );
        }}
        onCancel={() => setShowDaysToAvailableDialog(false)}
      />

      <ZonePointsDialog
        visible={showZonePointsDialog}
        initialZonePointCounts={zonePointCounts}
        onConfirm={(next) => {
          setShowZonePointsDialog(false);
          onSetZonePointCounts(next);
          onNotify(t("toast.zonePointCountsUpdated"), ToastStatus.Success);
        }}
        onCancel={() => setShowZonePointsDialog(false)}
      />

      <ZonesDialog
        visible={showZonesDialog}
        initialEnabledZones={enabledZones}
        onConfirm={(next) => {
          setShowZonesDialog(false);
          onSetEnabledZones(next);
          onNotify(t("toast.enabledZonesUpdated"), ToastStatus.Success);
        }}
        onCancel={() => setShowZonesDialog(false)}
      />

      <PointRestoreModeDialog
        visible={showPointRestoreModeDialog}
        initialPointRestoreMode={pointRestoreMode}
        onConfirm={(mode) => {
          setShowPointRestoreModeDialog(false);
          onSetPointRestoreMode(mode);
          onNotify(
            t("toast.labeledValue", {
              label: t("menu.pointRestoreModeRow"),
              value: t(POINT_RESTORE_MODE_KEY[mode]),
            }),
            ToastStatus.Success,
          );
        }}
        onCancel={() => setShowPointRestoreModeDialog(false)}
      />

      <ThemeDialog
        visible={showThemeDialog}
        initialThemeMode={themeMode}
        onConfirm={(mode) => {
          setShowThemeDialog(false);
          onSetThemeMode(mode);
          onNotify(
            t("toast.labeledValue", {
              label: t("toast.themeUpdatedPrefix"),
              value: t(THEME_MODE_KEY[mode]),
            }),
            ToastStatus.Success,
          );
        }}
        onCancel={() => setShowThemeDialog(false)}
      />

      <LanguageDialog
        visible={showLanguageDialog}
        initialLanguageMode={languageMode}
        onConfirm={async (mode) => {
          setShowLanguageDialog(false);
          await onSetLanguageMode(mode);
          // react-i18next's t() is fixed to the language of the last render
          // (see useTranslation's getFixedT snapshot) — it won't reflect the
          // language switch above until BottomMenu re-renders. i18next.t()
          // itself reads the instance's current language dynamically, so it
          // reflects the switch immediately.
          onNotify(
            i18next.t("toast.labeledValue", {
              label: i18next.t("toast.languageUpdatedPrefix"),
              value: i18next.t(LANGUAGE_MODE_KEY[mode]),
            }),
            ToastStatus.Success,
          );
        }}
        onCancel={() => setShowLanguageDialog(false)}
      />

      <ExportOptionsDialog
        visible={showExportOptions}
        onConfirm={async (selection) => {
          setShowExportOptions(false);
          await onExport(selection);
          onNotify(t("toast.exportSuccess"), ToastStatus.Success);
        }}
        onCancel={() => setShowExportOptions(false)}
      />

      <ClearOptionsDialog
        visible={showClearOptions}
        onConfirm={(selection) => {
          setShowClearOptions(false);
          onClear(selection);
          if (selection.settings[ExportSettingKey.Language]) {
            onSetLanguageMode(LanguageMode.System);
          }
          if (selection.settings[ExportSettingKey.Theme]) {
            onSetThemeMode(ThemeMode.System);
          }
          onNotify(t("toast.clearSuccess"), ToastStatus.Success);
        }}
        onCancel={() => setShowClearOptions(false)}
      />

      <View
        style={[
          styles.bar,
          {
            backgroundColor: colors.background,
            borderTopColor: colors.divider,
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.btn, !canUndo && styles.btnDisabled]}
          onPress={() => {
            setShowHelp(false);
            setShowMenu(false);
            setShowSettings(false);
            setShowUndo(true);
          }}
          disabled={!canUndo}
          activeOpacity={0.6}
        >
          <UndoIcon disabled={!canUndo} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btn}
          onPress={() => {
            setShowHelp(false);
            setShowSettings(false);
            setShowMenu((v) => !v);
          }}
          activeOpacity={0.6}
        >
          <MenuIcon />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btn}
          onPress={() => {
            setShowMenu(false);
            setShowSettings(false);
            setShowHelp((v) => !v);
          }}
          activeOpacity={0.6}
        >
          <HelpIcon />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btn}
          onPress={() => {
            setShowHelp(false);
            setShowMenu(false);
            setShowSettings(false);
            onToggleInterfaceLocked();
          }}
          activeOpacity={0.6}
        >
          {interfaceLocked ? <LockClosedIcon /> : <LockOpenIcon />}
        </TouchableOpacity>
      </View>

      <ConfirmDialog
        visible={showUndo}
        title={t("menu.undoConfirm.title")}
        message={t("menu.undoConfirm.message")}
        confirmLabel={t("menu.undoConfirm.confirmLabel")}
        onConfirm={() => {
          setShowUndo(false);
          onUndo();
          onNotify(t("toast.undo"), ToastStatus.Success);
        }}
        onCancel={() => setShowUndo(false)}
      />

      <ImportOptionsDialog
        visible={pendingImport !== null}
        data={pendingImport ?? {}}
        onConfirm={(selection) => {
          if (pendingImport) {
            onApplyImport(buildImportData(pendingImport, selection));
            onNotify(t("toast.importSuccess"), ToastStatus.Success);
          }
          setPendingImport(null);
        }}
        onCancel={() => setPendingImport(null)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingBottom: 28,
    paddingTop: 4,
  },
  btn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  btnDisabled: {
    opacity: 0.35,
  },
});
