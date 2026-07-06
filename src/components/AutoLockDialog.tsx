import { useEffect, useState } from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { AutoLockDialogMode } from "../types";
import { Dialog } from "./Dialog";
import { MUTED_TEXT_COLOR, PRIMARY_TEXT_COLOR } from "../constants";

interface Props {
  visible: boolean;
  mode: AutoLockDialogMode;
  initialAfterMarkSeconds: number;
  initialAfterUnlockSeconds: number;
  onConfirm: (afterMarkSeconds: number, afterUnlockSeconds: number) => void;
  onCancel: () => void;
}

const CONFIRM_LABELS: Record<AutoLockDialogMode, string> = {
  [AutoLockDialogMode.Enable]: "Включить",
  [AutoLockDialogMode.Edit]: "Сохранить",
};

const MINUTE_OPTIONS = Array.from({ length: 100 }, (_, i) => i);
const SECOND_OPTIONS = Array.from({ length: 60 }, (_, i) => i);
const PICKER_ITEM_COLOR = Platform.OS === "android" ? PRIMARY_TEXT_COLOR : undefined;
const MIN_AFTER_UNLOCK_SECONDS = 5;

function splitSeconds(totalSeconds: number): {
  minutes: number;
  seconds: number;
} {
  return {
    minutes: Math.floor(totalSeconds / 60),
    seconds: totalSeconds % 60,
  };
}

function TimeField({
  label,
  minutes,
  seconds,
  onChangeMinutes,
  onChangeSeconds,
}: {
  label: string;
  minutes: number;
  seconds: number;
  onChangeMinutes: (value: number) => void;
  onChangeSeconds: (value: number) => void;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.pickerRow}>
        <Picker
          style={styles.picker}
          itemStyle={styles.pickerItem}
          selectedValue={minutes}
          onValueChange={(value) => onChangeMinutes(Number(value))}
          dropdownIconColor={PRIMARY_TEXT_COLOR}
        >
          {MINUTE_OPTIONS.map((m) => (
            <Picker.Item
              key={m}
              label={`${m} мин`}
              value={m}
              color={PICKER_ITEM_COLOR}
            />
          ))}
        </Picker>
        <Picker
          style={styles.picker}
          itemStyle={styles.pickerItem}
          selectedValue={seconds}
          onValueChange={(value) => onChangeSeconds(Number(value))}
          dropdownIconColor={PRIMARY_TEXT_COLOR}
        >
          {SECOND_OPTIONS.map((s) => (
            <Picker.Item
              key={s}
              label={`${s} сек`}
              value={s}
              color={PICKER_ITEM_COLOR}
            />
          ))}
        </Picker>
      </View>
    </View>
  );
}

export function AutoLockDialog({
  visible,
  mode,
  initialAfterMarkSeconds,
  initialAfterUnlockSeconds,
  onConfirm,
  onCancel,
}: Props) {
  const confirmLabel = CONFIRM_LABELS[mode];
  const [markMinutes, setMarkMinutes] = useState(0);
  const [markSeconds, setMarkSeconds] = useState(0);
  const [unlockMinutes, setUnlockMinutes] = useState(0);
  const [unlockSeconds, setUnlockSeconds] = useState(0);

  useEffect(() => {
    if (!visible) return;
    const mark = splitSeconds(initialAfterMarkSeconds);
    const unlock = splitSeconds(
      Math.max(MIN_AFTER_UNLOCK_SECONDS, initialAfterUnlockSeconds),
    );
    setMarkMinutes(mark.minutes);
    setMarkSeconds(mark.seconds);
    setUnlockMinutes(unlock.minutes);
    setUnlockSeconds(unlock.seconds);
  }, [visible, initialAfterMarkSeconds, initialAfterUnlockSeconds]);

  const handleChangeUnlockMinutes = (value: number) => {
    setUnlockMinutes(value);
    if (value === 0 && unlockSeconds < MIN_AFTER_UNLOCK_SECONDS) {
      setUnlockSeconds(MIN_AFTER_UNLOCK_SECONDS);
    }
  };

  const handleChangeUnlockSeconds = (value: number) => {
    setUnlockSeconds(
      unlockMinutes === 0 ? Math.max(MIN_AFTER_UNLOCK_SECONDS, value) : value,
    );
  };

  const handleConfirm = () => {
    onConfirm(
      markMinutes * 60 + markSeconds,
      Math.max(MIN_AFTER_UNLOCK_SECONDS, unlockMinutes * 60 + unlockSeconds),
    );
  };

  return (
    <Dialog
      visible={visible}
      title="Автоблокировка интерфейса"
      message="Вы можете включить автоматическую блокировку интерфейса, чтобы избежать случайного нажатия на точку укола. Блокировка сработает через заданное время после нажатия на точку или после простоя в разблокированном режиме. Разблокировать интерфейс можно будет нажав на соответствующую кнопку в нижнем меню."
      confirmLabel={confirmLabel}
      onConfirm={handleConfirm}
      onCancel={onCancel}
      scrollable
    >
      <TimeField
        label="После отметки"
        minutes={markMinutes}
        seconds={markSeconds}
        onChangeMinutes={setMarkMinutes}
        onChangeSeconds={setMarkSeconds}
      />
      <TimeField
        label="После разблокировки"
        minutes={unlockMinutes}
        seconds={unlockSeconds}
        onChangeMinutes={handleChangeUnlockMinutes}
        onChangeSeconds={handleChangeUnlockSeconds}
      />
    </Dialog>
  );
}

const styles = StyleSheet.create({
  field: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: MUTED_TEXT_COLOR,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  pickerRow: {
    flexDirection: "row",
  },
  picker: {
    flex: 1,
    color: PRIMARY_TEXT_COLOR,
  },
  pickerItem: {
    color: PRIMARY_TEXT_COLOR,
    fontSize: 18,
    height: 120,
  },
});
