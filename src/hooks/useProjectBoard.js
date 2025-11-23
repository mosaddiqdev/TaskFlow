import { useState, useEffect, useCallback } from 'react';
import {
  getProjectBoard,
  saveProjectBoard,
  createDefaultBoard,
} from '../utils/projectBoardManager';

/**
 * Hook for managing per-project board data
 * Automatically loads board for the given projectId
 * Persists changes to localStorage
 */
export function useProjectBoard(projectId) {
  const [board, setBoard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!projectId) {
      setBoard(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let projectBoard = getProjectBoard(projectId);

      if (!projectBoard) {
        projectBoard = createDefaultBoard(projectId);
        saveProjectBoard(projectId, projectBoard);
      }

      setBoard(projectBoard);
    } catch (err) {
      console.error(`Error loading board for project ${projectId}:`, err);
      setError(err.message);
      const defaultBoard = createDefaultBoard(projectId);
      setBoard(defaultBoard);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  const updateBoard = useCallback(
    (updater) => {
      setBoard((prevBoard) => {
        if (!prevBoard) return prevBoard;

        const newBoard =
          typeof updater === 'function' ? updater(prevBoard) : updater;

        try {
          saveProjectBoard(projectId, newBoard);
        } catch (err) {
          console.error(`Error saving board for project ${projectId}:`, err);
          setError(err.message);
        }

        return newBoard;
      });
    },
    [projectId]
  );

  return {
    board,
    setBoard: updateBoard,
    isLoading,
    error,
  };
}
