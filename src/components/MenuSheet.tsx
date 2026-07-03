import { Text, TouchableOpacity, View, Switch, StyleSheet } from "react-native";
import BottomSheet from "./BottomSheet";

interface Props {
  visible: boolean;
  onClose: () => void;
  mirrored: boolean;
  onToggleMirrored: (value: boolean) => void;
  onClear: () => void;
}

export default function MenuSheet({
  visible,
  onClose,
  mirrored,
  onToggleMirrored,
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
});
