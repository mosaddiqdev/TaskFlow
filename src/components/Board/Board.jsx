import { useState, useEffect, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Search, Plus, Filter } from "lucide-react";
import { Lane } from "../Lane/Lane";
import { Card } from "../Card/Card";
import { ListView } from "../ListView/ListView";
import { AddTaskModal } from "../AddTaskModal/AddTaskModal";
import { EditTaskModal } from "../EditTaskModal/EditTaskModal";
import { CreateLaneModal } from "../CreateLaneModal/CreateLaneModal";
import { EditLaneModal } from "../EditLaneModal/EditLaneModal";
import { ConfirmModal } from "../ConfirmModal/ConfirmModal";
import { EmptyState } from "../EmptyState/EmptyState";
import { useProjectBoard } from "../../hooks/useProjectBoard";
import styles from "./Board.module.css";

export function Board({
  projectId,
  searchTerm,
  filterPriority,
  sortBy,
  viewMode,
}) {
  const { board, setBoard, isLoading } = useProjectBoard(projectId);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [selectedCards, setSelectedCards] = useState(new Set());
  const [activeId, setActiveId] = useState(null);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [selectedLaneId, setSelectedLaneId] = useState(null);
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [isCreateLaneModalOpen, setIsCreateLaneModalOpen] = useState(false);
  const [isEditLaneModalOpen, setIsEditLaneModalOpen] = useState(false);
  const [laneToEdit, setLaneToEdit] = useState(null);
  const [isDeleteLaneModalOpen, setIsDeleteLaneModalOpen] = useState(false);
  const [laneToDelete, setLaneToDelete] = useState(null);

  useEffect(() => {
    if (board) {
      setHistory([JSON.parse(JSON.stringify(board))]);
      setHistoryIndex(0);
    }
  }, []);

  const addToHistory = useCallback(
    (newBoard) => {
      setHistory((prev) => {
        const newHistory = prev.slice(0, historyIndex + 1);
        newHistory.push(JSON.parse(JSON.stringify(newBoard)));
        return newHistory;
      });
      setHistoryIndex((prev) => prev + 1);
    },
    [historyIndex]
  );

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setBoard(JSON.parse(JSON.stringify(history[newIndex])));
    }
  }, [history, historyIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setBoard(JSON.parse(JSON.stringify(history[newIndex])));
    }
  }, [history, historyIndex]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const target = e.target;
      const tag = target.tagName;
      const isTextField =
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        target.isContentEditable;

      if (isTextField) return;

      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "y" || (e.key === "z" && e.shiftKey))
      ) {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleUndo, handleRedo]);

  const toggleCardSelection = useCallback((cardId) => {
    setSelectedCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  }, []);

  const deleteSelectedCards = useCallback(() => {
    if (selectedCards.size === 0) return;
    setBoard((prevBoard) => {
      const newBoard = JSON.parse(JSON.stringify(prevBoard));
      newBoard.lanes = newBoard.lanes.map((lane) => ({
        ...lane,
        cards: lane.cards.filter((card) => !selectedCards.has(card.id)),
      }));
      addToHistory(newBoard);
      return newBoard;
    });
    setSelectedCards(new Set());
  }, [selectedCards, addToHistory]);

  const clearSelection = useCallback(() => {
    setSelectedCards(new Set());
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      distance: 8,
      activationConstraint: {
        delay:
          typeof window !== "undefined" && window.innerWidth <= 768 ? 200 : 100,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: ({ delta }) => [delta.left, delta.top],
    })
  );

  useEffect(() => {
    const handleTouchStart = (e) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };

    const handleTouchMove = (e) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };

    document.addEventListener("touchstart", handleTouchStart, {
      passive: false,
    });
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

  const handleDragStart = (event) => {
    setActiveId(event.active.id);

    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(50); // 50ms vibration
    }
  };

  const handleDragOver = useCallback((event) => {
    const { active, over } = event;
    if (!over) return;

    setBoard((prevBoard) => {
      const newBoard = JSON.parse(JSON.stringify(prevBoard));
      let sourceCard = null;
      let sourceLaneIdx = -1;
      let sourceCardIdx = -1;
      let targetLaneIdx = -1;

      for (let i = 0; i < newBoard.lanes.length; i++) {
        const cardIdx = newBoard.lanes[i].cards.findIndex(
          (c) => c.id === active.id
        );
        if (cardIdx !== -1) {
          sourceCard = newBoard.lanes[i].cards[cardIdx];
          sourceLaneIdx = i;
          sourceCardIdx = cardIdx;
          break;
        }
      }

      if (!sourceCard) return prevBoard;

      for (let i = 0; i < newBoard.lanes.length; i++) {
        if (newBoard.lanes[i].id === over.id) {
          targetLaneIdx = i;
          break;
        }
        const cardIdx = newBoard.lanes[i].cards.findIndex(
          (c) => c.id === over.id
        );
        if (cardIdx !== -1) {
          targetLaneIdx = i;
          break;
        }
      }

      if (targetLaneIdx === -1) return prevBoard;
      if (
        sourceLaneIdx === targetLaneIdx &&
        sourceCardIdx ===
          newBoard.lanes[targetLaneIdx].cards.findIndex(
            (c) => c.id === active.id
          )
      ) {
        return prevBoard;
      }

      newBoard.lanes[sourceLaneIdx].cards.splice(sourceCardIdx, 1);

      newBoard.lanes[targetLaneIdx].cards.push(sourceCard);

      return newBoard;
    });
  }, []);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (active.id !== over?.id && over?.id) {
      const activeIsLane = board.lanes.some((lane) => lane.id === active.id);
      const overIsLane = board.lanes.some((lane) => lane.id === over.id);

      if (activeIsLane && overIsLane) {
        setBoard((prevBoard) => {
          const newBoard = JSON.parse(JSON.stringify(prevBoard));
          const activeIdx = newBoard.lanes.findIndex(
            (lane) => lane.id === active.id
          );
          const overIdx = newBoard.lanes.findIndex(
            (lane) => lane.id === over.id
          );

          if (activeIdx !== -1 && overIdx !== -1) {
            [newBoard.lanes[activeIdx], newBoard.lanes[overIdx]] = [
              newBoard.lanes[overIdx],
              newBoard.lanes[activeIdx],
            ];
          }

          return newBoard;
        });
      }
    }
  };

  const handleDeleteCard = useCallback(
    (cardId) => {
      setBoard((prevBoard) => {
        const newBoard = JSON.parse(JSON.stringify(prevBoard));
        newBoard.lanes = newBoard.lanes.map((lane) => ({
          ...lane,
          cards: lane.cards.filter((card) => card.id !== cardId),
        }));
        addToHistory(newBoard);
        return newBoard;
      });
    },
    [addToHistory]
  );

  const handleAddCard = useCallback((laneId) => {
    setSelectedLaneId(laneId);
    setIsAddTaskModalOpen(true);
  }, []);

  const handleAddTaskFromModal = useCallback(
    (laneId, newTask) => {
      setBoard((prevBoard) => {
        const newBoard = JSON.parse(JSON.stringify(prevBoard));
        const laneIndex = newBoard.lanes.findIndex(
          (lane) => lane.id === laneId
        );
        if (laneIndex !== -1) {
          newBoard.lanes[laneIndex].cards.push(newTask);
        }
        addToHistory(newBoard);
        return newBoard;
      });
    },
    [addToHistory]
  );

  const handleCreateLane = useCallback(
    (laneName) => {
      setBoard((prevBoard) => {
        const newBoard = JSON.parse(JSON.stringify(prevBoard));
        const newLane = {
          id: `lane-${Date.now()}`,
          title: laneName,
          cards: [],
        };
        newBoard.lanes.push(newLane);
        addToHistory(newBoard);
        return newBoard;
      });
    },
    [addToHistory]
  );

  const handleDeleteLane = useCallback(() => {
    if (!laneToDelete) return;
    setBoard((prevBoard) => {
      const newBoard = JSON.parse(JSON.stringify(prevBoard));
      newBoard.lanes = newBoard.lanes.filter(
        (lane) => lane.id !== laneToDelete
      );
      addToHistory(newBoard);
      return newBoard;
    });
    setLaneToDelete(null);
  }, [laneToDelete, addToHistory]);

  const handleUpdateTask = useCallback(
    (cardId, updatedTask) => {
      setBoard((prevBoard) => {
        const newBoard = JSON.parse(JSON.stringify(prevBoard));
        let found = false;
        for (let i = 0; i < newBoard.lanes.length; i++) {
          const cardIndex = newBoard.lanes[i].cards.findIndex(
            (card) => card.id === cardId
          );
          if (cardIndex !== -1) {
            newBoard.lanes[i].cards[cardIndex] = updatedTask;
            found = true;
            break;
          }
        }
        if (found) {
          addToHistory(newBoard);
        }
        return found ? newBoard : prevBoard;
      });
    },
    [addToHistory]
  );

  const handleUpdateLane = useCallback(
    (laneId, newTitle) => {
      setBoard((prevBoard) => {
        const newBoard = JSON.parse(JSON.stringify(prevBoard));
        const laneIndex = newBoard.lanes.findIndex(
          (lane) => lane.id === laneId
        );
        if (laneIndex !== -1) {
          newBoard.lanes[laneIndex].title = newTitle;
        }
        addToHistory(newBoard);
        return newBoard;
      });
    },
    [addToHistory]
  );

  const handleDuplicateCard = useCallback(
    (laneId, cardData) => {
      setBoard((prevBoard) => {
        const newBoard = JSON.parse(JSON.stringify(prevBoard));
        const laneIndex = newBoard.lanes.findIndex(
          (lane) => lane.id === laneId
        );
        if (laneIndex !== -1) {
          const newCard = {
            id: `task-${Date.now()}`,
            title: cardData.title,
            description: cardData.description,
            priority: cardData.priority,
            dueDate: cardData.dueDate,
            labels: cardData.labels,
            createdAt: new Date().toISOString().split("T")[0],
          };
          newBoard.lanes[laneIndex].cards.push(newCard);
        }
        addToHistory(newBoard);
        return newBoard;
      });
    },
    [addToHistory]
  );

  if (!projectId) {
    return (
      <div className={styles.boardContainer}>
        <EmptyState type="board" />
      </div>
    );
  }

  if (isLoading || !board) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
      </div>
    );
  }

  const laneIds = board.lanes.map((lane) => lane.id);
  const activeCard = board.lanes
    .flatMap((lane) => lane.cards)
    .find((card) => card.id === activeId);

  const getFilteredLanes = () => {
    return board.lanes.map((lane) => {
      let filteredCards = lane.cards;

      if (searchTerm) {
        filteredCards = filteredCards.filter(
          (card) =>
            card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            card.description?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      if (filterPriority !== "all") {
        filteredCards = filteredCards.filter(
          (card) => card.priority === filterPriority
        );
      }

      return { ...lane, cards: filteredCards };
    });
  };

  const filteredLanes = getFilteredLanes();

  const isMobile = typeof window !== "undefined" && window.innerWidth <= 768;
  const shouldShowList = viewMode === "list" && !isMobile;

  const hasLanes = board.lanes && board.lanes.length > 0;
  const hasCards = filteredLanes.some((lane) => lane.cards.length > 0);

  if (shouldShowList) {
    return (
      <div className={styles.boardContainer}>
        {hasCards ? (
          <ListView lanes={filteredLanes} onDeleteCard={handleDeleteCard} />
        ) : (
          <EmptyState type="search" />
        )}
      </div>
    );
  }

  if (!hasLanes) {
    return (
      <>
        <div className={styles.boardContainer}>
          <EmptyState
            type="board"
            onAction={() => setIsCreateLaneModalOpen(true)}
          />
        </div>

        <CreateLaneModal
          isOpen={isCreateLaneModalOpen}
          onClose={() => setIsCreateLaneModalOpen(false)}
          onCreate={handleCreateLane}
          existingLanes={board.lanes}
        />
      </>
    );
  }

  return (
    <div className={styles.boardContainer}>
      {selectedCards.size > 0 && (
        <div className={styles.bulkActionsBar}>
          <span className={styles.bulkActionsText}>
            {selectedCards.size} card{selectedCards.size !== 1 ? "s" : ""}{" "}
            selected (Ctrl+Click to select)
          </span>
          <div className={styles.bulkActionsButtons}>
            <button
              className={styles.bulkDeleteBtn}
              onClick={deleteSelectedCards}
              title="Delete selected cards"
            >
              Delete
            </button>
            <button
              className={styles.bulkClearBtn}
              onClick={clearSelection}
              title="Clear selection"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className={styles.boardContent}>
          <SortableContext
            items={laneIds}
            strategy={horizontalListSortingStrategy}
          >
            {filteredLanes.map((lane) => (
              <Lane
                key={lane.id}
                id={lane.id}
                title={lane.title}
                cards={lane.cards}
                onDeleteCard={handleDeleteCard}
                onAddCard={handleAddCard}
                onEditCard={(card) => {
                  setTaskToEdit(card);
                  setIsEditTaskModalOpen(true);
                }}
                onDuplicateCard={(cardData) =>
                  handleDuplicateCard(lane.id, cardData)
                }
                selectedCards={selectedCards}
                onSelectCard={toggleCardSelection}
                onEditLane={(lane) => {
                  setLaneToEdit(lane);
                  setIsEditLaneModalOpen(true);
                }}
                onDeleteLane={() => {
                  setLaneToDelete(lane.id);
                  setIsDeleteLaneModalOpen(true);
                }}
              />
            ))}
          </SortableContext>

          {/* Create Lane Button */}
          <button
            className={styles.createLaneBtn}
            onClick={() => setIsCreateLaneModalOpen(true)}
            title="Create new lane"
          >
            <Plus size={20} />
            <span>Add Lane</span>
          </button>
        </div>

        <DragOverlay
          dropAnimation={{
            duration: 200,
            easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
          }}
        >
          {activeCard ? (
            <div
              style={{
                width: "300px",
                pointerEvents: "none",
                opacity: 0.98,
                filter: "drop-shadow(0 15px 35px rgba(0, 0, 0, 0.6))",
                transform: "scale(1.02)",
              }}
            >
              <Card
                id={activeCard.id}
                title={activeCard.title}
                description={activeCard.description}
                priority={activeCard.priority}
                dueDate={activeCard.dueDate}
                labels={activeCard.labels}
                onDelete={() => {}}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        laneId={selectedLaneId}
        onAddTask={handleAddTaskFromModal}
      />

      <EditTaskModal
        isOpen={isEditTaskModalOpen}
        onClose={() => {
          setIsEditTaskModalOpen(false);
          setTaskToEdit(null);
        }}
        task={taskToEdit}
        onUpdateTask={handleUpdateTask}
      />

      <CreateLaneModal
        isOpen={isCreateLaneModalOpen}
        onClose={() => setIsCreateLaneModalOpen(false)}
        onCreate={handleCreateLane}
        existingLanes={board.lanes}
      />

      <EditLaneModal
        isOpen={isEditLaneModalOpen}
        onClose={() => {
          setIsEditLaneModalOpen(false);
          setLaneToEdit(null);
        }}
        lane={laneToEdit}
        onUpdateLane={handleUpdateLane}
        existingLanes={board.lanes}
      />

      <ConfirmModal
        isOpen={isDeleteLaneModalOpen}
        onClose={() => {
          setIsDeleteLaneModalOpen(false);
          setLaneToDelete(null);
        }}
        title="Delete Lane"
        message="Are you sure you want to delete this lane? All tasks in this lane will be deleted. This action cannot be undone."
        confirmText="Delete Lane"
        cancelText="Cancel"
        isDangerous={true}
        onConfirm={handleDeleteLane}
      />
    </div>
  );
}
