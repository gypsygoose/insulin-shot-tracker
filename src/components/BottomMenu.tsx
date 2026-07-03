import { useState } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import Svg, { Path } from "react-native-svg";
import ConfirmDialog from "./ConfirmDialog";
import HelpSheet from "./HelpSheet";
import MenuSheet from "./MenuSheet";

interface Props {
  canUndo: boolean;
  onUndo: () => void;
  onClear: () => void;
  mirrored: boolean;
  onToggleMirrored: (value: boolean) => void;
}

// Icon components matching Figma icon shapes (node-id 26-3, file grYg39698ogy0nEBd88Fup)

function UndoIcon({ disabled }: { disabled: boolean }) {
  const c = disabled ? "#4A5568" : "#FFFFFF";
  return (
    <Svg width={22} height={22} viewBox="0 0 22 22" fill="none">
      <Path
        d="M8.25 12.8333L3.66667 8.25L8.25 3.66667"
        stroke={c}
        strokeWidth={1.83333}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M3.66667 8.25H13.2917C13.9537 8.25 14.6093 8.38041 15.221 8.63378C15.8327 8.88715 16.3885 9.25851 16.8567 9.72668C17.3248 10.1948 17.6962 10.7506 17.9495 11.3623C18.2029 11.974 18.3333 12.6296 18.3333 13.2917C18.3333 13.9538 18.2029 14.6093 17.9495 15.221C17.6962 15.8327 17.3248 16.3885 16.8567 16.8567C16.3885 17.3248 15.8327 17.6962 15.221 17.9496C14.6093 18.2029 13.9537 18.3333 13.2917 18.3333H10.0833"
        stroke={c}
        strokeWidth={1.83333}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

function HelpIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 22 22" fill="none">
      <Path
        d="M11 20.1667C16.0626 20.1667 20.1667 16.0626 20.1667 11C20.1667 5.93743 16.0626 1.83333 11 1.83333C5.93743 1.83333 1.83333 5.93743 1.83333 11C1.83333 16.0626 5.93743 20.1667 11 20.1667Z"
        stroke="#FFFFFF"
        strokeWidth={1.83333}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M8.33333 8.25C8.58983 7.52014 9.09572 6.90371 9.76109 6.51461C10.4265 6.1255 11.2084 5.98882 11.9655 6.12882C12.7226 6.26883 13.4067 6.6766 13.8918 7.27834C14.377 7.88008 14.6318 8.63615 14.6115 9.41077C14.6115 11.5 11.4583 12.5417 11.4583 12.5417"
        stroke="#FFFFFF"
        strokeWidth={1.83333}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M11 16.0417V16.0521"
        stroke="#FFFFFF"
        strokeWidth={1.83333}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function MenuIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 22 22" fill="none">
      <Path
        d="M2.75 5.5H19.25"
        stroke="#FFFFFF"
        strokeWidth={1.83333}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M2.75 11H19.25"
        stroke="#FFFFFF"
        strokeWidth={1.83333}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M2.75 16.5H19.25"
        stroke="#FFFFFF"
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
}: Props) {
  const [showUndo, setShowUndo] = useState(false);
  const [showClear, setShowClear] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

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
