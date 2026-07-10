import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog } from "./common/Dialog";
import { ImportExportOptions, isSelectionEmpty } from "./ImportExportOptions";
import { ExportSelection, ExportSettingKey } from "../types";

function allSettings(value: boolean): Record<ExportSettingKey, boolean> {
  return {
    [ExportSettingKey.Mirrored]: value,
    [ExportSettingKey.AutoLock]: value,
    [ExportSettingKey.DaysToWhite]: value,
    [ExportSettingKey.Theme]: value,
    [ExportSettingKey.Language]: value,
  };
}

const DEFAULT_SELECTION: ExportSelection = {
  marks: true,
  settings: allSettings(true),
};
const DEFAULT_SETTINGS_EXPANDED = false;

interface Props {
  visible: boolean;
  onConfirm: (selection: ExportSelection) => void;
  onCancel: () => void;
}

export function ExportOptionsDialog({ visible, onConfirm, onCancel }: Props) {
  const { t } = useTranslation();
  const [selection, setSelection] =
    useState<ExportSelection>(DEFAULT_SELECTION);
  const [settingsExpanded, setSettingsExpanded] = useState(
    DEFAULT_SETTINGS_EXPANDED,
  );

  useEffect(() => {
    if (!visible) return;
    setSelection(DEFAULT_SELECTION);
    setSettingsExpanded(DEFAULT_SETTINGS_EXPANDED);
  }, [visible]);

  return (
    <Dialog
      visible={visible}
      title={t("menu.exportOptionsDialog.title")}
      message={t("menu.exportOptionsDialog.message")}
      confirmLabel={t("menu.exportOptionsDialog.confirmLabel")}
      confirmDisabled={isSelectionEmpty(selection)}
      onConfirm={() => onConfirm(selection)}
      onCancel={onCancel}
      scrollable
    >
      <ImportExportOptions
        selection={selection}
        onSelectionChange={setSelection}
        settingsExpanded={settingsExpanded}
        onToggleSettingsExpanded={() => setSettingsExpanded((v) => !v)}
      />
    </Dialog>
  );
}
