import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog } from "./common/Dialog";
import { ImportExportOptions, isSelectionEmpty, SETTING_KEYS } from "./ImportExportOptions";
import { ExportedAppData, ExportSelection, ExportSettingKey } from "../types";

const SETTING_AVAILABLE: Record<
  ExportSettingKey,
  (data: ExportedAppData) => boolean
> = {
  [ExportSettingKey.Mirrored]: (data) => data.mirrored !== undefined,
  [ExportSettingKey.AutoLock]: (data) => data.autoLockEnabled !== undefined,
  [ExportSettingKey.DaysToWhite]: (data) => data.daysToWhite !== undefined,
  [ExportSettingKey.Theme]: (data) => data.themeMode !== undefined,
  [ExportSettingKey.Language]: (data) => data.languageMode !== undefined,
};

function availableSettings(data: ExportedAppData): Record<ExportSettingKey, boolean> {
  const result = {} as Record<ExportSettingKey, boolean>;
  for (const key of SETTING_KEYS) {
    result[key] = SETTING_AVAILABLE[key](data);
  }
  return result;
}

const DEFAULT_SETTINGS_EXPANDED = false;

interface Props {
  visible: boolean;
  data: ExportedAppData;
  onConfirm: (selection: ExportSelection) => void;
  onCancel: () => void;
}

// A category absent from the imported file is forced unchecked and disabled
// — there's nothing to import for it either way. The "settings" accordion
// checkbox follows the same rule: it's disabled once every one of its
// sub-rows is disabled, i.e. the file carries no settings at all.
export function ImportOptionsDialog({ visible, data, onConfirm, onCancel }: Props) {
  const { t } = useTranslation();
  const marksAvailable = data.buttonStates !== undefined;
  const settingsAvailable = availableSettings(data);
  const disabledSettingKeys = SETTING_KEYS.filter(
    (key) => !settingsAvailable[key],
  );

  const [selection, setSelection] = useState<ExportSelection>({
    marks: marksAvailable,
    settings: settingsAvailable,
  });
  const [settingsExpanded, setSettingsExpanded] = useState(
    DEFAULT_SETTINGS_EXPANDED,
  );

  useEffect(() => {
    if (!visible) return;
    setSelection({ marks: marksAvailable, settings: availableSettings(data) });
    setSettingsExpanded(DEFAULT_SETTINGS_EXPANDED);
    // Only re-run when the dialog opens or the underlying file changes, not
    // on every selection edit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, data]);

  return (
    <Dialog
      visible={visible}
      title={t("menu.importOptionsDialog.title")}
      message={t("menu.importOptionsDialog.message")}
      confirmLabel={t("menu.importOptionsDialog.confirmLabel")}
      confirmDisabled={isSelectionEmpty(selection)}
      onConfirm={() => onConfirm(selection)}
      onCancel={onCancel}
      destructive
      scrollable
    >
      <ImportExportOptions
        selection={selection}
        onSelectionChange={setSelection}
        settingsExpanded={settingsExpanded}
        onToggleSettingsExpanded={() => setSettingsExpanded((v) => !v)}
        marksDisabled={!marksAvailable}
        disabledSettingKeys={disabledSettingKeys}
      />
    </Dialog>
  );
}
