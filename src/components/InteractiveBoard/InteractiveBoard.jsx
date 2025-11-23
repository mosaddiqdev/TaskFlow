import React, { useState } from "react";
import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core";
import styles from "./InteractiveBoard.module.css";

function DraggableCard() {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: "demo-card",
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={styles.card}
    >
      <div className={styles.cardLabel}>DEMO TASK</div>
      Drag me to "Done"
    </div>
  );
}

function DroppableLane({ id, title, children }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`${styles.lane} ${isOver ? styles.laneOver : ""}`}
    >
      <div className={styles.laneHeader}>{title}</div>
      {children}
    </div>
  );
}

export function InteractiveBoard() {
  const [parent, setParent] = useState("todo");

  const handleDragEnd = (event) => {
    const { over } = event;
    if (over) {
      setParent(over.id);
    }
  };

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2>Feel the Physics</h2>
      </div>

      <div className={styles.boardWrapper}>
        <DndContext onDragEnd={handleDragEnd}>
          <div className={styles.board}>
            <DroppableLane id="todo" title="TO DO">
              {parent === "todo" ? <DraggableCard /> : null}
            </DroppableLane>

            <DroppableLane id="done" title="DONE">
              {parent === "done" ? <DraggableCard /> : null}
            </DroppableLane>
          </div>
        </DndContext>
      </div>
    </section>
  );
}
