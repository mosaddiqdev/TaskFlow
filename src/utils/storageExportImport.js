/**
 * Storage Export/Import Utilities
 * Handle exporting and importing board data as JSON with comprehensive error handling
 */

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const SUPPORTED_VERSIONS = [1];

/**
 * Validate export data structure
 */
function validateExportData(data) {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid data structure');
  }
  if (!data.version || !SUPPORTED_VERSIONS.includes(data.version)) {
    throw new Error(`Unsupported version: ${data.version}`);
  }
  return true;
}

/**
 * Generate safe filename
 */
function generateFileName(prefix) {
  const timestamp = new Date().toISOString().split('T')[0];
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}-${timestamp}-${random}.json`;
}

/**
 * Safely trigger file download
 */
function triggerDownload(dataStr, fileName) {
  try {
    const dataBlob = new Blob([dataStr], { type: 'application/json; charset=utf-8' });
    
    // Check file size
    if (dataBlob.size > MAX_FILE_SIZE) {
      throw new Error(`File size exceeds maximum limit (${MAX_FILE_SIZE / 1024 / 1024}MB)`);
    }

    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  } catch (error) {
    throw new Error(`Download failed: ${error.message}`);
  }
}

/**
 * Export board as JSON file
 * @param {Object} board - Board object to export
 * @param {string} fileName - Optional file name
 */
export function exportBoardAsJSON(board, fileName = null) {
  if (!board || typeof board !== 'object') {
    throw new Error('Board data is required and must be an object');
  }

  if (!board.id || !board.lanes) {
    throw new Error('Invalid board structure: missing id or lanes');
  }

  const exportData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    type: 'board',
    board: board,
  };

  try {
    const dataStr = JSON.stringify(exportData, null, 2);
    const finalFileName = fileName || generateFileName('taskflow-board');
    triggerDownload(dataStr, finalFileName);
    return { success: true, fileName: finalFileName };
  } catch (error) {
    throw new Error(`Board export failed: ${error.message}`);
  }
}

/**
 * Export projects as JSON file
 * @param {Array} projects - Projects array to export
 * @param {string} fileName - Optional file name
 */
export function exportProjectsAsJSON(projects, fileName = null) {
  if (!Array.isArray(projects)) {
    throw new Error('Projects must be an array');
  }

  if (projects.length === 0) {
    throw new Error('No projects to export');
  }

  // Validate each project
  projects.forEach((project, index) => {
    if (!project.id || !project.name) {
      throw new Error(`Invalid project at index ${index}: missing id or name`);
    }
  });

  const exportData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    type: 'projects',
    projectCount: projects.length,
    projects: projects,
  };

  try {
    const dataStr = JSON.stringify(exportData, null, 2);
    const finalFileName = fileName || generateFileName('taskflow-projects');
    triggerDownload(dataStr, finalFileName);
    return { success: true, fileName: finalFileName, count: projects.length };
  } catch (error) {
    throw new Error(`Projects export failed: ${error.message}`);
  }
}

/**
 * Export everything (board + projects + preferences)
 * @param {Object} data - Data object containing board, projects, preferences
 * @param {string} fileName - Optional file name
 */
export function exportAllAsJSON(data, fileName = null) {
  if (!data || typeof data !== 'object') {
    throw new Error('Data is required and must be an object');
  }

  // Validate data structure
  if (!data.board || !Array.isArray(data.projects) || !data.preferences) {
    throw new Error('Invalid backup structure: missing board, projects, or preferences');
  }

  if (!data.board.id || !data.board.lanes) {
    throw new Error('Invalid board in backup: missing id or lanes');
  }

  const exportData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    type: 'full-backup',
    metadata: {
      boardId: data.board.id,
      boardTitle: data.board.title,
      projectCount: data.projects.length,
      laneCount: data.board.lanes.length,
      cardCount: data.board.lanes.reduce((sum, lane) => sum + (lane.cards?.length || 0), 0),
    },
    board: data.board,
    projects: data.projects,
    preferences: data.preferences,
  };

  try {
    const dataStr = JSON.stringify(exportData, null, 2);
    const finalFileName = fileName || generateFileName('taskflow-backup');
    triggerDownload(dataStr, finalFileName);
    return { success: true, fileName: finalFileName, metadata: exportData.metadata };
  } catch (error) {
    throw new Error(`Full backup export failed: ${error.message}`);
  }
}

/**
 * Validate file before reading
 */
function validateFile(file) {
  if (!file) {
    throw new Error('No file selected');
  }

  if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
    throw new Error('Please select a valid JSON file (.json)');
  }

  if (file.size === 0) {
    throw new Error('File is empty');
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds maximum limit (${MAX_FILE_SIZE / 1024 / 1024}MB)`);
  }
}

