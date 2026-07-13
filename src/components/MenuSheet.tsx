import { Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { BottomSheet } from "./common";
import { useTheme } from "../theme";

interface Props {
  visible: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
  onExport: () => void;
  onImport: () => void;
  onClear: () => void;
}

export function MenuSheet({
  visible,
  onClose,
  onOpenSettings,
  onExport,
  onImport,
  onClear,
}: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <BottomSheet visible={visible} onClose={onClose} title={t("menu.title")}>
      <TouchableOpacity
        style={styles.row}
        onPress={onOpenSettings}
        activeOpacity={0.7}
      >
        <Text style={[styles.rowLabel, { color: colors.primaryText }]}>
          {t("menu.settingsRow")}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.row} onPress={onExport} activeOpacity={0.7}>
        <Text style={[styles.rowLabel, { color: colors.primaryText }]}>
          {t("menu.exportRow")}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.row} onPress={onImport} activeOpacity={0.7}>
        <Text style={[styles.rowLabel, { color: colors.primaryText }]}>
          {t("menu.importRow")}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.row} onPress={onClear} activeOpacity={0.7}>
        <Text style={[styles.rowLabel, { color: colors.destructive }]}>
          {t("common.clear")}
        </Text>
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
  },
});
