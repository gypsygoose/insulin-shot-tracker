import { useEffect, useState } from "react";
import { View, StyleSheet, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useTranslation } from "react-i18next";
import { Dialog } from "./common/Dialog";

interface Props {
  visible: boolean;
  minDate?: number;
  onConfirm: (timestamp: number) => void;
  onCancel: () => void;
}

export function MarkDialog({ visible, minDate, onConfirm, onCancel }: Props) {
  const { t } = useTranslation();
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
      title={t("markDialog.title")}
      message={t("markDialog.message")}
      confirmLabel={t("common.mark")}
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
              setDate(selected);
            }
          }}
          minimumDate={minDate !== undefined ? new Date(minDate) : undefined}
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
