import { useEffect, useState } from "react";
import { AutoLockDialogMode } from "../types";
import { Dialog } from "./common/Dialog";
import { TimeField } from "./common/TimeField";
import {
  AFTER_MARK_LABEL,
  AFTER_UNLOCK_LABEL,
  AUTO_LOCK_ROW_LABEL,
} from "../constants";
import { SECONDS_PER_MINUTE, splitSeconds } from "../format";

interface Props {
  visible: boolean;
  mode: AutoLockDialogMode;
  initialAfterMarkSeconds: number;
  initialAfterUnlockSeconds: number;
  onConfirm: (afterMarkSeconds: number, afterUnlockSeconds: number) => void;
  onCancel: () => void;
}

const CONFIRM_LABELS: Record<AutoLockDialogMode, string> = {
  [AutoLockDialogMode.Enable]: "Включить",
  [AutoLockDialogMode.Edit]: "Сохранить",
};

const MIN_AFTER_UNLOCK_SECONDS = 5;

export function AutoLockDialog({
  visible,
  mode,
  initialAfterMarkSeconds,
  initialAfterUnlockSeconds,
  onConfirm,
  onCancel,
}: Props) {
  const confirmLabel = CONFIRM_LABELS[mode];
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
      title={AUTO_LOCK_ROW_LABEL}
      message="Вы можете включить автоматическую блокировку интерфейса, чтобы избежать случайного нажатия на точку укола. Блокировка сработает через заданное время после нажатия на точку или после простоя в разблокированном режиме. Разблокировать интерфейс можно будет нажав на соответствующую кнопку в нижнем меню."
      confirmLabel={confirmLabel}
      onConfirm={handleConfirm}
      onCancel={onCancel}
      scrollable
    >
      <TimeField
        label={AFTER_MARK_LABEL}
        minutes={markMinutes}
        seconds={markSeconds}
        onChangeMinutes={setMarkMinutes}
        onChangeSeconds={setMarkSeconds}
      />
      <TimeField
        label={AFTER_UNLOCK_LABEL}
        minutes={unlockMinutes}
        seconds={unlockSeconds}
        onChangeMinutes={handleChangeUnlockMinutes}
        onChangeSeconds={handleChangeUnlockSeconds}
      />
    </Dialog>
  );
}
