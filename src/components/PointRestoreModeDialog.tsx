import { useEffect, useState } from "react";
import { Platform, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useTranslation } from "react-i18next";
import { Dialog } from "./common";
import { useTheme } from "../theme";
import { PointRestoreMode } from "../types";
import { POINT_RESTORE_MODE_KEY } from "./SettingsSheet";

const POINT_RESTORE_MODE_OPTIONS: PointRestoreMode[] = [
  PointRestoreMode.Auto,
  PointRestoreMode.Manual,
];

interface Props {
  visible: boolean;
  initialPointRestoreMode: PointRestoreMode;
  onConfirm: (mode: PointRestoreMode) => void;
  onCancel: () => void;
}

export function PointRestoreModeDialog({
  visible,
  initialPointRestoreMode,
  onConfirm,
  onCancel,
}: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [mode, setMode] = useState(initialPointRestoreMode);
  const pickerItemColor = Platform.OS === "android" ? colors.primaryText : undefined;

  useEffect(() => {
    if (!visible) return;
    setMode(initialPointRestoreMode);
  }, [visible, initialPointRestoreMode]);

  return (
    <Dialog
      visible={visible}
      title={t("menu.pointRestoreModeRow")}
      message={t("menu.pointRestoreModeDialog.message")}
      confirmLabel={t("common.save")}
      onConfirm={() => onConfirm(mode)}
      onCancel={onCancel}
    >
      <Picker
        style={[styles.picker, { color: colors.primaryText }]}
        itemStyle={[styles.pickerItem, { color: colors.primaryText }]}
        selectedValue={mode}
        onValueChange={(value) => setMode(value as PointRestoreMode)}
        dropdownIconColor={colors.primaryText}
      >
        {POINT_RESTORE_MODE_OPTIONS.map((option) => (
          <Picker.Item
            key={option}
            label={t(POINT_RESTORE_MODE_KEY[option])}
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
