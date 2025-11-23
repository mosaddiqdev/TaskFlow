import { useLocalStorage as useLocalStorageBase } from 'usehooks-ts';
import {
  validateBoard,
  validateProjects,
  validatePreferences,
  migrateData,
  needsMigration,
  getStorageVersion,
} from '../utils/storageValidator';

/**
 * Enhanced useLocalStorage hook with validation and migration
 * Validates data on load and handles corrupted/outdated data gracefully
 */
export function useLocalStorageWithValidation(key, initialValue, validator = null) {
  const [storedValue, setStoredValue, removeValue] = useLocalStorageBase(key, initialValue);

  const validatedValue = (() => {
    try {
      if (!storedValue || storedValue === initialValue) {
        return initialValue;
      }

      if (validator && typeof validator === 'function') {
        return validator(storedValue) || initialValue;
      }

      return storedValue;
    } catch (error) {
      console.error(`Error validating ${key}:`, error);
      return initialValue;
    }
  })();

  return [validatedValue, setStoredValue, removeValue];
}

/**
 * Hook for persisting board state with validation
 */
export function useLocalStorageBoard(key = 'taskflow-board', initialValue = null) {
  const [storedBoard, setStoredBoard, removeBoard] = useLocalStorageBase(key, initialValue);

  const validatedBoard = (() => {
    try {
      if (!storedBoard) return initialValue;

      const version = localStorage.getItem(`${key}-version`) || 0;
      let boardData = storedBoard;

      if (needsMigration(version)) {
        boardData = migrateData(boardData, version);
        localStorage.setItem(`${key}-version`, getStorageVersion());
      }

      return validateBoard(boardData) || initialValue;
    } catch (error) {
      console.error('Error validating board:', error);
      return initialValue;
    }
  })();

  const setBoard = (value) => {
    try {
      const boardToStore = typeof value === 'function' ? value(validatedBoard) : value;
      const validatedData = validateBoard(boardToStore);
      if (validatedData) {
        try {
          setStoredBoard(validatedData);
          localStorage.setItem(`${key}-version`, getStorageVersion());
        } catch (storageError) {
          if (storageError.name === 'QuotaExceededError') {
            alert('Storage limit reached. Please export your data or clear old projects.');
            console.error('localStorage quota exceeded');
          } else {
            throw storageError;
          }
        }
      }
    } catch (error) {
      console.error('Error setting board:', error);
    }
  };

  return [validatedBoard, setBoard, removeBoard];
}

/**
 * Hook for persisting projects with validation
 */
export function useLocalStorageProjects(key = 'taskflow-projects', initialValue = []) {
  const [storedProjects, setStoredProjects, removeProjects] = useLocalStorageBase(
    key,
    initialValue
  );

  const validatedProjects = (() => {
    try {
      if (!storedProjects) return initialValue;

      const version = localStorage.getItem(`${key}-version`) || 0;
      let projectsData = storedProjects;

      if (needsMigration(version)) {
        projectsData = migrateData(projectsData, version);
        localStorage.setItem(`${key}-version`, getStorageVersion());
      }

      return validateProjects(projectsData) || initialValue;
    } catch (error) {
      console.error('Error validating projects:', error);
      return initialValue;
    }
  })();

  const setProjects = (value) => {
    try {
      const projectsToStore = typeof value === 'function' ? value(validatedProjects) : value;
      const validatedData = validateProjects(projectsToStore);
      try {
        setStoredProjects(validatedData);
        localStorage.setItem(`${key}-version`, getStorageVersion());
      } catch (storageError) {
        if (storageError.name === 'QuotaExceededError') {
          alert('Storage limit reached. Please export your data or delete old projects.');
          console.error('localStorage quota exceeded');
        } else {
          throw storageError;
        }
      }
    } catch (error) {
      console.error('Error setting projects:', error);
    }
  };

  return [validatedProjects, setProjects, removeProjects];
}

/**
 * Hook for persisting user preferences with validation
 */
export function useLocalStoragePreferences(key = 'taskflow-preferences', initialValue = null) {
  const defaultPrefs = initialValue || {
    theme: 'dark',
    viewMode: 'board',
    filterPriority: 'all',
    sortBy: 'updated',
    searchTerm: '',
  };

  const [storedPrefs, setStoredPrefs, removePrefs] = useLocalStorageBase(key, defaultPrefs);

  const validatedPrefs = (() => {
    try {
      if (!storedPrefs) return defaultPrefs;
      return validatePreferences(storedPrefs) || defaultPrefs;
    } catch (error) {
      console.error('Error validating preferences:', error);
      return defaultPrefs;
    }
  })();

  const setPreferences = (value) => {
    try {
      const prefsToStore = typeof value === 'function' ? value(validatedPrefs) : value;
      const validatedData = validatePreferences(prefsToStore);
      try {
        setStoredPrefs(validatedData);
      } catch (storageError) {
        if (storageError.name === 'QuotaExceededError') {
          alert('Storage limit reached. Your preferences could not be saved.');
          console.error('localStorage quota exceeded');
        } else {
          throw storageError;
        }
      }
    } catch (error) {
      console.error('Error setting preferences:', error);
    }
  };

  return [validatedPrefs, setPreferences, removePrefs];
}

/**
 * Clear all TaskFlow data from localStorage
 */
export function clearAllTaskFlowData() {
  try {
    localStorage.removeItem('taskflow-board');
    localStorage.removeItem('taskflow-board-version');
    localStorage.removeItem('taskflow-projects');
    localStorage.removeItem('taskflow-projects-version');
    localStorage.removeItem('taskflow-preferences');
  } catch (error) {
    console.error('Error clearing TaskFlow data:', error);
  }
}

/**
 * Get all TaskFlow data from localStorage
 */
export function getAllTaskFlowData() {
  try {
    const board = localStorage.getItem('taskflow-board');
    const projects = localStorage.getItem('taskflow-projects');
    const preferences = localStorage.getItem('taskflow-preferences');

    return {
      board: board ? JSON.parse(board) : null,
      projects: projects ? JSON.parse(projects) : [],
      preferences: preferences ? JSON.parse(preferences) : null,
    };
  } catch (error) {
    console.error('Error retrieving TaskFlow data:', error);
    return {
      board: null,
      projects: [],
      preferences: null,
    };
  }
}
