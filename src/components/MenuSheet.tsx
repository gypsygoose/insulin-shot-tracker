import { Text, TouchableOpacity, View, Switch, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { BottomSheet } from "./common/BottomSheet";
import { useTheme } from "../theme/ThemeContext";
import { LanguageMode, ThemeMode } from "../types";
import { pad2, splitSeconds } from "../format";
import type { TranslationKey } from "../i18n";

interface Props {
  visible: boolean;
  onClose: () => void;
  mirrored: boolean;
  onToggleMirrored: (value: boolean) => void;
  autoLockEnabled: boolean;
  autoLockAfterMarkSeconds: number;
  autoLockAfterUnlockSeconds: number;
  onToggleAutoLocked: (value: boolean) => void;
  onEditAutoLockSettings: () => void;
  daysToWhite: number;
  onEditDaysToWhite: () => void;
  themeMode: ThemeMode;
  onEditTheme: () => void;
  languageMode: LanguageMode;
  onEditLanguage: () => void;
  onImport: () => void;
  onExport: () => void;
  onClear: () => void;
}

// Shared with ThemeDialog.tsx, which offers the same three options — values
// are translation keys, not literal labels.
export const THEME_MODE_KEY: Record<ThemeMode, TranslationKey> = {
  [ThemeMode.Light]: "menu.themeDialog.light",
  [ThemeMode.Dark]: "menu.themeDialog.dark",
  [ThemeMode.System]: "menu.themeDialog.system",
};

// Shared with LanguageDialog.tsx, which offers the same three options.
export const LANGUAGE_MODE_KEY: Record<LanguageMode, TranslationKey> = {
  [LanguageMode.Russian]: "menu.languageDialog.russian",
  [LanguageMode.English]: "menu.languageDialog.english",
  [LanguageMode.System]: "menu.languageDialog.system",
};

function formatDuration(totalSeconds: number): string {
  const { minutes, seconds } = splitSeconds(totalSeconds);
  return `${minutes}:${pad2(seconds)}`;
}

export function MenuSheet({
  visible,
  onClose,
  mirrored,
  onToggleMirrored,
  autoLockEnabled,
  autoLockAfterMarkSeconds,
  autoLockAfterUnlockSeconds,
  onToggleAutoLocked,
  onEditAutoLockSettings,
  daysToWhite,
  onEditDaysToWhite,
  themeMode,
  onEditTheme,
  languageMode,
  onEditLanguage,
  onImport,
  onExport,
  onClear,
}: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <BottomSheet visible={visible} onClose={onClose} title={t("menu.title")}>
      <View style={styles.row}>
        <Text style={[styles.rowLabel, { color: colors.primaryText }]}>
          {t("menu.mirrorRow")}
        </Text>
        <Switch
          value={mirrored}
          onValueChange={onToggleMirrored}
          trackColor={{ false: colors.switchTrackOff, true: colors.switchTrackOn }}
          thumbColor={colors.switchThumb}
        />
      </View>

      <View style={styles.row}>
        <TouchableOpacity
          style={styles.autoLockInfo}
          onPress={onEditAutoLockSettings}
          activeOpacity={0.7}
        >
          <Text style={[styles.rowLabel, { color: colors.primaryText }]}>
            {t("menu.autoLockRow")}
          </Text>
          <Text style={[styles.rowDescription, { color: colors.mutedText }]}>
            {t("menu.autoLockDialog.afterMark")} —{" "}
            {formatDuration(autoLockAfterMarkSeconds)}
          </Text>
          <Text style={[styles.rowDescription, { color: colors.mutedText }]}>
            {t("menu.autoLockDialog.afterUnlock")} —{" "}
            {formatDuration(autoLockAfterUnlockSeconds)}
          </Text>
        </TouchableOpacity>
        <Switch
          value={autoLockEnabled}
          onValueChange={onToggleAutoLocked}
          trackColor={{ false: colors.switchTrackOff, true: colors.switchTrackOn }}
          thumbColor={colors.switchThumb}
        />
      </View>

      <TouchableOpacity
        style={styles.row}
        onPress={onEditDaysToWhite}
        activeOpacity={0.7}
      >
        <Text style={[styles.rowLabel, { color: colors.primaryText }]}>
          {t("menu.daysToWhiteRow")}
        </Text>
        <Text style={[styles.rowValue, { color: colors.mutedText }]}>
          {t("common.daysCount", { count: daysToWhite })}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.row} onPress={onEditTheme} activeOpacity={0.7}>
        <Text style={[styles.rowLabel, { color: colors.primaryText }]}>
          {t("menu.themeRow")}
        </Text>
        <Text style={[styles.rowValue, { color: colors.mutedText }]}>
          {t(THEME_MODE_KEY[themeMode])}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.row}
        onPress={onEditLanguage}
        activeOpacity={0.7}
      >
        <Text style={[styles.rowLabel, { color: colors.primaryText }]}>
          {t("menu.languageRow")}
        </Text>
        <Text style={[styles.rowValue, { color: colors.mutedText }]}>
          {t(LANGUAGE_MODE_KEY[languageMode])}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.row}
        onPress={onExport}
        activeOpacity={0.7}
      >
        <Text style={[styles.rowLabel, { color: colors.primaryText }]}>
          {t("menu.exportRow")}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.row}
        onPress={onImport}
        activeOpacity={0.7}
      >
        <Text style={[styles.rowLabel, { color: colors.primaryText }]}>
          {t("menu.importRow")}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.row}
        onPress={onClear}
        activeOpacity={0.7}
      >
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
  rowValue: {
    fontSize: 15,
  },
  autoLockInfo: {
    flex: 1,
    paddingRight: 12,
  },
  rowDescription: {
    fontSize: 13,
    marginTop: 4,
  },
});
