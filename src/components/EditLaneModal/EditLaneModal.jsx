import { useState, useEffect } from "react";
import { X } from "lucide-react";
import styles from "./EditLaneModal.module.css";

export function EditLaneModal({
  isOpen,
  onClose,
  lane,
  onUpdateLane,
  existingLanes = [],
}) {
  const [laneName, setLaneName] = useState("");
  const [error, setError] = useState("");

  // Initialize form with lane data when modal opens
  useEffect(() => {
    if (isOpen && lane) {
      setLaneName(lane.title || "");
      setError("");
    }
  }, [isOpen, lane]);

  const handleChange = (e) => {
    setLaneName(e.target.value);
    if (error) {
      setError("");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!laneName.trim()) {
      setError("Lane name is required");
      return;
    }

    // Check for duplicate lane names (case-insensitive), excluding current lane
    const normalizedName = laneName.trim().toLowerCase();
    const isDuplicate = existingLanes.some(
      (existingLane) =>
        existingLane.id !== lane.id &&
        existingLane.title.toLowerCase() === normalizedName
    );

    if (isDuplicate) {
      setError("A lane with this name already exists");
      return;
    }

    onUpdateLane(lane.id, laneName);
    onClose();
  };

  // Clear form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setLaneName("");
      setError("");
    }
  }, [isOpen]);

  if (!isOpen || !lane) return null;

  const handleOverlayClick = (e) => {
    // Only close if clicking directly on the overlay, not on the modal
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <>
      <div className={styles.overlay} onClick={handleOverlayClick} />
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>Edit Lane Name</h2>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Lane Name *</label>
            <input
              type="text"
              value={laneName}
              onChange={handleChange}
              placeholder="e.g. To Do, In Progress, Done"
              className={`${styles.input} ${error ? styles.inputError : ""}`}
              autoFocus
            />
            {error && <span className={styles.errorMessage}>{error}</span>}
          </div>

          <div className={styles.footer}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className={styles.submitBtn}>
              Update Lane
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
