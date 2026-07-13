import { useEffect, useState } from "react";
import { Platform, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useTranslation } from "react-i18next";
import { Dialog } from "./common";
import { useTheme } from "../theme";
import { LanguageMode } from "../types";
import { LANGUAGE_MODE_KEY } from "./SettingsSheet";

const LANGUAGE_MODE_OPTIONS: LanguageMode[] = [
  LanguageMode.System,
  LanguageMode.English,
  LanguageMode.Russian,
  LanguageMode.German,
  LanguageMode.Spanish,
  LanguageMode.French,
  LanguageMode.Turkish,
  LanguageMode.Portuguese,
];

interface Props {
  visible: boolean;
  initialLanguageMode: LanguageMode;
  onConfirm: (mode: LanguageMode) => void;
  onCancel: () => void;
}

export function LanguageDialog({
  visible,
  initialLanguageMode,
  onConfirm,
  onCancel,
}: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [mode, setMode] = useState(initialLanguageMode);
  const pickerItemColor = Platform.OS === "android" ? colors.primaryText : undefined;

  useEffect(() => {
    if (!visible) return;
    setMode(initialLanguageMode);
  }, [visible, initialLanguageMode]);

  return (
    <Dialog
      visible={visible}
      title={t("menu.languageRow")}
      message={t("menu.languageDialog.message")}
      confirmLabel={t("common.save")}
      onConfirm={() => onConfirm(mode)}
      onCancel={onCancel}
    >
      <Picker
        style={[styles.picker, { color: colors.primaryText }]}
        itemStyle={[styles.pickerItem, { color: colors.primaryText }]}
        selectedValue={mode}
        onValueChange={(value) => setMode(value as LanguageMode)}
        dropdownIconColor={colors.primaryText}
      >
        {LANGUAGE_MODE_OPTIONS.map((option) => (
          <Picker.Item
            key={option}
            label={t(LANGUAGE_MODE_KEY[option])}
            value={option}
            color={pickerItemColor}
          />
        ))}
      </Picker>
    </Dialog>
  );
}

const styles = StyleSheet.create({
  picker: {
    width: "100%",
  },
  pickerItem: {
    fontSize: 18,
    height: 120,
  },
});
