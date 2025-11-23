import { useState, useRef } from 'react';
import { Trash2 } from 'lucide-react';
import { useSwipe } from '../../hooks/useSwipe';
import styles from './SwipeCard.module.css';

/**
 * Card wrapper with swipe-to-delete functionality
 * On mobile: Swipe left to reveal delete button
 * On desktop: Hover to show delete button
 */
export function SwipeCard({ children, onDelete, cardId }) {
  const [isOpen, setIsOpen] = useState(false);
  const cardRef = useRef(null);

  useSwipe({
    element: cardRef.current,
    onSwipeLeft: () => setIsOpen(true),
    onSwipeRight: () => setIsOpen(false),
    threshold: 30,
  });

  const handleDelete = () => {
    if (onDelete) {
      onDelete(cardId);
    }
    setIsOpen(false);
  };

  return (
    <div
      ref={cardRef}
      className={`${styles.swipeContainer} ${isOpen ? styles.open : ''}`}
    >
      {/* Delete button - revealed on swipe */}
      <div className={styles.deleteAction}>
        <button
          className={styles.deleteBtn}
          onClick={handleDelete}
          aria-label="Delete card"
          title="Delete card"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* Card content */}
      <div className={styles.cardContent}>{children}</div>
    </div>
  );
}
