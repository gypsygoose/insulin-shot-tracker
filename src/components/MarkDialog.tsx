import { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

interface Props {
  visible: boolean;
  onConfirm: (timestamp: number) => void;
  onCancel: () => void;
}

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

function formatDate(d: Date): string {
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;
}

function formatTime(d: Date): string {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function MarkDialog({ visible, onConfirm, onCancel }: Props) {
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
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.box}>
          <Text style={styles.title}>Отметить укол</Text>
          <Text style={styles.message}>
            Укажите дату и время, когда была сделана инъекция.
          </Text>

          <View style={styles.pickerWrap}>
            <DateTimePicker
              key={`date-${resetKey}`}
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
              <Text style={styles.confirmLabel}>Отметить</Text>
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
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.1)",
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: "rgba(255,255,255,0.6)",
    lineHeight: 21,
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255,255,255,0.5)",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  pickerWrap: {
    alignItems: "flex-start",
    marginBottom: 16,
  },
  preview: {
    fontSize: 13,
    color: "rgba(255,255,255,0.5)",
    marginTop: -8,
    marginBottom: 16,
  },
  actions: {
    marginTop: 16,
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
