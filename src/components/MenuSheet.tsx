import { Text, TouchableOpacity, View, Switch, StyleSheet } from "react-native";
import { BottomSheet } from "./common/BottomSheet";
import {
  AFTER_MARK_LABEL,
  AFTER_UNLOCK_LABEL,
  AUTO_LOCK_ROW_LABEL,
  CLEAR_LABEL,
  DESTRUCTIVE_COLOR,
  EXPORT_ROW_LABEL,
  IMPORT_ROW_LABEL,
  MENU_SHEET_TITLE,
  MIRROR_ROW_LABEL,
  MUTED_TEXT_COLOR,
  PRIMARY_TEXT_COLOR,
  SWITCH_THUMB_COLOR,
  SWITCH_TRACK_ON_COLOR,
  SWITCH_TRACK_OFF_COLOR,
} from "../constants";
import { pad2, splitSeconds } from "../format";

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
  const { minutes, seconds } = splitSeconds(totalSeconds);
  return `${minutes}:${pad2(seconds)}`;
}

export function MenuSheet({
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
    <BottomSheet visible={visible} onClose={onClose} title={MENU_SHEET_TITLE}>
      <View style={styles.row}>
        <Text style={styles.rowLabel}>{MIRROR_ROW_LABEL}</Text>
        <Switch
          value={mirrored}
          onValueChange={onToggleMirrored}
          trackColor={{ false: SWITCH_TRACK_OFF_COLOR, true: SWITCH_TRACK_ON_COLOR }}
          thumbColor={SWITCH_THUMB_COLOR}
        />
      </View>

      <View style={styles.row}>
        <TouchableOpacity
          style={styles.autoLockInfo}
          onPress={onEditAutoLockSettings}
          activeOpacity={0.7}
        >
          <Text style={styles.rowLabel}>{AUTO_LOCK_ROW_LABEL}</Text>
          <Text style={styles.rowDescription}>
            {AFTER_MARK_LABEL} — {formatDuration(autoLockAfterMarkSeconds)}
          </Text>
          <Text style={styles.rowDescription}>
            {AFTER_UNLOCK_LABEL} — {formatDuration(autoLockAfterUnlockSeconds)}
          </Text>
        </TouchableOpacity>
        <Switch
          value={autoLockEnabled}
          onValueChange={onToggleAutoLocked}
          trackColor={{ false: SWITCH_TRACK_OFF_COLOR, true: SWITCH_TRACK_ON_COLOR }}
          thumbColor={SWITCH_THUMB_COLOR}
        />
      </View>

      <TouchableOpacity
        style={styles.row}
        onPress={onExport}
        activeOpacity={0.7}
      >
        <Text style={styles.rowLabel}>{EXPORT_ROW_LABEL}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.row}
        onPress={onImport}
        activeOpacity={0.7}
      >
        <Text style={styles.rowLabel}>{IMPORT_ROW_LABEL}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.row}
        onPress={onClear}
        activeOpacity={0.7}
      >
        <Text style={[styles.rowLabel, styles.destructiveLabel]}>{CLEAR_LABEL}</Text>
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
    color: PRIMARY_TEXT_COLOR,
  },
  destructiveLabel: {
    color: DESTRUCTIVE_COLOR,
  },
  autoLockInfo: {
    flex: 1,
    paddingRight: 12,
  },
  rowDescription: {
    fontSize: 13,
    color: MUTED_TEXT_COLOR,
    marginTop: 4,
  },
});
