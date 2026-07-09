import { useEffect, useState } from "react";
import { Dialog } from "./common/Dialog";
import { ImportExportOptions, isSelectionEmpty } from "./ImportExportOptions";
import { ExportSelection, ExportSettingKey } from "../types";
import {
  EXPORT_CONFIRM_LABEL,
  EXPORT_OPTIONS_DIALOG_MESSAGE,
  EXPORT_OPTIONS_DIALOG_TITLE,
} from "../constants";

function allSettings(value: boolean): Record<ExportSettingKey, boolean> {
  return {
    [ExportSettingKey.Mirrored]: value,
    [ExportSettingKey.AutoLock]: value,
    [ExportSettingKey.DaysToWhite]: value,
    [ExportSettingKey.Theme]: value,
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
      title={EXPORT_OPTIONS_DIALOG_TITLE}
      message={EXPORT_OPTIONS_DIALOG_MESSAGE}
      confirmLabel={EXPORT_CONFIRM_LABEL}
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
