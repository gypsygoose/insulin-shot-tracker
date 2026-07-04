import { Text, TouchableOpacity, View, Switch, StyleSheet } from "react-native";
import BottomSheet from "./BottomSheet";

interface Props {
  visible: boolean;
  onClose: () => void;
  mirrored: boolean;
  onToggleMirrored: (value: boolean) => void;
  autoLockEnabled: boolean;
  autoLockAfterMarkSeconds: number;
  autoLockAfterUnlockSeconds: number;
  onToggleAutoLocked: (value: boolean) => void;
  onEditAutoLockSettings: () => void;
  onImport: () => void;
  onExport: () => void;
  onClear: () => void;
}

function formatDuration(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function MenuSheet({
  visible,
  onClose,
  mirrored,
  onToggleMirrored,
  autoLockEnabled,
  autoLockAfterMarkSeconds,
  autoLockAfterUnlockSeconds,
  onToggleAutoLocked,
  onEditAutoLockSettings,
  onImport,
  onExport,
  onClear,
}: Props) {
  return (
    <BottomSheet visible={visible} onClose={onClose} title="Меню">
      <View style={styles.row}>
        <Text style={styles.rowLabel}>Зеркальное отображение</Text>
        <Switch
          value={mirrored}
          onValueChange={onToggleMirrored}
          trackColor={{ false: "rgba(255,255,255,0.15)", true: "#16A34A" }}
          thumbColor="#FFFFFF"
        />
      </View>

      <View style={styles.row}>
        <TouchableOpacity
          style={styles.autoLockInfo}
          onPress={onEditAutoLockSettings}
          activeOpacity={0.7}
        >
          <Text style={styles.rowLabel}>Автоблокировка интерфейса</Text>
          <Text style={styles.rowDescription}>
            После отметки — {formatDuration(autoLockAfterMarkSeconds)}
          </Text>
          <Text style={styles.rowDescription}>
            После разблокировки — {formatDuration(autoLockAfterUnlockSeconds)}
          </Text>
        </TouchableOpacity>
        <Switch
          value={autoLockEnabled}
          onValueChange={onToggleAutoLocked}
          trackColor={{ false: "rgba(255,255,255,0.15)", true: "#16A34A" }}
          thumbColor="#FFFFFF"
        />
      </View>

      <TouchableOpacity
        style={styles.row}
        onPress={onExport}
        activeOpacity={0.7}
      >
        <Text style={styles.rowLabel}>Экспорт...</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.row}
        onPress={onImport}
        activeOpacity={0.7}
      >
        <Text style={styles.rowLabel}>Импорт...</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.row}
        onPress={onClear}
        activeOpacity={0.7}
      >
        <Text style={[styles.rowLabel, styles.destructiveLabel]}>Очистить</Text>
      </TouchableOpacity>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 4,
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  destructiveLabel: {
    color: "#DC2626",
  },
  autoLockInfo: {
    flex: 1,
    paddingRight: 12,
  },
  rowDescription: {
    fontSize: 13,
    color: "rgba(255,255,255,0.5)",
    marginTop: 4,
  },
});
