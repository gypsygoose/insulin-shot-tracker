import { View, Text, StyleSheet, Platform } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../theme";

const MINUTE_OPTIONS = Array.from({ length: 100 }, (_, i) => i);
const SECOND_OPTIONS = Array.from({ length: 60 }, (_, i) => i);

interface Props {
  label: string;
  minutes: number;
  seconds: number;
  onChangeMinutes: (value: number) => void;
  onChangeSeconds: (value: number) => void;
}

export function TimeField({
  label,
  minutes,
  seconds,
  onChangeMinutes,
  onChangeSeconds,
}: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const pickerItemColor = Platform.OS === "android" ? colors.primaryText : undefined;

  return (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, { color: colors.mutedText }]}>{label}</Text>
      <View style={styles.pickerRow}>
        <Picker
          style={[styles.picker, { color: colors.primaryText }]}
          itemStyle={[styles.pickerItem, { color: colors.primaryText }]}
          selectedValue={minutes}
          onValueChange={(value) => onChangeMinutes(Number(value))}
          dropdownIconColor={colors.primaryText}
        >
          {MINUTE_OPTIONS.map((m) => (
            <Picker.Item
              key={m}
              label={t("common.minutesAbbrev", { count: m })}
              value={m}
              color={pickerItemColor}
            />
          ))}
        </Picker>
        <Picker
          style={[styles.picker, { color: colors.primaryText }]}
          itemStyle={[styles.pickerItem, { color: colors.primaryText }]}
          selectedValue={seconds}
          onValueChange={(value) => onChangeSeconds(Number(value))}
          dropdownIconColor={colors.primaryText}
        >
          {SECOND_OPTIONS.map((s) => (
            <Picker.Item
              key={s}
              label={t("common.secondsAbbrev", { count: s })}
              value={s}
              color={pickerItemColor}
            />
          ))}
        </Picker>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  pickerRow: {
    flexDirection: "row",
  },
  picker: {
    flex: 1,
  },
  pickerItem: {
    fontSize: 18,
    height: 120,
  },
});