/**
 * Read file as text
 */
function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        resolve(event.target.result);
      } catch (error) {
        reject(new Error(`Failed to read file: ${error.message}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.onabort = () => {
      reject(new Error('File reading was aborted'));
    };

    reader.readAsText(file);
  });
}

/**
 * Import board from JSON file
 * @param {File} file - JSON file to import
 * @returns {Promise<Object>} Imported board data
 */
export async function importBoardFromJSON(file) {
  try {
    validateFile(file);
    const fileContent = await readFileAsText(file);

    let data;
    try {
      data = JSON.parse(fileContent);
    } catch (error) {
      throw new Error(`Invalid JSON format: ${error.message}`);
    }

    validateExportData(data);

    if (!data.board || typeof data.board !== 'object') {
      throw new Error('Invalid board file format: missing or invalid board data');
    }

    if (!data.board.id || !Array.isArray(data.board.lanes)) {
      throw new Error('Invalid board structure: missing id or lanes');
    }

    return {
      success: true,
      board: data.board,
      importedAt: new Date().toISOString(),
    };
  } catch (error) {
    throw new Error(`Board import failed: ${error.message}`);
  }
}

/**
 * Import projects from JSON file
 * @param {File} file - JSON file to import
 * @returns {Promise<Object>} Import result with projects array
 */
export async function importProjectsFromJSON(file) {
  try {
    validateFile(file);
    const fileContent = await readFileAsText(file);

    let data;
    try {
      data = JSON.parse(fileContent);
    } catch (error) {
      throw new Error(`Invalid JSON format: ${error.message}`);
    }

    validateExportData(data);

    if (!Array.isArray(data.projects)) {
      throw new Error('Invalid projects file format: projects must be an array');
    }

    if (data.projects.length === 0) {
      throw new Error('No projects found in file');
    }

    // Validate each project
    data.projects.forEach((project, index) => {
      if (!project.id || !project.name) {
        throw new Error(`Invalid project at index ${index}: missing id or name`);
      }
    });

    return {
      success: true,
      projects: data.projects,
      count: data.projects.length,
      importedAt: new Date().toISOString(),
    };
  } catch (error) {
    throw new Error(`Projects import failed: ${error.message}`);
  }
}

/**
 * Import all data from JSON file
 * @param {File} file - JSON file to import
 * @returns {Promise<Object>} Imported data with board, projects, preferences
 */
export async function importAllFromJSON(file) {
  try {
    validateFile(file);
    const fileContent = await readFileAsText(file);

    let data;
    try {
      data = JSON.parse(fileContent);
    } catch (error) {
      throw new Error(`Invalid JSON format: ${error.message}`);
    }

    validateExportData(data);

    // Validate structure
    if (!data.board || !Array.isArray(data.projects) || !data.preferences) {
      throw new Error('Invalid backup file: missing board, projects, or preferences');
    }

    if (!data.board.id || !Array.isArray(data.board.lanes)) {
      throw new Error('Invalid board in backup: missing id or lanes');
    }

    // Validate projects
    data.projects.forEach((project, index) => {
      if (!project.id || !project.name) {
        throw new Error(`Invalid project at index ${index}: missing id or name`);
      }
    });

    // Validate preferences
    if (typeof data.preferences !== 'object') {
      throw new Error('Invalid preferences in backup');
    }

    return {
      success: true,
      board: data.board,
      projects: data.projects,
      preferences: data.preferences,
      metadata: data.metadata || {},
      importedAt: new Date().toISOString(),
    };
  } catch (error) {
    throw new Error(`Full backup import failed: ${error.message}`);
  }
}

/**
 * Create a file input element and trigger file selection
 * @returns {Promise<File>} Selected file
 */
export function selectFile() {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = (event) => {
      const file = event.target.files?.[0];
      if (file) {
        resolve(file);
      } else {
        reject(new Error('No file selected'));
      }
    };

    input.click();
  });
}
