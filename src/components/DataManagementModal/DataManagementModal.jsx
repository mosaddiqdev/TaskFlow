import { useState } from 'react';
import { Download, Upload, Trash2, X } from 'lucide-react';
import {
  exportBoardAsJSON,
  exportProjectsAsJSON,
  exportAllAsJSON,
  importBoardFromJSON,
  importProjectsFromJSON,
  importAllFromJSON,
  selectFile,
} from '../../utils/storageExportImport';
import styles from './DataManagementModal.module.css';

export function DataManagementModal({
  isOpen,
  onClose,
  board,
  projects,
  preferences,
  onImportBoard,
  onImportProjects,
  onImportAll,
  onClearData,
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const clearError = () => setError(null);
  const clearSuccess = () => setSuccess(null);

  const handleExportBoard = () => {
    try {
      setError(null);
      exportBoardAsJSON(board);
      setSuccess('Board exported successfully!');
      setTimeout(clearSuccess, 3000);
    } catch (err) {
      setError(err.message || 'Failed to export board');
    }
  };

  const handleExportProjects = () => {
    try {
      setError(null);
      exportProjectsAsJSON(projects);
      setSuccess('Projects exported successfully!');
      setTimeout(clearSuccess, 3000);
    } catch (err) {
      setError(err.message || 'Failed to export projects');
    }
  };

  const handleExportAll = () => {
    try {
      setError(null);
      exportAllAsJSON({ board, projects, preferences });
      setSuccess('Full backup exported successfully!');
      setTimeout(clearSuccess, 3000);
    } catch (err) {
      setError(err.message || 'Failed to export backup');
    }
  };

  const handleImportBoard = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const file = await selectFile();
      const importedBoard = await importBoardFromJSON(file);
      onImportBoard(importedBoard);
      setSuccess('Board imported successfully!');
      setTimeout(clearSuccess, 3000);
    } catch (err) {
      setError(err.message || 'Failed to import board');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportProjects = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const file = await selectFile();
      const importedProjects = await importProjectsFromJSON(file);
      onImportProjects(importedProjects);
      setSuccess('Projects imported successfully!');
      setTimeout(clearSuccess, 3000);
    } catch (err) {
      setError(err.message || 'Failed to import projects');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportAll = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const file = await selectFile();
      const importedData = await importAllFromJSON(file);
      onImportAll(importedData);
      setSuccess('Full backup imported successfully!');
      setTimeout(clearSuccess, 3000);
    } catch (err) {
      setError(err.message || 'Failed to import backup');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to delete all TaskFlow data? This action cannot be undone.')) {
      try {
        setError(null);
        onClearData();
        setSuccess('All data cleared successfully!');
        setTimeout(clearSuccess, 3000);
      } catch (err) {
        setError(err.message || 'Failed to clear data');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>Data Management</h2>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className={styles.content}>
          {error && (
            <div className={styles.errorMessage}>
              <span>{error}</span>
              <button onClick={clearError} className={styles.dismissBtn}>
                ✕
              </button>
            </div>
          )}

          {success && (
            <div className={styles.successMessage}>
              <span>{success}</span>
              <button onClick={clearSuccess} className={styles.dismissBtn}>
                ✕
              </button>
            </div>
          )}

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Export Data</h3>
            <p className={styles.sectionDescription}>
              Download your data as JSON files for backup or transfer
            </p>

            <div className={styles.buttonGroup}>
              <button
                className={styles.exportBtn}
                onClick={handleExportBoard}
                disabled={isLoading}
              >
                <Download size={16} />
                <span>Export Board</span>
              </button>

              <button
                className={styles.exportBtn}
                onClick={handleExportProjects}
                disabled={isLoading}
              >
                <Download size={16} />
                <span>Export Projects</span>
              </button>

              <button
                className={styles.exportBtn}
                onClick={handleExportAll}
                disabled={isLoading}
              >
                <Download size={16} />
                <span>Export Full Backup</span>
              </button>
            </div>
          </div>

          <div className={styles.divider} />

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Import Data</h3>
            <p className={styles.sectionDescription}>
              Upload JSON files to restore your data
            </p>

            <div className={styles.buttonGroup}>
              <button
                className={styles.importBtn}
                onClick={handleImportBoard}
                disabled={isLoading}
              >
                <Upload size={16} />
                <span>Import Board</span>
              </button>

              <button
                className={styles.importBtn}
                onClick={handleImportProjects}
                disabled={isLoading}
              >
                <Upload size={16} />
                <span>Import Projects</span>
              </button>

              <button
                className={styles.importBtn}
                onClick={handleImportAll}
                disabled={isLoading}
              >
                <Upload size={16} />
                <span>Import Full Backup</span>
              </button>
            </div>
          </div>

          <div className={styles.divider} />

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Danger Zone</h3>
            <p className={styles.sectionDescription}>
              Permanently delete all TaskFlow data from your browser
            </p>

            <button
              className={styles.deleteBtn}
              onClick={handleClearData}
              disabled={isLoading}
            >
              <Trash2 size={16} />
              <span>Clear All Data</span>
            </button>
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.closeModalBtn} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </>
  );
}
