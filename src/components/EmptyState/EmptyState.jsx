import { InboxIcon, Plus } from 'lucide-react';
import styles from './EmptyState.module.css';

export function EmptyState({ type, onAction }) {
  const states = {
    board: {
      icon: InboxIcon,
      title: 'No Lanes Yet',
      message: 'Create your first lane to get started',
      action: 'Create Lane',
    },
    lane: {
      icon: Plus,
      title: 'No Tasks Yet',
      message: 'Add a task to this lane to get started',
      action: 'Add Task',
    },
    search: {
      icon: InboxIcon,
      title: 'No Results Found',
      message: 'Try adjusting your search or filters',
      action: null,
    },
  };

  const state = states[type] || states.lane;
  const Icon = state.icon;

  return (
    <div className={styles.emptyState}>
      <Icon size={48} className={styles.icon} />
      <h3 className={styles.title}>{state.title}</h3>
      <p className={styles.message}>{state.message}</p>
      {state.action && (
        <button 
          className={styles.actionBtn} 
          onClick={onAction}
          type="button"
        >
          {state.action}
        </button>
      )}
    </div>
  );
}
