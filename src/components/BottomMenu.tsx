import { useState } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { ConfirmDialog } from "./common/ConfirmDialog";
import { HelpSheet } from "./HelpSheet";
import { MenuSheet } from "./MenuSheet";
import { AutoLockDialog } from "./AutoLockDialog";
import { DaysToWhiteDialog } from "./DaysToWhiteDialog";
import { UndoIcon } from "./icons/UndoIcon";
import { HelpIcon } from "./icons/HelpIcon";
import { LockClosedIcon } from "./icons/LockClosedIcon";
import { LockOpenIcon } from "./icons/LockOpenIcon";
import { MenuIcon } from "./icons/MenuIcon";
import { AutoLockDialogMode, ExportedAppData, ToastStatus } from "../types";
import { ImportResult, ImportResultType } from "../storage/storage";
import {
  AUTO_LOCK_DISABLED_TOAST_MESSAGE,
  AUTO_LOCK_ENABLED_TOAST_MESSAGE,
  AUTO_LOCK_UPDATED_TOAST_MESSAGE,
  BACKGROUND_COLOR,
  CANCEL_LABEL,
  CLEAR_ALL_TOAST_MESSAGE,
  CLEAR_LABEL,
  DAYS_TO_WHITE_ROW_LABEL,
  DIVIDER_COLOR,
  EXPORT_SUCCESS_TOAST_MESSAGE,
  IMPORT_FAILURE_TOAST_MESSAGE,
  IMPORT_SUCCESS_TOAST_MESSAGE,
  MIRROR_DISABLED_TOAST_MESSAGE,
  MIRROR_ENABLED_TOAST_MESSAGE,
  UNDO_TOAST_MESSAGE,
} from "../constants";

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
  onExport: () => Promise<void>;
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
  onExport,
  onPickImportFile,
  onApplyImport,
  onNotify,
}: Props) {
  const [showUndo, setShowUndo] = useState(false);
  const [showClear, setShowClear] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [autoLockDialogIntent, setAutoLockDialogIntent] =
    useState<AutoLockDialogMode | null>(null);
  const [showDaysToWhiteDialog, setShowDaysToWhiteDialog] = useState(false);
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
        onImport={handleImport}
        onExport={async () => {
          setShowMenu(false);
          await onExport();
          onNotify(EXPORT_SUCCESS_TOAST_MESSAGE, ToastStatus.Success);
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

      <View style={styles.bar}>
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

      <ConfirmDialog
        visible={pendingImport !== null}
        title="Импортировать данные?"
        message="Все текущие данные будут стёрты и заменены данными из файла. Это действие нельзя отменить."
        confirmLabel="Импортировать"
        cancelLabel={CANCEL_LABEL}
        onConfirm={() => {
          if (pendingImport) {
            onApplyImport(pendingImport);
            onNotify(IMPORT_SUCCESS_TOAST_MESSAGE, ToastStatus.Success);
          }
          setPendingImport(null);
        }}
        onCancel={() => setPendingImport(null)}
        destructive
      />
    </>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    backgroundColor: BACKGROUND_COLOR,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: DIVIDER_COLOR,
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
