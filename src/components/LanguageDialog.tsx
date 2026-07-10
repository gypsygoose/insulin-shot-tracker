import { useEffect, useState } from "react";
import { Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { Dialog } from "./common/Dialog";
import { useTheme } from "../theme/ThemeContext";
import { LanguageMode } from "../types";
import { LANGUAGE_MODE_KEY } from "./MenuSheet";

const LANGUAGE_MODE_OPTIONS: LanguageMode[] = [
  LanguageMode.System,
  LanguageMode.English,
  LanguageMode.Russian,
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
      <View style={styles.options}>
        {LANGUAGE_MODE_OPTIONS.map((option) => {
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
                {t(LANGUAGE_MODE_KEY[option])}
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
