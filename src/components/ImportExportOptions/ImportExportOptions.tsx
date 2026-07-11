import { useTranslation } from "react-i18next";
import { Checkbox, Accordion } from "../common";
import { ExportSelection, ExportSettingKey } from "../../types";
import type { TranslationKey } from "../../i18n";
import { SETTING_KEYS } from "./constants";

const SETTING_LABEL_KEY: Record<ExportSettingKey, TranslationKey> = {
  [ExportSettingKey.Mirrored]: "menu.mirrorRow",
  [ExportSettingKey.AutoLock]: "menu.autoLockRow",
  [ExportSettingKey.DaysToWhite]: "menu.daysToWhiteRow",
  [ExportSettingKey.Theme]: "menu.themeRow",
  [ExportSettingKey.Language]: "menu.languageRow",
};

interface Props {
  selection: ExportSelection;
  onSelectionChange: (next: ExportSelection) => void;
  settingsExpanded: boolean;
  onToggleSettingsExpanded: () => void;
  // Disables the marks checkbox and/or individual setting checkboxes.
  // ExportOptionsDialog leaves both at their defaults (nothing disabled,
  // since every category is always available to export); ImportOptionsDialog
  // passes these in to grey out a category absent from the imported file.
  marksDisabled?: boolean;
  disabledSettingKeys?: ExportSettingKey[];
}

// The "Отметки точек укола" checkbox plus the "Настройки приложения"
// accordion of per-setting checkboxes, shared by ExportOptionsDialog and
// ImportOptionsDialog — only the meaning of a disabled row differs between
// the two (export: never; import: category absent from the file).
export function ImportExportOptions({
  selection,
  onSelectionChange,
  settingsExpanded,
  onToggleSettingsExpanded,
  marksDisabled = false,
  disabledSettingKeys = [],
}: Props) {
  const { t } = useTranslation();
  const checkableSettingKeys = SETTING_KEYS.filter(
    (key) => !disabledSettingKeys.includes(key),
  );
  const settingsGroupDisabled = checkableSettingKeys.length === 0;

  const selectedCheckableCount = checkableSettingKeys.filter(
    (key) => selection.settings[key],
  ).length;
  const allSettingsChecked =
    checkableSettingKeys.length > 0 &&
    selectedCheckableCount === checkableSettingKeys.length;
  const noSettingsChecked = selectedCheckableCount === 0;

  const toggleMarks = () =>
    onSelectionChange({ ...selection, marks: !selection.marks });

  const toggleAllSettings = () => {
    const nextValue = !allSettingsChecked;
    const nextSettings = { ...selection.settings };
    for (const key of checkableSettingKeys) nextSettings[key] = nextValue;
    onSelectionChange({ ...selection, settings: nextSettings });
  };

  const toggleSetting = (key: ExportSettingKey) =>
    onSelectionChange({
      ...selection,
      settings: { ...selection.settings, [key]: !selection.settings[key] },
    });

  return (
    <>
      <Checkbox
        label={t("menu.exportOptionsDialog.marksLabel")}
        checked={selection.marks}
        onToggle={toggleMarks}
        disabled={marksDisabled}
      />

      <Accordion
        label={
          <Checkbox
            label={t("menu.exportOptionsDialog.settingsLabel")}
            checked={allSettingsChecked}
            indeterminate={!allSettingsChecked && !noSettingsChecked}
            onToggle={toggleAllSettings}
            disabled={settingsGroupDisabled}
          />
        }
        expanded={settingsExpanded}
        onToggleExpanded={onToggleSettingsExpanded}
        disabled={settingsGroupDisabled}
      >
        {SETTING_KEYS.map((key) => (
          <Checkbox
            key={key}
            label={t(SETTING_LABEL_KEY[key])}
            checked={selection.settings[key]}
            onToggle={() => toggleSetting(key)}
            disabled={disabledSettingKeys.includes(key)}
          />
        ))}
      </Accordion>
    </>
  );
}
