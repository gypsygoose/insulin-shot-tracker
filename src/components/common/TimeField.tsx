import { View, Text, StyleSheet, Platform } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { MUTED_TEXT_COLOR, PRIMARY_TEXT_COLOR } from "../../constants";

const MINUTE_OPTIONS = Array.from({ length: 100 }, (_, i) => i);
const SECOND_OPTIONS = Array.from({ length: 60 }, (_, i) => i);
const PICKER_ITEM_COLOR =
  Platform.OS === "android" ? PRIMARY_TEXT_COLOR : undefined;

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
