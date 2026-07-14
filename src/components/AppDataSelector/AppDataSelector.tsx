import { useTranslation } from "react-i18next";
import { Checkbox, Accordion } from "../common";
import { ExportMarksKey, ExportSelection, ExportSettingKey } from "../../types";
import type { TranslationKey } from "../../i18n";
import { MARKS_KEYS, SETTING_KEYS } from "./constants";

const MARKS_LABEL_KEY: Record<ExportMarksKey, TranslationKey> = {
  [ExportMarksKey.ActivePoints]: "menu.exportOptionsDialog.activePointsLabel",
  [ExportMarksKey.BlockedPoints]: "menu.exportOptionsDialog.blockedPointsLabel",
};

const SETTING_LABEL_KEY: Record<ExportSettingKey, TranslationKey> = {
  [ExportSettingKey.Mirrored]: "menu.mirrorRow",
  [ExportSettingKey.AutoLock]: "menu.autoLockRow",
  [ExportSettingKey.EnabledZones]: "menu.zonesRow",
  [ExportSettingKey.ZonePointCounts]: "menu.zonePointsRow",
  [ExportSettingKey.PointRestoreMode]: "menu.pointRestoreModeRow",
  [ExportSettingKey.DaysToWhite]: "menu.daysToWhiteRow",
  [ExportSettingKey.DaysToAvailable]: "menu.daysToAvailableRow",
  [ExportSettingKey.Language]: "menu.languageRow",
  [ExportSettingKey.Theme]: "menu.themeRow",
};

interface Props {
  selection: ExportSelection;
  onSelectionChange: (next: ExportSelection) => void;
  // Renders the marks row as an accordion with independent Active/Blocked
  // checkboxes when true. ExportOptionsDialog/ImportOptionsDialog leave this
  // false — export and import always act on both marks sub-categories
  // together (see ImportOptionsDialog/utils/availableMarks.ts: a file can
  // never carry just one), so a single flat checkbox is enough there. Only
  // ClearOptionsDialog sets this true, since its default selection (only
  // "Активные точки" checked) needs the two sub-categories choosable
  // independently. marksExpanded/onToggleMarksExpanded are only read in the
  // accordion branch.
  marksExpandable?: boolean;
  marksExpanded?: boolean;
  onToggleMarksExpanded?: () => void;
  settingsExpanded: boolean;
  onToggleSettingsExpanded: () => void;
  // Disables individual marks/setting checkboxes. ExportOptionsDialog and
  // ClearOptionsDialog both leave these at their defaults (nothing disabled,
  // since every category is always available to export/clear);
  // ImportOptionsDialog passes these in to grey out a category absent from
  // the imported file.
  disabledMarksKeys?: ExportMarksKey[];
  disabledSettingKeys?: ExportSettingKey[];
}

// The "Отметки точек укола" row (a plain checkbox, or an accordion of
// independent active/blocked-points checkboxes when marksExpandable) plus
// the "Настройки приложения" accordion of per-setting checkboxes, shared by
// ExportOptionsDialog, ImportOptionsDialog, and ClearOptionsDialog — beyond
// marksExpandable, only the meaning of a disabled row differs across the
// three (export: never; import: category absent from the file; clear:
// never, same as export).
export function AppDataSelector({
  selection,
  onSelectionChange,
  marksExpandable = false,
  marksExpanded = false,
  onToggleMarksExpanded,
  settingsExpanded,
  onToggleSettingsExpanded,
  disabledMarksKeys = [],
  disabledSettingKeys = [],
}: Props) {
  const { t } = useTranslation();
  const checkableMarksKeys = MARKS_KEYS.filter(
    (key) => !disabledMarksKeys.includes(key),
  );
  const marksGroupDisabled = checkableMarksKeys.length === 0;

  const selectedCheckableMarksCount = checkableMarksKeys.filter(
    (key) => selection.marks[key],
  ).length;
  const allMarksChecked =
    checkableMarksKeys.length > 0 &&
    selectedCheckableMarksCount === checkableMarksKeys.length;
  const noMarksChecked = selectedCheckableMarksCount === 0;

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

  const toggleAllMarks = () => {
    const nextValue = !allMarksChecked;
    const nextMarks = { ...selection.marks };
    for (const key of checkableMarksKeys) nextMarks[key] = nextValue;
    onSelectionChange({ ...selection, marks: nextMarks });
  };

  const toggleMark = (key: ExportMarksKey) =>
    onSelectionChange({
      ...selection,
      marks: { ...selection.marks, [key]: !selection.marks[key] },
    });

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
      {marksExpandable ? (
        <Accordion
          label={
            <Checkbox
              label={t("menu.exportOptionsDialog.marksLabel")}
              checked={allMarksChecked}
              indeterminate={!allMarksChecked && !noMarksChecked}
              onToggle={toggleAllMarks}
              disabled={marksGroupDisabled}
            />
          }
          expanded={marksExpanded}
          onToggleExpanded={onToggleMarksExpanded ?? (() => {})}
          disabled={marksGroupDisabled}
        >
          {MARKS_KEYS.map((key) => (
            <Checkbox
              key={key}
              label={t(MARKS_LABEL_KEY[key])}
              checked={selection.marks[key]}
              onToggle={() => toggleMark(key)}
              disabled={disabledMarksKeys.includes(key)}
            />
          ))}
        </Accordion>
      ) : (
        <Checkbox
          label={t("menu.exportOptionsDialog.marksLabel")}
          checked={allMarksChecked}
          onToggle={toggleAllMarks}
          disabled={marksGroupDisabled}
        />
      )}

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
