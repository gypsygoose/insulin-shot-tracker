import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { AutoLockDialogMode } from "../types";
import { Dialog } from "./common/Dialog";
import { TimeField } from "./common/TimeField";
import { SECONDS_PER_MINUTE, splitSeconds } from "../format";

interface Props {
  visible: boolean;
  mode: AutoLockDialogMode;
  initialAfterMarkSeconds: number;
  initialAfterUnlockSeconds: number;
  onConfirm: (afterMarkSeconds: number, afterUnlockSeconds: number) => void;
  onCancel: () => void;
}

const MIN_AFTER_UNLOCK_SECONDS = 5;

export function AutoLockDialog({
  visible,
  mode,
  initialAfterMarkSeconds,
  initialAfterUnlockSeconds,
  onConfirm,
  onCancel,
}: Props) {
  const { t } = useTranslation();
  const confirmLabel =
    mode === AutoLockDialogMode.Enable
      ? t("menu.autoLockEnableConfirm")
      : t("common.save");
  const [markMinutes, setMarkMinutes] = useState(0);
  const [markSeconds, setMarkSeconds] = useState(0);
  const [unlockMinutes, setUnlockMinutes] = useState(0);
  const [unlockSeconds, setUnlockSeconds] = useState(0);

  useEffect(() => {
    if (!visible) return;
    const mark = splitSeconds(initialAfterMarkSeconds);
    const unlock = splitSeconds(
      Math.max(MIN_AFTER_UNLOCK_SECONDS, initialAfterUnlockSeconds),
    );
    setMarkMinutes(mark.minutes);
    setMarkSeconds(mark.seconds);
    setUnlockMinutes(unlock.minutes);
    setUnlockSeconds(unlock.seconds);
  }, [visible, initialAfterMarkSeconds, initialAfterUnlockSeconds]);

  const handleChangeUnlockMinutes = (value: number) => {
    setUnlockMinutes(value);
    if (value === 0 && unlockSeconds < MIN_AFTER_UNLOCK_SECONDS) {
      setUnlockSeconds(MIN_AFTER_UNLOCK_SECONDS);
    }
  };

  const handleChangeUnlockSeconds = (value: number) => {
    setUnlockSeconds(
      unlockMinutes === 0 ? Math.max(MIN_AFTER_UNLOCK_SECONDS, value) : value,
    );
  };

  const handleConfirm = () => {
    onConfirm(
      markMinutes * SECONDS_PER_MINUTE + markSeconds,
      Math.max(
        MIN_AFTER_UNLOCK_SECONDS,
        unlockMinutes * SECONDS_PER_MINUTE + unlockSeconds,
      ),
    );
  };

  return (
    <Dialog
      visible={visible}
      title={t("menu.autoLockRow")}
      message={t("menu.autoLockDialog.message")}
      confirmLabel={confirmLabel}
      onConfirm={handleConfirm}
      onCancel={onCancel}
      scrollable
    >
      <TimeField
        label={t("menu.autoLockDialog.afterMark")}
        minutes={markMinutes}
        seconds={markSeconds}
        onChangeMinutes={setMarkMinutes}
        onChangeSeconds={setMarkSeconds}
      />
      <TimeField
        label={t("menu.autoLockDialog.afterUnlock")}
        minutes={unlockMinutes}
        seconds={unlockSeconds}
        onChangeMinutes={handleChangeUnlockMinutes}
        onChangeSeconds={handleChangeUnlockSeconds}
      />
    </Dialog>
  );
}
