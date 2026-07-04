import { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";

interface Props {
  visible: boolean;
  mode: "enable" | "edit";
  initialAfterMarkSeconds: number;
  initialAfterUnlockSeconds: number;
  onConfirm: (afterMarkSeconds: number, afterUnlockSeconds: number) => void;
  onCancel: () => void;
}

const CONFIRM_LABELS: Record<Props["mode"], string> = {
  enable: "Включить",
  edit: "Сохранить",
};

const MINUTE_OPTIONS = Array.from({ length: 100 }, (_, i) => i);
const SECOND_OPTIONS = Array.from({ length: 60 }, (_, i) => i);
const PICKER_ITEM_COLOR = Platform.OS === "android" ? "#FFFFFF" : undefined;
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
          dropdownIconColor="#FFFFFF"
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
          dropdownIconColor="#FFFFFF"
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

export default function AutoLockDialog({
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
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.box}>
          <Text style={styles.title}>Автоблокировка интерфейса</Text>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.message}>
              Вы можете включить автоматическую блокировку интерфейса, чтобы
              избежать случайного нажатия на точку укола. Блокировка сработает
              через заданное время после нажатия на точку или после простоя в
              разблокированном режиме. Разблокировать интерфейс можно будет
              нажав на соответствующую кнопку в нижнем меню.
            </Text>

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
          </ScrollView>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onCancel}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelLabel}>Отмена</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={handleConfirm}
              activeOpacity={0.8}
            >
              <Text style={styles.confirmLabel}>{confirmLabel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  box: {
    backgroundColor: "#141824",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 360,
    maxHeight: "80%",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.1)",
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  scroll: {
    flexShrink: 1,
  },
  scrollContent: {
    paddingBottom: 4,
  },
  message: {
    fontSize: 14,
    color: "rgba(255,255,255,0.6)",
    lineHeight: 21,
    marginBottom: 20,
  },
  field: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255,255,255,0.5)",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  pickerRow: {
    flexDirection: "row",
  },
  picker: {
    flex: 1,
    color: "#FFFFFF",
  },
  pickerItem: {
    color: "#FFFFFF",
    fontSize: 18,
    height: 120,
  },
  actions: {
    marginTop: 8,
    flexDirection: "row",
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    paddingVertical: 12,
    alignItems: "center",
  },
  cancelLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "rgba(255,255,255,0.7)",
  },
  confirmBtn: {
    flex: 1,
    borderRadius: 10,
    backgroundColor: "#2563EB",
    paddingVertical: 12,
    alignItems: "center",
  },
  confirmLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
