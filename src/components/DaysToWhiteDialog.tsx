import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog } from "./common/Dialog";
import { NumberPickerField } from "./common/NumberPickerField";
import { MAX_DAYS_TO_WHITE, MIN_DAYS_TO_WHITE } from "../constants";

const DAYS_OPTIONS = Array.from(
  { length: MAX_DAYS_TO_WHITE - MIN_DAYS_TO_WHITE + 1 },
  (_, i) => i + MIN_DAYS_TO_WHITE,
);

interface Props {
  visible: boolean;
  initialDays: number;
  onConfirm: (days: number) => void;
  onCancel: () => void;
}

export function DaysToWhiteDialog({
  visible,
  initialDays,
  onConfirm,
  onCancel,
}: Props) {
  const { t } = useTranslation();
  const [days, setDays] = useState(initialDays);

  useEffect(() => {
    if (!visible) return;
    setDays(initialDays);
  }, [visible, initialDays]);

  return (
    <Dialog
      visible={visible}
      title={t("menu.daysToWhiteRow")}
      message={t("menu.daysToWhiteDialog.message")}
      confirmLabel={t("common.save")}
      onConfirm={() => onConfirm(days)}
      onCancel={onCancel}
    >
      <NumberPickerField
        label={t("menu.daysToWhiteRow")}
        value={days}
        options={DAYS_OPTIONS}
        onChange={setDays}
      />
    </Dialog>
  );
}
