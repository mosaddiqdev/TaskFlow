/**
 * Project Board Manager
 * Manages per-project board data in localStorage
 * Each project has its own board with lanes and cards
 */

const BOARD_PREFIX = 'taskflow-board-';
const BOARD_VERSION = 1;

/**
 * Get board key for a project
 */
function getBoardKey(projectId) {
  if (!projectId) {
    throw new Error('Project ID is required');
  }
  return `${BOARD_PREFIX}${projectId}`;
}

/**
 * Create default board for a project
 */
export function createDefaultBoard(projectId, projectName = 'Untitled Project') {
  if (!projectId) {
    throw new Error('Project ID is required');
  }

  return {
    id: `board-${projectId}`,
    projectId: projectId,
    title: projectName,
    description: '',
    createdAt: new Date().toISOString().split('T')[0],
    updatedAt: new Date().toISOString().split('T')[0],
    lanes: [
      {
        id: `lane-${projectId}-1`,
        title: 'Backlog',
        color: '#6b6b6b',
        cards: [],
      },
      {
        id: `lane-${projectId}-2`,
        title: 'To Do',
        color: '#a0a0a0',
        cards: [],
      },
      {
        id: `lane-${projectId}-3`,
        title: 'In Progress',
        color: '#f59e0b',
        cards: [],
      },
      {
        id: `lane-${projectId}-4`,
        title: 'Done',
        color: '#10b981',
        cards: [],
      },
    ],
  };
}

/**
 * Get board for a project
 */
export function getProjectBoard(projectId) {
  try {
    const key = getBoardKey(projectId);
    const stored = localStorage.getItem(key);

    if (!stored) {
      return null;
    }

    const board = JSON.parse(stored);

    if (!board.id || !Array.isArray(board.lanes)) {
      console.warn(`Invalid board structure for project ${projectId}`);
      return null;
    }

    return board;
  } catch (error) {
    console.error(`Error getting board for project ${projectId}:`, error);
    return null;
  }
}

/**
 * Save board for a project
 */
export function saveProjectBoard(projectId, board) {
  try {
    if (!projectId) {
      throw new Error('Project ID is required');
    }

    if (!board || typeof board !== 'object') {
      throw new Error('Board must be an object');
    }

    if (!board.id || !Array.isArray(board.lanes)) {
      throw new Error('Invalid board structure');
    }

    const key = getBoardKey(projectId);
    const boardToSave = {
      ...board,
      projectId: projectId,
      updatedAt: new Date().toISOString().split('T')[0],
    };

    try {
      localStorage.setItem(key, JSON.stringify(boardToSave));
      return { success: true };
    } catch (storageError) {
      if (storageError.name === 'QuotaExceededError') {
        console.error('localStorage quota exceeded');
        return { 
          success: false, 
          error: 'Storage limit reached. Please export your board or delete old data.' 
        };
      }
      throw storageError;
    }
  } catch (error) {
    console.error(`Error saving board for project ${projectId}:`, error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete board for a project
 */
export function deleteProjectBoard(projectId) {
  try {
    const key = getBoardKey(projectId);
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error deleting board for project ${projectId}:`, error);
    return false;
  }
}

/**
 * Get all project boards
 */
export function getAllProjectBoards() {
  try {
    const boards = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(BOARD_PREFIX)) {
        const projectId = key.replace(BOARD_PREFIX, '');
        const stored = localStorage.getItem(key);
        if (stored) {
          try {
            boards[projectId] = JSON.parse(stored);
          } catch (parseError) {
            console.warn(`Skipping invalid board data for key ${key}`, parseError);
            // Continue to next item instead of failing entirely
          }
        }
      }
    }
    return boards;
  } catch (error) {
    console.error('Error getting all project boards:', error);
    return {};
  }
}

/**
 * Clear all project boards
 */
export function clearAllProjectBoards() {
  try {
    const keysToDelete = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(BOARD_PREFIX)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach((key) => localStorage.removeItem(key));
    return true;
  } catch (error) {
    console.error('Error clearing all project boards:', error);
    return false;
  }
}

/**
 * Import board for a project
 * @param {string} projectId - Project ID
 * @param {Object} importedBoard - Board to import
 * @param {string} mode - 'replace' or 'merge'
 */
export function importBoardForProject(projectId, importedBoard, mode = 'replace') {
  try {
    if (!projectId || !importedBoard) {
      throw new Error('Project ID and board data are required');
    }

    if (mode === 'replace') {
      const boardToSave = {
        ...importedBoard,
        projectId: projectId,
        id: `board-${projectId}`,
        updatedAt: new Date().toISOString().split('T')[0],
      };
      return saveProjectBoard(projectId, boardToSave);
    } else if (mode === 'merge') {
      const existingBoard = getProjectBoard(projectId);
      if (!existingBoard) {
        return importBoardForProject(projectId, importedBoard, 'replace');
      }

      const existingLaneIds = new Set(existingBoard.lanes.map((l) => l.id));
      const newLanes = importedBoard.lanes.filter((l) => !existingLaneIds.has(l.id));

      const mergedBoard = {
        ...existingBoard,
        lanes: [...existingBoard.lanes, ...newLanes],
        updatedAt: new Date().toISOString().split('T')[0],
      };

      return saveProjectBoard(projectId, mergedBoard);
    } else {
      throw new Error(`Unknown import mode: ${mode}`);
    }
  } catch (error) {
    console.error(`Error importing board for project ${projectId}:`, error);
    return false;
  }
}

/**
 * Export board for a project
 */
export function exportBoardForProject(projectId) {
  try {
    const board = getProjectBoard(projectId);
    if (!board) {
      throw new Error(`No board found for project ${projectId}`);
    }
    return board;
  } catch (error) {
    console.error(`Error exporting board for project ${projectId}:`, error);
    return null;
  }
}

/**
 * Duplicate board from one project to another
 */
export function duplicateBoardBetweenProjects(sourceProjectId, targetProjectId) {
  try {
    const sourceBoard = getProjectBoard(sourceProjectId);
    if (!sourceBoard) {
      throw new Error(`No board found for source project ${sourceProjectId}`);
    }

    const duplicatedBoard = {
      ...JSON.parse(JSON.stringify(sourceBoard)),
      projectId: targetProjectId,
      id: `board-${targetProjectId}`,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };

    return saveProjectBoard(targetProjectId, duplicatedBoard);
  } catch (error) {
    console.error(
      `Error duplicating board from ${sourceProjectId} to ${targetProjectId}:`,
      error
    );
    return false;
  }
}

/**
 * Get board statistics
 */
export function getBoardStats(projectId) {
  try {
    const board = getProjectBoard(projectId);
    if (!board) {
      return null;
    }

    const stats = {
      projectId: projectId,
      laneCount: board.lanes.length,
      cardCount: board.lanes.reduce((sum, lane) => sum + (lane.cards?.length || 0), 0),
      lanes: board.lanes.map((lane) => ({
        id: lane.id,
        title: lane.title,
        cardCount: lane.cards?.length || 0,
      })),
    };

    return stats;
  } catch (error) {
    console.error(`Error getting board stats for project ${projectId}:`, error);
    return null;
  }
}
