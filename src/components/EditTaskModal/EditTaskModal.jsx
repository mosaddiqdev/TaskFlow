import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Dropdown } from "../Dropdown/Dropdown";
import styles from "./EditTaskModal.module.css";

export function EditTaskModal({ isOpen, onClose, task, onUpdateTask }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    dueDate: "",
    labels: "",
  });
  const [errors, setErrors] = useState({});

  // Initialize form with task data when modal opens
  useEffect(() => {
    if (isOpen && task) {
      setFormData({
        title: task.title || "",
        description: task.description || "",
        priority: task.priority || "medium",
        dueDate: task.dueDate || "",
        labels: (task.labels || []).join(", "),
      });
      setErrors({});
    }
  }, [isOpen, task]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Task title is required";
    }

    // Validate labels for duplicates
    if (formData.labels.trim()) {
      const labelsArray = formData.labels
        .split(",")
        .map((label) => label.trim())
        .filter((label) => label);

      const normalizedLabels = labelsArray.map((l) => l.toLowerCase());
      const uniqueLabels = new Set(normalizedLabels);

      if (normalizedLabels.length !== uniqueLabels.size) {
        newErrors.labels = "Duplicate labels are not allowed";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const updatedTask = {
      ...task,
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      dueDate: formData.dueDate,
      labels: formData.labels
        .split(",")
        .map((label) => label.trim())
        .filter((label) => label),
    };

    onUpdateTask(task.id, updatedTask);
    onClose();
  };

  // Clear form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        title: "",
        description: "",
        priority: "medium",
        dueDate: "",
        labels: "",
      });
      setErrors({});
    }
  }, [isOpen]);

  if (!isOpen || !task) return null;

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
          <h2 className={styles.title}>Edit Task</h2>
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
            <label className={styles.label}>Task Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter task title"
              className={`${styles.input} ${
                errors.title ? styles.inputError : ""
              }`}
              autoFocus
            />
            {errors.title && (
              <span className={styles.errorMessage}>{errors.title}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter task description"
              className={styles.textarea}
              rows="3"
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Priority</label>
              <Dropdown
                label="Select Priority"
                options={[
                  { label: "Low", value: "low" },
                  { label: "Medium", value: "medium" },
                  { label: "High", value: "high" },
                ]}
                value={formData.priority}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, priority: value }))
                }
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Due Date</label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className={styles.input}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Labels (comma-separated)</label>
            <input
              type="text"
              name="labels"
              value={formData.labels}
              onChange={handleChange}
              placeholder="e.g. bug, feature, urgent"
              className={`${styles.input} ${
                errors.labels ? styles.inputError : ""
              }`}
            />
            {errors.labels && (
              <span className={styles.errorMessage}>{errors.labels}</span>
            )}
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
              Update Task
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
