import { useState } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { ConfirmDialog } from "./common/ConfirmDialog";
import { HelpSheet } from "./HelpSheet";
import { MenuSheet, THEME_MODE_LABEL } from "./MenuSheet";
import { AutoLockDialog } from "./AutoLockDialog";
import { DaysToWhiteDialog } from "./DaysToWhiteDialog";
import { ThemeDialog } from "./ThemeDialog";
import { ExportOptionsDialog } from "./ExportOptionsDialog";
import { ImportOptionsDialog } from "./ImportOptionsDialog";
import { UndoIcon } from "./icons/UndoIcon";
import { HelpIcon } from "./icons/HelpIcon";
import { LockClosedIcon } from "./icons/LockClosedIcon";
import { LockOpenIcon } from "./icons/LockOpenIcon";
import { MenuIcon } from "./icons/MenuIcon";
import {
  AutoLockDialogMode,
  ExportedAppData,
  ExportSelection,
  ExportSettingKey,
  ThemeMode,
  ToastStatus,
} from "../types";
import { ImportResult, ImportResultType } from "../storage/storage";
import { useTheme } from "../theme/ThemeContext";
import {
  AUTO_LOCK_DISABLED_TOAST_MESSAGE,
  AUTO_LOCK_ENABLED_TOAST_MESSAGE,
  AUTO_LOCK_UPDATED_TOAST_MESSAGE,
  CANCEL_LABEL,
  CLEAR_ALL_TOAST_MESSAGE,
  CLEAR_LABEL,
  DAYS_TO_WHITE_ROW_LABEL,
  EXPORT_SUCCESS_TOAST_MESSAGE,
  IMPORT_FAILURE_TOAST_MESSAGE,
  IMPORT_SUCCESS_TOAST_MESSAGE,
  MIRROR_DISABLED_TOAST_MESSAGE,
  MIRROR_ENABLED_TOAST_MESSAGE,
  THEME_UPDATED_TOAST_MESSAGE_PREFIX,
  UNDO_TOAST_MESSAGE,
} from "../constants";

// Narrows a parsed import file down to just the categories the user kept
// checked in ImportOptionsDialog, mirroring useAppStore's exportData filter
// on the way out.
function buildImportData(
  data: ExportedAppData,
  selection: ExportSelection,
): ExportedAppData {
  const filtered: ExportedAppData = {};
  if (selection.marks) {
    filtered.buttonStates = data.buttonStates;
    filtered.events = data.events;
  }
  if (selection.settings[ExportSettingKey.Mirrored]) {
    filtered.mirrored = data.mirrored;
  }
  if (selection.settings[ExportSettingKey.AutoLock]) {
    filtered.autoLockEnabled = data.autoLockEnabled;
    filtered.autoLockAfterMarkSeconds = data.autoLockAfterMarkSeconds;
    filtered.autoLockAfterUnlockSeconds = data.autoLockAfterUnlockSeconds;
  }
  if (selection.settings[ExportSettingKey.DaysToWhite]) {
    filtered.daysToWhite = data.daysToWhite;
  }
  if (selection.settings[ExportSettingKey.Theme]) {
    filtered.themeMode = data.themeMode;
  }
  return filtered;
}

