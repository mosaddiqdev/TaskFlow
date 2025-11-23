import { useDroppable } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, MoreHorizontal, Edit, Trash2, Copy, GripVertical, Edit2 } from 'lucide-react';
import { Card } from '../Card/Card';
import styles from './Lane.module.css';

export function Lane({ id, title, cards, onDeleteCard, onAddCard, onDeleteLane, onEditCard, onEditLane, onDuplicateCard, selectedCards, onSelectCard }) {
  const { setNodeRef: setDroppableRef } = useDroppable({
    id,
  });

  const {
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
    listeners,
    attributes,
  } = useSortable({ id });

  const cardIds = cards.map((card) => card.id);

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setSortableRef}
      style={style}
      className={styles.lane}
    >
      <div className={styles.laneHeader}>
        <div className={styles.dragHandle} {...listeners} {...attributes}>
          <GripVertical size={16} />
        </div>
        <div className={styles.laneInfo}>
          <h2 className={styles.laneTitle}>{title}</h2>
          <span className={styles.cardCount}>{cards.length}</span>
        </div>
        <div className={styles.laneActions}>
          {onEditLane && (
            <button
              className={styles.editLaneBtn}
              onClick={() => onEditLane({ id, title })}
              title="Edit lane"
              aria-label="Edit lane"
            >
              <Edit2 size={16} />
            </button>
          )}
          {onDeleteLane && (
            <button
              className={styles.deleteLaneBtn}
              onClick={onDeleteLane}
              title="Delete lane"
              aria-label="Delete lane"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      <SortableContext
        items={cardIds}
        strategy={verticalListSortingStrategy}
      >
        <div
          ref={setDroppableRef}
          className={styles.cardsContainer}
        >
          {cards.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No cards yet</p>
            </div>
          ) : (
            cards.map((card) => (
              <Card
                key={card.id}
                id={card.id}
                title={card.title}
                description={card.description}
                priority={card.priority}
                dueDate={card.dueDate}
                labels={card.labels}
                onDelete={onDeleteCard}
                onEdit={onEditCard}
                onDuplicate={onDuplicateCard}
                isSelected={selectedCards?.has(card.id)}
                onSelect={onSelectCard}
              />
            ))
          )}
        </div>
      </SortableContext>

      <button
        className={styles.addCardBtn}
        onClick={() => onAddCard(id)}
        aria-label="Add new card"
      >
        <Plus size={16} />
        <span>Add Card</span>
      </button>
    </div>
  );
}
