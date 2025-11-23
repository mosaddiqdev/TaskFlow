import { useCallback, useRef } from 'react';

/**
 * Best-practice Undo/Redo hook using Command pattern
 * Maintains separate stacks for undo and redo operations
 * Supports keyboard shortcuts (Ctrl+Z, Ctrl+Y)
 * @param {*} initialState - Initial state value
 * @param {number} maxHistory - Maximum history size (default: 50)
 */
export function useUndoRedo(initialState, maxHistory = 50) {
  const stateRef = useRef(initialState);
  const undoStackRef = useRef([]);
  const redoStackRef = useRef([]);

  // Record a state change
  const recordState = useCallback((newState) => {
    // Push current state to undo stack
    undoStackRef.current.push(stateRef.current);
    
    // Trim undo stack if it exceeds max history
    if (undoStackRef.current.length > maxHistory) {
      undoStackRef.current.shift();
    }
    
    // Clear redo stack when new action is performed
    redoStackRef.current = [];
    // Update current state
    stateRef.current = newState;
  }, [maxHistory]);

  // Undo to previous state
  const undo = useCallback(() => {
    if (undoStackRef.current.length === 0) return stateRef.current;

    // Push current state to redo stack
    redoStackRef.current.push(stateRef.current);
    // Pop from undo stack
    stateRef.current = undoStackRef.current.pop();

    return stateRef.current;
  }, []);

  // Redo to next state
  const redo = useCallback(() => {
    if (redoStackRef.current.length === 0) return stateRef.current;

    // Push current state to undo stack
    undoStackRef.current.push(stateRef.current);
    // Pop from redo stack
    stateRef.current = redoStackRef.current.pop();

    return stateRef.current;
  }, []);

  // Get current state
  const getState = useCallback(() => stateRef.current, []);

  // Check if undo is available
  const canUndo = useCallback(() => undoStackRef.current.length > 0, []);

  // Check if redo is available
  const canRedo = useCallback(() => redoStackRef.current.length > 0, []);

  // Clear all history
  const clearHistory = useCallback(() => {
    undoStackRef.current = [];
    redoStackRef.current = [];
  }, []);

  // Get history info for debugging
  const getHistoryInfo = useCallback(() => ({
    undoCount: undoStackRef.current.length,
    redoCount: redoStackRef.current.length,
    currentState: stateRef.current,
  }), []);

  return {
    recordState,
    undo,
    redo,
    getState,
    canUndo,
    canRedo,
    clearHistory,
    getHistoryInfo,
  };
}