interface Props {
  canUndo: boolean;
  onUndo: () => void;
  onClear: () => void;
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
  themeMode: ThemeMode;
  onSetThemeMode: (mode: ThemeMode) => void;
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
  themeMode,
  onSetThemeMode,
  onExport,
  onPickImportFile,
  onApplyImport,
  onNotify,
}: Props) {
  const { colors } = useTheme();
  const [showUndo, setShowUndo] = useState(false);
  const [showClear, setShowClear] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [autoLockDialogIntent, setAutoLockDialogIntent] =
    useState<AutoLockDialogMode | null>(null);
  const [showDaysToWhiteDialog, setShowDaysToWhiteDialog] = useState(false);
  const [showThemeDialog, setShowThemeDialog] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [pendingImport, setPendingImport] = useState<ExportedAppData | null>(
    null,
  );

  const handleToggleAutoLock = (value: boolean) => {
    if (value) {
      setShowMenu(false);
      setAutoLockDialogIntent(AutoLockDialogMode.Enable);
    } else {
      onDisableAutoLock();
      onNotify(AUTO_LOCK_DISABLED_TOAST_MESSAGE, ToastStatus.Success);
    }
  };

  const handleEditAutoLockSettings = () => {
    setShowMenu(false);
    setAutoLockDialogIntent(AutoLockDialogMode.Edit);
  };

  const handleEditDaysToWhite = () => {
    setShowMenu(false);
    setShowDaysToWhiteDialog(true);
  };

  const handleEditTheme = () => {
    setShowMenu(false);
    setShowThemeDialog(true);
  };

  const handleImport = async () => {
    setShowMenu(false);
    const result = await onPickImportFile();
    if (result.type === ImportResultType.Cancelled) return;
    if (result.type === ImportResultType.Invalid) {
      onNotify(IMPORT_FAILURE_TOAST_MESSAGE, ToastStatus.Error);
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
      />
      <MenuSheet
        visible={showMenu}
        onClose={() => setShowMenu(false)}
        mirrored={mirrored}
        onToggleMirrored={(value) => {
          onToggleMirrored(value);
          onNotify(
            value ? MIRROR_ENABLED_TOAST_MESSAGE : MIRROR_DISABLED_TOAST_MESSAGE,
            ToastStatus.Success,
          );
        }}
        autoLockEnabled={autoLockEnabled}
        autoLockAfterMarkSeconds={autoLockAfterMarkSeconds}
        autoLockAfterUnlockSeconds={autoLockAfterUnlockSeconds}
        onToggleAutoLocked={handleToggleAutoLock}
        onEditAutoLockSettings={handleEditAutoLockSettings}
        daysToWhite={daysToWhite}
        onEditDaysToWhite={handleEditDaysToWhite}
        themeMode={themeMode}
        onEditTheme={handleEditTheme}
        onImport={handleImport}
        onExport={() => {
          setShowMenu(false);
          setShowExportOptions(true);
        }}
        onClear={() => {
          setShowMenu(false);
          setShowClear(true);
        }}
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
            onNotify(AUTO_LOCK_ENABLED_TOAST_MESSAGE, ToastStatus.Success);
          } else {
            onUpdateAutoLockTimes(afterMarkSeconds, afterUnlockSeconds);
            onNotify(AUTO_LOCK_UPDATED_TOAST_MESSAGE, ToastStatus.Success);
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
          onNotify(`${DAYS_TO_WHITE_ROW_LABEL}: ${days}`, ToastStatus.Success);
        }}
        onCancel={() => setShowDaysToWhiteDialog(false)}
      />

      <ThemeDialog
        visible={showThemeDialog}
        initialThemeMode={themeMode}
        onConfirm={(mode) => {
          setShowThemeDialog(false);
          onSetThemeMode(mode);
          onNotify(
            `${THEME_UPDATED_TOAST_MESSAGE_PREFIX}: ${THEME_MODE_LABEL[mode]}`,
            ToastStatus.Success,
          );
        }}
        onCancel={() => setShowThemeDialog(false)}
      />

      <ExportOptionsDialog
        visible={showExportOptions}
        onConfirm={async (selection) => {
          setShowExportOptions(false);
          await onExport(selection);
          onNotify(EXPORT_SUCCESS_TOAST_MESSAGE, ToastStatus.Success);
        }}
        onCancel={() => setShowExportOptions(false)}
      />

      <View
        style={[styles.bar, { backgroundColor: colors.background, borderTopColor: colors.divider }]}
      >
        <TouchableOpacity
          style={[styles.btn, !canUndo && styles.btnDisabled]}
          onPress={() => {
            setShowHelp(false);
            setShowMenu(false);
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
            onToggleInterfaceLocked();
          }}
          activeOpacity={0.6}
        >
          {interfaceLocked ? <LockClosedIcon /> : <LockOpenIcon />}
        </TouchableOpacity>
      </View>

      <ConfirmDialog
        visible={showUndo}
        title="Отменить последний укол?"
        message="Последняя зафиксированная инъекция будет удалена. Это действие нельзя отменить повторно."
        confirmLabel="Отменить укол"
        onConfirm={() => {
          setShowUndo(false);
          onUndo();
          onNotify(UNDO_TOAST_MESSAGE, ToastStatus.Success);
        }}
        onCancel={() => setShowUndo(false)}
      />

      <ConfirmDialog
        visible={showClear}
        title="Очистить все данные?"
        message="Вся история инъекций будет удалена. Все точки станут белыми. Это действие нельзя отменить."
        confirmLabel={CLEAR_LABEL}
        cancelLabel={CANCEL_LABEL}
        onConfirm={() => {
          setShowClear(false);
          onClear();
          onNotify(CLEAR_ALL_TOAST_MESSAGE, ToastStatus.Success);
        }}
        onCancel={() => setShowClear(false)}
        destructive
      />

      <ImportOptionsDialog
        visible={pendingImport !== null}
        data={pendingImport ?? {}}
        onConfirm={(selection) => {
          if (pendingImport) {
            onApplyImport(buildImportData(pendingImport, selection));
            onNotify(IMPORT_SUCCESS_TOAST_MESSAGE, ToastStatus.Success);
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
