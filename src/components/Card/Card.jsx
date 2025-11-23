import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2, Calendar, Edit2, Copy } from "lucide-react";
import styles from "./Card.module.css";

export function Card({
  id,
  title,
  description,
  priority,
  dueDate,
  labels,
  onDelete,
  onEdit,
  onDuplicate,
  isSelected,
  onSelect,
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id,
      data: { title, description, priority, dueDate, labels },
    });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition: isDragging ? "none" : "opacity 0.2s ease-out",
    opacity: isDragging ? 0 : 1,
    visibility: isDragging ? "hidden" : "visible",
  };

  const priorityColor = {
    high: "var(--color-accent-red)",
    medium: "var(--color-accent-amber)",
    low: "var(--color-accent-green)",
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  };

  const handleCardClick = (e) => {
    if ((e.ctrlKey || e.metaKey) && onSelect) {
      e.preventDefault();
      onSelect(id);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${styles.card} ${isSelected ? styles.cardSelected : ""}`}
      {...attributes}
      onClick={handleCardClick}
    >
      <div className={styles.cardHeader}>
        <div className={styles.gripHandle} {...listeners}>
          <GripVertical size={14} />
        </div>
        <div className={styles.cardActions}>
          {onEdit && (
            <button
              className={styles.editBtn}
              onClick={() =>
                onEdit({
                  id,
                  title,
                  description,
                  priority,
                  dueDate,
                  labels,
                })
              }
              aria-label="Edit card"
            >
              <Edit2 size={14} />
            </button>
          )}
          {onDuplicate && (
            <button
              className={styles.duplicateBtn}
              onClick={() =>
                onDuplicate({
                  title,
                  description,
                  priority,
                  dueDate,
                  labels,
                })
              }
              aria-label="Duplicate card"
            >
              <Copy size={14} />
            </button>
          )}
          <button
            className={styles.deleteBtn}
            onClick={() => onDelete(id)}
            aria-label="Delete card"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className={styles.cardContent}>
        <h3 className={styles.cardTitle}>{title}</h3>
        {description && <p className={styles.cardDescription}>{description}</p>}
      </div>

      <div className={styles.cardMeta}>
        {dueDate && (
          <div className={styles.dueDate}>
            <Calendar size={12} />
            <span>{formatDate(dueDate)}</span>
          </div>
        )}

        {labels && labels.length > 0 && (
          <div className={styles.labels}>
            {labels.map((label, index) => (
              <span key={`${id}-label-${index}`} className={styles.label}>
                {label}
              </span>
            ))}
          </div>
        )}
      </div>

      {priority && (
        <div className={styles.cardFooter}>
          <span
            className={styles.priorityBadge}
            style={{ backgroundColor: priorityColor[priority] }}
          >
            {priority}
          </span>
        </div>
      )}
    </div>
  );
}
