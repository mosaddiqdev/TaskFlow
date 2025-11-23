import { useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';
import styles from './Modal.module.css';

export function Modal({ isOpen, onClose, project, onDelete }) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>Project Settings</h2>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.section}>
            <label className={styles.label}>Project Name</label>
            <input
              type="text"
              value={project?.name || ''}
              readOnly
              className={styles.input}
            />
          </div>

          <div className={styles.section}>
            <label className={styles.label}>Description</label>
            <textarea
              value={project?.description || 'No description'}
              readOnly
              className={styles.textarea}
              rows="4"
            />
          </div>

          <div className={styles.section}>
            <label className={styles.label}>Project ID</label>
            <input
              type="text"
              value={project?.id || ''}
              readOnly
              className={styles.input}
            />
          </div>

          <div className={styles.section}>
            <label className={styles.label}>Created</label>
            <input
              type="text"
              value={project?.createdAt || 'N/A'}
              readOnly
              className={styles.input}
            />
          </div>
        </div>

        <div className={styles.footer}>
          <button
            className={styles.deleteBtn}
            onClick={() => {
              onDelete(project?.id);
              onClose();
            }}
          >
            <Trash2 size={16} />
            <span>Delete Project</span>
          </button>
          <button className={styles.closeActionBtn} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </>
  );
}
