import { Trash2, Calendar, Tag } from 'lucide-react';
import styles from './ListView.module.css';

export function ListView({ lanes, onDeleteCard }) {
  const allCards = lanes.flatMap((lane) =>
    lane.cards.map((card) => ({
      ...card,
      laneName: lane.title,
      laneId: lane.id,
    }))
  );

  const priorityColor = {
    high: 'var(--color-accent-red)',
    medium: 'var(--color-accent-amber)',
    low: 'var(--color-accent-green)',
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className={styles.listView}>
      <div className={styles.listHeader}>
        <div className={styles.colTask}>Task</div>
        <div className={styles.colLane}>Lane</div>
        <div className={styles.colPriority}>Priority</div>
        <div className={styles.colDue}>Due Date</div>
        <div className={styles.colLabels}>Labels</div>
        <div className={styles.colAction}>Action</div>
      </div>

      <div className={styles.listBody}>
        {allCards.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No tasks yet</p>
          </div>
        ) : (
          allCards.map((card) => (
            <div key={card.id} className={styles.listRow}>
              <div className={styles.colTask}>
                <div className={styles.taskInfo}>
                  <h4 className={styles.taskTitle}>{card.title}</h4>
                  {card.description && (
                    <p className={styles.taskDesc}>{card.description}</p>
                  )}
                </div>
              </div>

              <div className={styles.colLane}>
                <span className={styles.laneBadge}>{card.laneName}</span>
              </div>

              <div className={styles.colPriority}>
                <span
                  className={styles.priorityBadge}
                  style={{ backgroundColor: priorityColor[card.priority] }}
                >
                  {card.priority}
                </span>
              </div>

              <div className={styles.colDue}>
                {card.dueDate ? (
                  <div className={styles.dueDate}>
                    <Calendar size={14} />
                    <span>{formatDate(card.dueDate)}</span>
                  </div>
                ) : (
                  <span className={styles.noData}>—</span>
                )}
              </div>

              <div className={styles.colLabels}>
                {card.labels && card.labels.length > 0 ? (
                  <div className={styles.labelsList}>
                    {card.labels.map((label) => (
                      <span key={label} className={styles.label}>
                        {label}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className={styles.noData}>—</span>
                )}
              </div>

              <div className={styles.colAction}>
                <button
                  className={styles.deleteBtn}
                  onClick={() => onDeleteCard(card.id)}
                  title="Delete task"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
