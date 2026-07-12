import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog } from "../common";
import {
  AppDataSelector,
  allMarks,
  allSettings,
  isSelectionEmpty,
} from "../AppDataSelector";
import { ExportSelection } from "../../types";

const DEFAULT_SELECTION: ExportSelection = {
  marks: allMarks(true),
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
      <AppDataSelector
        selection={selection}
        onSelectionChange={setSelection}
        settingsExpanded={settingsExpanded}
        onToggleSettingsExpanded={() => setSettingsExpanded((v) => !v)}
      />
    </Dialog>
  );
}
