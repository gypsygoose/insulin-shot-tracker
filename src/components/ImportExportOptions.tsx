import { Checkbox } from "./common/Checkbox";
import { Accordion } from "./common/Accordion";
import { ExportSelection, ExportSettingKey } from "../types";
import {
  AUTO_LOCK_ROW_LABEL,
  DAYS_TO_WHITE_ROW_LABEL,
  EXPORT_MARKS_LABEL,
  EXPORT_SETTINGS_LABEL,
  MIRROR_ROW_LABEL,
  THEME_ROW_LABEL,
} from "../constants";

export const SETTING_KEYS: ExportSettingKey[] = Object.values(ExportSettingKey);

const SETTING_LABEL: Record<ExportSettingKey, string> = {
  [ExportSettingKey.Mirrored]: MIRROR_ROW_LABEL,
  [ExportSettingKey.AutoLock]: AUTO_LOCK_ROW_LABEL,
  [ExportSettingKey.DaysToWhite]: DAYS_TO_WHITE_ROW_LABEL,
  [ExportSettingKey.Theme]: THEME_ROW_LABEL,
};

export function isSelectionEmpty(selection: ExportSelection): boolean {
  return !selection.marks && SETTING_KEYS.every((key) => !selection.settings[key]);
}

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
        label={EXPORT_MARKS_LABEL}
        checked={selection.marks}
        onToggle={toggleMarks}
        disabled={marksDisabled}
      />

      <Accordion
        label={
          <Checkbox
            label={EXPORT_SETTINGS_LABEL}
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
            label={SETTING_LABEL[key]}
            checked={selection.settings[key]}
            onToggle={() => toggleSetting(key)}
            disabled={disabledSettingKeys.includes(key)}
          />
        ))}
      </Accordion>
    </>
  );
}
