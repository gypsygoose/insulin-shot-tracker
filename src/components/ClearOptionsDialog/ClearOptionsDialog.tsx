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

// Unlike ExportOptionsDialog (everything defaults to checked), only "Активные
// точки" defaults to checked here — clearing is destructive, so the default
// selection stays narrow rather than reproducing the old all-or-nothing
// "Очистить" behavior; every other category needs a deliberate opt-in.
const DEFAULT_SELECTION: ExportSelection = {
  marks: { ...allMarks(false) },
  settings: allSettings(false),
};
const DEFAULT_MARKS_EXPANDED = false;
const DEFAULT_SETTINGS_EXPANDED = false;

interface Props {
  visible: boolean;
  onConfirm: (selection: ExportSelection) => void;
  onCancel: () => void;
}

export function ClearOptionsDialog({ visible, onConfirm, onCancel }: Props) {
  const { t } = useTranslation();
  const [selection, setSelection] =
    useState<ExportSelection>(DEFAULT_SELECTION);
  const [marksExpanded, setMarksExpanded] = useState(DEFAULT_MARKS_EXPANDED);
  const [settingsExpanded, setSettingsExpanded] = useState(
    DEFAULT_SETTINGS_EXPANDED,
  );

  useEffect(() => {
    if (!visible) return;
    setSelection(DEFAULT_SELECTION);
    setMarksExpanded(DEFAULT_MARKS_EXPANDED);
    setSettingsExpanded(DEFAULT_SETTINGS_EXPANDED);
  }, [visible]);

  return (
    <Dialog
      visible={visible}
      title={t("menu.clearOptionsDialog.title")}
      message={t("menu.clearOptionsDialog.message")}
      confirmLabel={t("menu.clearOptionsDialog.confirmLabel")}
      confirmDisabled={isSelectionEmpty(selection)}
      onConfirm={() => onConfirm(selection)}
      onCancel={onCancel}
      destructive
      scrollable
    >
      <AppDataSelector
        selection={selection}
        onSelectionChange={setSelection}
        marksExpanded={marksExpanded}
        onToggleMarksExpanded={() => setMarksExpanded((v) => !v)}
        settingsExpanded={settingsExpanded}
        onToggleSettingsExpanded={() => setSettingsExpanded((v) => !v)}
      />
    </Dialog>
  );
}
