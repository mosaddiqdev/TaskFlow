import { useState } from "react";
import { X, Moon, Sun, Download, Upload, Trash2 } from "lucide-react";
import {
  exportBoardAsJSON,
  exportProjectsAsJSON,
  exportAllAsJSON,
  importBoardFromJSON,
  importProjectsFromJSON,
  importAllFromJSON,
  selectFile,
} from "../../utils/storageExportImport";
import { getProjectBoard } from "../../utils/projectBoardManager";
import styles from "./SettingsModal.module.css";

export function SettingsModal({
  isOpen,
  onClose,
  projects,
  activeProjectId,
  preferences,
  onThemeChange,
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

  const handleThemeToggle = () => {
    try {
      setError(null);
      const newTheme = preferences.theme === "dark" ? "light" : "dark";
      onThemeChange(newTheme);
    } catch (err) {
      setError("Failed to change theme");
    }
  };

  const handleExportBoard = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!activeProjectId) {
        throw new Error("No active project selected");
      }

      const board = getProjectBoard(activeProjectId);
      if (!board) {
        throw new Error("Could not find board data for current project");
      }

      exportBoardAsJSON(board);
      setSuccess("Board exported successfully!");
      setTimeout(clearSuccess, 3000);
    } catch (err) {
      setError(err.message || "Failed to export board");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportProjects = async () => {
    try {
      setIsLoading(true);
      setError(null);
      if (projects.length === 0) {
        setError("No projects to export");
        return;
      }
      exportProjectsAsJSON(projects);
      setSuccess(`${projects.length} project(s) exported successfully!`);
      setTimeout(clearSuccess, 3000);
    } catch (err) {
      setError(err.message || "Failed to export projects");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportAll = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!activeProjectId) {
        throw new Error("No active project selected");
      }

      const board = getProjectBoard(activeProjectId);
      if (!board) {
        throw new Error("Could not find board data for current project");
      }

      exportAllAsJSON({ board, projects, preferences });
      setSuccess("Full backup exported successfully!");
      setTimeout(clearSuccess, 3000);
    } catch (err) {
      setError(err.message || "Failed to export backup");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportBoard = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const file = await selectFile();
      const result = await importBoardFromJSON(file);
      if (result.success) {
        onImportBoard(result.board);
        setSuccess("Board imported successfully!");
        setTimeout(clearSuccess, 3000);
      }
    } catch (err) {
      setError(err.message || "Failed to import board");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportProjects = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const file = await selectFile();
      const result = await importProjectsFromJSON(file);
      if (result.success) {
        onImportProjects(result.projects);
        setSuccess(`${result.count} project(s) imported successfully!`);
        setTimeout(clearSuccess, 3000);
      }
    } catch (err) {
      setError(err.message || "Failed to import projects");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportAll = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const file = await selectFile();
      const result = await importAllFromJSON(file);
      if (result.success) {
        onImportAll(result);
        setSuccess("Full backup imported successfully!");
        setTimeout(clearSuccess, 3000);
      }
    } catch (err) {
      setError(err.message || "Failed to import backup");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearData = () => {
    if (
      window.confirm(
        "Are you sure you want to delete all TaskFlow data? This action cannot be undone."
      )
    ) {
      try {
        setError(null);
        onClearData();
        setSuccess("All data cleared successfully!");
        setTimeout(clearSuccess, 3000);
      } catch (err) {
        setError(err.message || "Failed to clear data");
      }
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>Settings</h2>
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
            <div className={styles.alert + " " + styles.alertError}>
              <span>{error}</span>
              <button onClick={clearError} className={styles.alertClose}>
                ✕
              </button>
            </div>
          )}

          {success && (
            <div className={styles.alert + " " + styles.alertSuccess}>
              <span>{success}</span>
              <button onClick={clearSuccess} className={styles.alertClose}>
                ✕
              </button>
            </div>
          )}

          {/* Theme Section */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <Sun size={18} />
              <div>
                <h3 className={styles.sectionTitle}>Theme</h3>
                <p className={styles.sectionDesc}>
                  Switch between dark and light mode
                </p>
              </div>
            </div>
            <button
              className={styles.actionBtn}
              onClick={handleThemeToggle}
              disabled={isLoading}
            >
              {preferences.theme === "dark" ? (
                <>
                  <Sun size={16} />
                  Light Mode
                </>
              ) : (
                <>
                  <Moon size={16} />
                  Dark Mode
                </>
              )}
            </button>
          </div>

          <div className={styles.divider} />

          {/* Export Section */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <Download size={18} />
              <div>
                <h3 className={styles.sectionTitle}>Export</h3>
                <p className={styles.sectionDesc}>
                  Download your data as backup
                </p>
              </div>
            </div>
            <div className={styles.actionGroup}>
              <button
                className={styles.actionBtn}
                onClick={handleExportBoard}
                disabled={isLoading}
              >
                <Download size={16} />
                Board
              </button>
              <button
                className={styles.actionBtn}
                onClick={handleExportProjects}
                disabled={isLoading || projects.length === 0}
              >
                <Download size={16} />
                Projects ({projects.length})
              </button>
              <button
                className={styles.actionBtn}
                onClick={handleExportAll}
                disabled={isLoading}
              >
                <Download size={16} />
                Full Backup
              </button>
            </div>
          </div>

          <div className={styles.divider} />

          {/* Import Section */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <Upload size={18} />
              <div>
                <h3 className={styles.sectionTitle}>Import</h3>
                <p className={styles.sectionDesc}>
                  Restore data from backup files
                </p>
              </div>
            </div>
            <div className={styles.actionGroup}>
              <button
                className={styles.actionBtn}
                onClick={handleImportBoard}
                disabled={isLoading}
              >
                <Upload size={16} />
                Board
              </button>
              <button
                className={styles.actionBtn}
                onClick={handleImportProjects}
                disabled={isLoading}
              >
                <Upload size={16} />
                Projects
              </button>
              <button
                className={styles.actionBtn}
                onClick={handleImportAll}
                disabled={isLoading}
              >
                <Upload size={16} />
                Full Backup
              </button>
            </div>
          </div>

          <div className={styles.divider} />

          {/* Danger Zone */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <Trash2 size={18} />
              <div>
                <h3 className={styles.sectionTitle}>Danger Zone</h3>
                <p className={styles.sectionDesc}>
                  Permanently delete all data
                </p>
              </div>
            </div>
            <button
              className={styles.actionBtn + " " + styles.actionBtnDanger}
              onClick={handleClearData}
              disabled={isLoading}
            >
              <Trash2 size={16} />
              Clear All Data
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
