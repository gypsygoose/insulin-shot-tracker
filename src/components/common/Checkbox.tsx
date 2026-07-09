import { Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { useTheme } from "../../theme/ThemeContext";

interface Props {
  label: string;
  checked: boolean;
  indeterminate?: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export function Checkbox({
  label,
  checked,
  indeterminate = false,
  onToggle,
  disabled = false,
}: Props) {
  const { colors } = useTheme();
  const active = checked || indeterminate;

  return (
    <View style={[styles.row, disabled && styles.rowDisabled]}>
      <TouchableOpacity
        style={[
          styles.box,
          { borderColor: active ? colors.primaryAction : colors.cardBorder },
          active && { backgroundColor: colors.primaryAction },
        ]}
        onPress={onToggle}
        activeOpacity={0.7}
        disabled={disabled}
      >
        {indeterminate ? (
          <View
            style={[styles.dash, { backgroundColor: colors.actionLabel }]}
          />
        ) : checked ? (
          <Text style={[styles.mark, { color: colors.actionLabel }]}>✓</Text>
        ) : null}
      </TouchableOpacity>

      <Text style={[styles.label, { color: colors.primaryText }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  rowDisabled: {
    opacity: 0.5,
  },
  box: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  mark: {
    fontSize: 14,
    fontWeight: "700",
  },
  dash: {
    width: 10,
    height: 2,
    borderRadius: 1,
  },
  label: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 12,
  },
});
