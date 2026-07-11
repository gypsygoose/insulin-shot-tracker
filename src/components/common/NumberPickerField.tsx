import { View, Text, StyleSheet, Platform } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useTheme } from "../../theme";

interface Props {
  label: string;
  value: number;
  options: number[];
  formatOption?: (value: number) => string;
  onChange: (value: number) => void;
}

export function NumberPickerField({
  label,
  value,
  options,
  formatOption = (value) => `${value}`,
  onChange,
}: Props) {
  const { colors } = useTheme();
  const pickerItemColor = Platform.OS === "android" ? colors.primaryText : undefined;

  return (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, { color: colors.mutedText }]}>{label}</Text>
      <Picker
        style={[styles.picker, { color: colors.primaryText }]}
        itemStyle={[styles.pickerItem, { color: colors.primaryText }]}
        selectedValue={value}
        onValueChange={(v) => onChange(Number(v))}
        dropdownIconColor={colors.primaryText}
      >
        {options.map((n) => (
          <Picker.Item
            key={n}
            label={formatOption(n)}
            value={n}
            color={pickerItemColor}
          />
        ))}
      </Picker>
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
  picker: {},
  pickerItem: {
    fontSize: 18,
    height: 120,
  },
});
