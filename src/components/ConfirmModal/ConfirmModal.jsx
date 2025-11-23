import { X, AlertCircle } from 'lucide-react';
import styles from './ConfirmModal.module.css';

export function ConfirmModal({
  isOpen,
  onClose,
  title,
  message,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  isDangerous = false,
  onConfirm,
}) {
  if (!isOpen) return null;

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.titleArea}>
            {isDangerous && (
              <AlertCircle size={24} className={styles.warningIcon} />
            )}
            <h2 className={styles.title}>{title}</h2>
          </div>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className={styles.content}>
          <p className={styles.message}>{message}</p>
        </div>

        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onClose}>
            {cancelText}
          </button>
          <button
            className={`${styles.confirmBtn} ${
              isDangerous ? styles.dangerous : ''
            }`}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </>
  );
}
