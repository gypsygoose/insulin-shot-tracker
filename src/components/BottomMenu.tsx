import { useState } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import Svg, { Path } from "react-native-svg";
import ConfirmDialog from "./ConfirmDialog";
import LegendModal from "./LegendModal";

interface Props {
  canUndo: boolean;
  onUndo: () => void;
  onClear: () => void;
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

function LegendIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 22 22" fill="none">
      <Path
        d="M8.25 2.75H3.66667C3.16041 2.75 2.75 3.16043 2.75 3.66669V8.25002C2.75 8.75628 3.16041 9.16668 3.66667 9.16668H8.25C8.75626 9.16668 9.16667 8.75628 9.16667 8.25002V3.66669C9.16667 3.16043 8.75626 2.75 8.25 2.75Z"
        stroke="#FFFFFF"
        strokeWidth={1.83332}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M8.25 12.8333H3.66667C3.16041 12.8333 2.75 13.2437 2.75 13.75V18.3333C2.75 18.8396 3.16041 19.25 3.66667 19.25H8.25C8.75626 19.25 9.16667 18.8396 9.16667 18.3333V13.75C9.16667 13.2437 8.75626 12.8333 8.25 12.8333Z"
        stroke="#FFFFFF"
        strokeWidth={1.83332}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12.8333 3.66667H19.25"
        stroke="#FFFFFF"
        strokeWidth={1.83333}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12.8333 8.25H19.25"
        stroke="#FFFFFF"
        strokeWidth={1.83333}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12.8333 13.75H19.25"
        stroke="#FFFFFF"
        strokeWidth={1.83333}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12.8333 18.3333H19.25"
        stroke="#FFFFFF"
        strokeWidth={1.83333}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ClearIcon() {
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
        d="M17.4167 5.5V18.3333C17.4167 19.25 16.5 20.1667 15.5833 20.1667H6.41667C5.5 20.1667 4.58333 19.25 4.58333 18.3333V5.5"
        stroke="#FFFFFF"
        strokeWidth={1.83333}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M7.33333 5.5V3.66667C7.33333 2.75 8.25 1.83333 9.16667 1.83333H12.8333C13.75 1.83333 14.6667 2.75 14.6667 3.66667V5.5"
        stroke="#FFFFFF"
        strokeWidth={1.83333}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M9.16667 10.0833V15.5833"
        stroke="#FFFFFF"
        strokeWidth={1.83333}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12.8333 10.0833V15.5833"
        stroke="#FFFFFF"
        strokeWidth={1.83333}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default function BottomMenu({ canUndo, onUndo, onClear }: Props) {
  const [showUndo, setShowUndo] = useState(false);
  const [showClear, setShowClear] = useState(false);
  const [showLegend, setShowLegend] = useState(false);

  return (
    <>
      {/* Rendered before the bar so the bar paints on top and stays
          visible/tappable while the legend sheet is open. */}
      <LegendModal visible={showLegend} onClose={() => setShowLegend(false)} />

      <View style={styles.bar}>
        <TouchableOpacity
          style={[styles.btn, !canUndo && styles.btnDisabled]}
          onPress={() => {
            setShowLegend(false);
            setShowUndo(true);
          }}
          disabled={!canUndo}
          activeOpacity={0.6}
        >
          <UndoIcon disabled={!canUndo} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btn}
          onPress={() => setShowLegend((v) => !v)}
          activeOpacity={0.6}
        >
          <LegendIcon />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btn}
          onPress={() => {
            setShowLegend(false);
            setShowClear(true);
          }}
          activeOpacity={0.6}
        >
          <ClearIcon />
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
