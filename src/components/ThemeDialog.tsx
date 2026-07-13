import { useEffect, useState } from "react";
import { Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { Dialog } from "./common";
import { useTheme } from "../theme";
import { ThemeMode } from "../types";
import { THEME_MODE_KEY } from "./SettingsSheet";

const THEME_MODE_OPTIONS: ThemeMode[] = [
  ThemeMode.System,
  ThemeMode.Light,
  ThemeMode.Dark,
];

interface Props {
  visible: boolean;
  initialThemeMode: ThemeMode;
  onConfirm: (mode: ThemeMode) => void;
  onCancel: () => void;
}

export function ThemeDialog({
  visible,
  initialThemeMode,
  onConfirm,
  onCancel,
}: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [mode, setMode] = useState(initialThemeMode);

  useEffect(() => {
    if (!visible) return;
    setMode(initialThemeMode);
  }, [visible, initialThemeMode]);

  return (
    <Dialog
      visible={visible}
      title={t("menu.themeRow")}
      message={t("menu.themeDialog.message")}
      confirmLabel={t("common.save")}
      onConfirm={() => onConfirm(mode)}
      onCancel={onCancel}
    >
      <View style={styles.options}>
        {THEME_MODE_OPTIONS.map((option) => {
          const selected = option === mode;
          return (
            <TouchableOpacity
              key={option}
              style={[
                styles.option,
                { borderColor: colors.cardBorder },
                selected && {
                  borderColor: colors.primaryAction,
                  backgroundColor: `${colors.primaryAction}1A`,
                },
              ]}
              onPress={() => setMode(option)}
              activeOpacity={0.7}
            >
              <Text style={[styles.optionLabel, { color: colors.primaryText }]}>
                {t(THEME_MODE_KEY[option])}
              </Text>
              {selected ? (
                <Text
                  style={[styles.checkmark, { color: colors.primaryAction }]}
                >
                  ✓
                </Text>
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>
    </Dialog>
  );
}

const styles = StyleSheet.create({
  options: {
    gap: 10,
    marginBottom: 4,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: "600",
  },
  checkmark: {
    fontSize: 15,
    fontWeight: "700",
  },
});
