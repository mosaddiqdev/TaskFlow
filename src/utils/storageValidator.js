/**
 * Storage Validator
 * Validates and migrates stored data to ensure compatibility
 */

const STORAGE_VERSION = 1;

/**
 * Validate board structure
 */
export function validateBoard(data) {
  if (!data || typeof data !== 'object') {
    return null;
  }

  const board = {
    id: data.id || `board-${Date.now()}`,
    title: data.title || 'Untitled Board',
    description: data.description || '',
    createdAt: data.createdAt || new Date().toISOString().split('T')[0],
    lanes: Array.isArray(data.lanes) ? data.lanes.map(validateLane) : [],
  };

  return board;
}

/**
 * Validate lane structure
 */
function validateLane(lane) {
  if (!lane || typeof lane !== 'object') {
    return null;
  }

  return {
    id: lane.id || `lane-${Date.now()}`,
    title: lane.title || 'Untitled Lane',
    color: lane.color || '#a0a0a0',
    cards: Array.isArray(lane.cards) ? lane.cards.map(validateCard).filter(Boolean) : [],
  };
}

/**
 * Validate card structure
 */
function validateCard(card) {
  if (!card || typeof card !== 'object' || !card.id) {
    return null;
  }

  return {
    id: card.id,
    title: card.title || 'Untitled Card',
    description: card.description || '',
    priority: ['high', 'medium', 'low'].includes(card.priority) ? card.priority : 'medium',
    dueDate: card.dueDate || '',
    labels: Array.isArray(card.labels) ? card.labels.filter(l => typeof l === 'string') : [],
    createdAt: card.createdAt || new Date().toISOString().split('T')[0],
  };
}

/**
 * Validate projects array
 */
export function validateProjects(data) {
  if (!Array.isArray(data)) {
    return [];
  }

  return data
    .map((project) => {
      if (!project || typeof project !== 'object' || !project.id) {
        return null;
      }

      return {
        id: project.id,
        name: project.name || 'Untitled Project',
        description: project.description || '',
        createdAt: project.createdAt || new Date().toISOString().split('T')[0],
        updatedAt: project.updatedAt || new Date().toISOString().split('T')[0],
        lanes: Array.isArray(project.lanes) ? project.lanes : [],
      };
    })
    .filter(Boolean);
}

/**
 * Validate user preferences
 */
export function validatePreferences(data) {
  if (!data || typeof data !== 'object') {
    return getDefaultPreferences();
  }

  return {
    theme: ['dark', 'light'].includes(data.theme) ? data.theme : 'dark',
    viewMode: ['board', 'list'].includes(data.viewMode) ? data.viewMode : 'board',
    filterPriority: ['all', 'high', 'medium', 'low'].includes(data.filterPriority)
      ? data.filterPriority
      : 'all',
    sortBy: ['updated', 'created', 'priority', 'alphabetical'].includes(data.sortBy)
      ? data.sortBy
      : 'updated',
    searchTerm: typeof data.searchTerm === 'string' ? data.searchTerm : '',
  };
}

/**
 * Get default preferences
 */
export function getDefaultPreferences() {
  return {
    theme: 'dark',
    viewMode: 'board',
    filterPriority: 'all',
    sortBy: 'updated',
    searchTerm: '',
  };
}

/**
 * Migrate data from old versions
 */
export function migrateData(data, fromVersion = 0) {
  let migratedData = data;

  if (fromVersion < 1) {
    migratedData = validateBoard(migratedData);
  }

  return migratedData;
}

/**
 * Get storage version
 */
export function getStorageVersion() {
  return STORAGE_VERSION;
}

/**
 * Check if data needs migration
 */
export function needsMigration(storedVersion) {
  return storedVersion < STORAGE_VERSION;
}
