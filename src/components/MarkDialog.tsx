import { useEffect, useState } from "react";
import { View, StyleSheet, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Dialog } from "./Dialog";

interface Props {
  visible: boolean;
  onConfirm: (timestamp: number) => void;
  onCancel: () => void;
}

export function MarkDialog({ visible, onConfirm, onCancel }: Props) {
  const [date, setDate] = useState(() => new Date());
  // Bumped every time the dialog opens so the native pickers remount with
  // the fresh value — some platforms don't re-sync their internal display
  // when the `value` prop changes on an already-mounted picker.
  const [resetKey, setResetKey] = useState(0);

  useEffect(() => {
    if (visible) {
      setDate(new Date());
      setResetKey((k) => k + 1);
    }
  }, [visible]);

  const handleConfirm = () => {
    onConfirm(date.getTime());
  };

  return (
    <Dialog
      visible={visible}
      title="Отметить укол"
      message="Укажите дату и время, когда была сделана инъекция."
      confirmLabel="Отметить"
      onConfirm={handleConfirm}
      onCancel={onCancel}
    >
      <View style={styles.pickerWrap}>
        <DateTimePicker
          value={date}
          mode="datetime"
          display={Platform.OS === "ios" ? "compact" : "default"}
          onChange={(_, selected) => {
            if (selected) {
              const next = new Date(date);
              next.setFullYear(
                selected.getFullYear(),
                selected.getMonth(),
                selected.getDate(),
              );
              setDate(next);
            }
          }}
          maximumDate={new Date()}
          themeVariant="dark"
        />
      </View>
    </Dialog>
  );
}

const styles = StyleSheet.create({
  pickerWrap: {
    alignItems: "flex-start",
    marginBottom: 16,
  },
});
