import { useState, useEffect } from "react";
import { X, Trash2 } from "lucide-react";
import styles from "./ProjectModal.module.css";

export function ProjectModal({
  isOpen,
  onClose,
  project,
  onCreate,
  onDelete,
  existingProjects = [],
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isEditMode = !!project;

  useEffect(() => {
    if (isOpen && project) {
      setName(project.name);
      setDescription(project.description || "");
    } else if (isOpen) {
      setName("");
      setDescription("");
    }
    setError("");
    setShowDeleteConfirm(false);
  }, [isOpen, project]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Project name is required");
      return;
    }

    // Check for duplicate project names (case-insensitive), excluding current project when editing
    const normalizedName = name.trim().toLowerCase();
    const isDuplicate = existingProjects.some(
      (existingProject) =>
        (!isEditMode || existingProject.id !== project.id) &&
        existingProject.name.toLowerCase() === normalizedName
    );

    if (isDuplicate) {
      setError("A project with this name already exists");
      return;
    }

    onCreate({
      name,
      description,
    });

    if (!isEditMode) {
      setName("");
      setDescription("");
    }
    onClose();
  };

  const handleDelete = () => {
    onDelete(project.id);
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className={styles.overlay} onClick={handleOverlayClick} />
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            {isEditMode ? "Edit Project" : "New Project"}
          </h2>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Name Input */}
          <div className={styles.section}>
            <label className={styles.label}>Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError("");
              }}
              placeholder="Project name"
              className={styles.input}
              autoFocus
            />
            {error && <span className={styles.error}>{error}</span>}
          </div>

          {/* Description Input */}
          <div className={styles.section}>
            <div className={styles.labelWithCount}>
              <label className={styles.label}>Description</label>
              <span className={styles.charCount}>{description.length}/200</span>
            </div>
            <textarea
              value={description}
              onChange={(e) => {
                if (e.target.value.length <= 200) {
                  setDescription(e.target.value);
                }
              }}
              placeholder="Add a description..."
              className={styles.textarea}
              rows="3"
              maxLength="200"
            />
          </div>

          {/* Action Buttons */}
          <div className={styles.actions}>
            {isEditMode && (
              <>
                {!showDeleteConfirm ? (
                  <button
                    type="button"
                    className={styles.deleteBtn}
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                ) : (
                  <div className={styles.deleteConfirm}>
                    <span>Delete project?</span>
                    <div className={styles.confirmBtns}>
                      <button
                        type="button"
                        className={styles.cancelDeleteBtn}
                        onClick={() => setShowDeleteConfirm(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className={styles.confirmDeleteBtn}
                        onClick={handleDelete}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
            <button type="submit" className={styles.submitBtn}>
              {isEditMode ? "Save" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
