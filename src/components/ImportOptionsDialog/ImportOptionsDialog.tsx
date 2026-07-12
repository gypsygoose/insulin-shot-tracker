import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog } from "../common";
import { AppDataSelector, isSelectionEmpty, MARKS_KEYS, SETTING_KEYS } from "../AppDataSelector";
import { ExportedAppData, ExportSelection } from "../../types";
import { availableMarks, availableSettings } from "./utils";

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
  const marksAvailable = availableMarks(data);
  const disabledMarksKeys = MARKS_KEYS.filter((key) => !marksAvailable[key]);
  const settingsAvailable = availableSettings(data);
  const disabledSettingKeys = SETTING_KEYS.filter(
    (key) => !settingsAvailable[key],
  );

  const [selection, setSelection] = useState<ExportSelection>({
    marks: marksAvailable,
    settings: settingsAvailable,
  });
  const [settingsExpanded, setSettingsExpanded] = useState(
    disabledSettingKeys.length > 0,
  );

  useEffect(() => {
    if (!visible) return;
    const nextMarksAvailable = availableMarks(data);
    const nextSettingsAvailable = availableSettings(data);
    setSelection({ marks: nextMarksAvailable, settings: nextSettingsAvailable });
    setSettingsExpanded(SETTING_KEYS.some((key) => !nextSettingsAvailable[key]));
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
      <AppDataSelector
        selection={selection}
        onSelectionChange={setSelection}
        settingsExpanded={settingsExpanded}
        onToggleSettingsExpanded={() =>
          setSettingsExpanded((expanded) => !expanded)
        }
        disabledMarksKeys={disabledMarksKeys}
        disabledSettingKeys={disabledSettingKeys}
      />
    </Dialog>
  );
}
