import { useTranslation } from 'react-i18next';
import { Dialog } from './Dialog';

interface Props {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
}

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  destructive = false,
}: Props) {
  const { t } = useTranslation();
  return (
    <Dialog
      visible={visible}
      title={title}
      message={message}
      confirmLabel={confirmLabel ?? t('common.confirm')}
      cancelLabel={cancelLabel}
      onConfirm={onConfirm}
      onCancel={onCancel}
      destructive={destructive}
    />
  );
}
