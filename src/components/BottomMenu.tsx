import { useState } from "react";
import { View, TouchableOpacity, StyleSheet, Alert } from "react-native";
import Svg, { Path, Rect } from "react-native-svg";
import ConfirmDialog from "./ConfirmDialog";
import HelpSheet from "./HelpSheet";
import MenuSheet from "./MenuSheet";
import { ExportedAppData } from "../types";
import { ImportResult } from "../storage/storage";
import { DISABLED_ICON_COLOR, ICON_COLOR } from "../constants";

interface Props {
  canUndo: boolean;
  onUndo: () => void;
  onClear: () => void;
  mirrored: boolean;
  onToggleMirrored: (value: boolean) => void;
  interfaceLocked: boolean;
  onToggleInterfaceLocked: () => void;
  onExport: () => Promise<void>;
  onPickImportFile: () => Promise<ImportResult>;
  onApplyImport: (data: ExportedAppData) => void;
}

// Icon components matching Figma icon shapes (node-id 26-3, file grYg39698ogy0nEBd88Fup)

function UndoIcon({ disabled }: { disabled: boolean }) {
  const c = disabled ? DISABLED_ICON_COLOR : ICON_COLOR;
  return (
    <Svg width={22} height={22} viewBox="-0.5 -2 24 24" fill="none">
      <Path
        d="M5.308 7.612l1.352-.923a.981.981 0 0 1 1.372.27 1.008 1.008 0 0 1-.266 1.388l-3.277 2.237a.981.981 0 0 1-1.372-.27L.907 6.998a1.007 1.007 0 0 1 .266-1.389.981.981 0 0 1 1.372.27l.839 1.259C4.6 3.01 8.38 0 12.855 0c5.458 0 9.882 4.477 9.882 10s-4.424 10-9.882 10a.994.994 0 0 1-.988-1c0-.552.443-1 .988-1 4.366 0 7.906-3.582 7.906-8s-3.54-8-7.906-8C9.311 2 6.312 4.36 5.308 7.612z"
        fill={c}
      />
    </Svg>
  );
}

function HelpIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 22 22" fill="none">
      <Path
        d="M11 20.1667C16.0626 20.1667 20.1667 16.0626 20.1667 11C20.1667 5.93743 16.0626 1.83333 11 1.83333C5.93743 1.83333 1.83333 5.93743 1.83333 11C1.83333 16.0626 5.93743 20.1667 11 20.1667Z"
        stroke={ICON_COLOR}
        strokeWidth={1.83333}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M8.33333 8.25C8.58983 7.52014 9.09572 6.90371 9.76109 6.51461C10.4265 6.1255 11.2084 5.98882 11.9655 6.12882C12.7226 6.26883 13.4067 6.6766 13.8918 7.27834C14.377 7.88008 14.6318 8.63615 14.6115 9.41077C14.6115 11.5 11.4583 12.5417 11.4583 12.5417"
        stroke={ICON_COLOR}
        strokeWidth={1.83333}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M11 16.0417V16.0521"
        stroke={ICON_COLOR}
        strokeWidth={1.83333}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function LockClosedIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 36 36" fill={ICON_COLOR}>
      <Path
        d="M18.09,20.59A2.41,2.41,0,0,0,17,25.14V28h2V25.23a2.41,2.41,0,0,0-.91-4.64Z"
        stroke={ICON_COLOR}
        strokeWidth={1}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M26,15V10.72a8.2,8.2,0,0,0-8-8.36,8.2,8.2,0,0,0-8,8.36V15H7V32a2,2,0,0,0,2,2H27a2,2,0,0,0,2-2V15ZM12,10.72a6.2,6.2,0,0,1,6-6.36,6.2,6.2,0,0,1,6,6.36V15H12ZM9,32V17H27V32Z"
        stroke={ICON_COLOR}
        strokeWidth={1}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Rect x="0" y="0" width="36" height="36" fillOpacity="0" />
    </Svg>
  );
}

function LockOpenIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 36 36" fill={ICON_COLOR}>
      <Path
        d="M12,25.14V28h2V25.23a2.42,2.42,0,1,0-2-.09Z"
        stroke={ICON_COLOR}
        strokeWidth={1}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M26,2a8.2,8.2,0,0,0-8,8.36V15H2V32a2,2,0,0,0,2,2H22a2,2,0,0,0,2-2V15H20V10.36A6.2,6.2,0,0,1,26,4a6.2,6.2,0,0,1,6,6.36v6.83a1,1,0,0,0,2,0V10.36A8.2,8.2,0,0,0,26,2ZM22,17V32H4V17Z"
        stroke={ICON_COLOR}
        strokeWidth={1}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Rect x="0" y="0" width="36" height="36" fillOpacity="0" />
    </Svg>
  );
}

function MenuIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 22 22" fill="none">
      <Path
        d="M8.25 2.75H3.66667C3.16041 2.75 2.75 3.16041 2.75 3.66667V8.25C2.75 8.75626 3.16041 9.16667 3.66667 9.16667H8.25C8.75626 9.16667 9.16667 8.75626 9.16667 8.25V3.66667C9.16667 3.16041 8.75626 2.75 8.25 2.75Z"
        stroke={ICON_COLOR}
        strokeWidth={1.83333}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M8.25 12.8333H3.66667C3.16041 12.8333 2.75 13.2437 2.75 13.75V18.3333C2.75 18.8396 3.16041 19.25 3.66667 19.25H8.25C8.75626 19.25 9.16667 18.8396 9.16667 18.3333V13.75C9.16667 13.2437 8.75626 12.8333 8.25 12.8333Z"
        stroke={ICON_COLOR}
        strokeWidth={1.83333}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12.8333 3.66667H19.25"
        stroke={ICON_COLOR}
        strokeWidth={1.83333}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12.8333 8.25H19.25"
        stroke={ICON_COLOR}
        strokeWidth={1.83333}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12.8333 13.75H19.25"
        stroke={ICON_COLOR}
        strokeWidth={1.83333}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12.8333 18.3333H19.25"
        stroke={ICON_COLOR}
        strokeWidth={1.83333}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default function BottomMenu({
  canUndo,
  onUndo,
  onClear,
  mirrored,
  onToggleMirrored,
  interfaceLocked,
  onToggleInterfaceLocked,
  onExport,
  onPickImportFile,
  onApplyImport,
}: Props) {
  const [showUndo, setShowUndo] = useState(false);
  const [showClear, setShowClear] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [pendingImport, setPendingImport] = useState<ExportedAppData | null>(
    null,
  );

  const handleImport = async () => {
    setShowMenu(false);
    const result = await onPickImportFile();
    if (result.kind === "cancelled") return;
    if (result.kind === "invalid") {
      Alert.alert(
        "Не удалось импортировать",
        "Выбранный файл повреждён или имеет неверный формат.",
      );
      return;
    }
    setPendingImport(result.data);
  };

  return (
    <>
      {/* Rendered before the bar so the bar paints on top and stays
          visible/tappable while the help/menu sheet is open. */}
      <HelpSheet visible={showHelp} onClose={() => setShowHelp(false)} />
      <MenuSheet
        visible={showMenu}
        onClose={() => setShowMenu(false)}
        mirrored={mirrored}
        onToggleMirrored={onToggleMirrored}
        onImport={handleImport}
        onExport={() => {
          setShowMenu(false);
          onExport();
        }}
        onClear={() => {
          setShowMenu(false);
          setShowClear(true);
        }}
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
        }}
        onCancel={() => setShowUndo(false)}
      />

      <ConfirmDialog
        visible={showClear}
        title="Очистить все данные?"
        message="Вся история инъекций будет удалена. Все точки станут белыми. Это действие нельзя отменить."
        confirmLabel="Очистить"
        cancelLabel="Отмена"
        onConfirm={() => {
          setShowClear(false);
          onClear();
        }}
        onCancel={() => setShowClear(false)}
        destructive
      />

      <ConfirmDialog
        visible={pendingImport !== null}
        title="Импортировать данные?"
        message="Все текущие данные будут стёрты и заменены данными из файла. Это действие нельзя отменить."
        confirmLabel="Импортировать"
        cancelLabel="Отмена"
        onConfirm={() => {
          if (pendingImport) onApplyImport(pendingImport);
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
    backgroundColor: "#080C18",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255,255,255,0.08)",
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
