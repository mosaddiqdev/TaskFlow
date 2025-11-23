import { useState, useEffect } from "react";
import { Sidebar } from "../../components/Sidebar/Sidebar";
import { Header } from "../../components/Header/Header";
import { Board } from "../../components/Board/Board";
import { ProjectModal } from "../../components/ProjectModal/ProjectModal";
import { SettingsModal } from "../../components/SettingsModal/SettingsModal";
import {
  useLocalStorageProjects,
  useLocalStoragePreferences,
  clearAllTaskFlowData,
} from "../../hooks/useLocalStorageWithValidation";
import { validateBoard, validateProjects } from "../../utils/storageValidator";
import {
  importBoardForProject,
  clearAllProjectBoards,
} from "../../utils/projectBoardManager";
import "../../App.css";
import "../../styles/mobile.css";

export const Dashboard = () => {
  const [projects, setProjects, removeProjects] = useLocalStorageProjects(
    "taskflow-projects",
    []
  );
  const [preferences, setPreferences, removePreferences] =
    useLocalStoragePreferences("taskflow-preferences");

  const [activeProjectId, setActiveProjectId] = useState(
    projects.length > 0 ? projects[0].id : null
  );
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [projectModalMode, setProjectModalMode] = useState("create");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [importMode, setImportMode] = useState("replace");

  useEffect(() => {
    if (
      projects.length > 0 &&
      !projects.find((p) => p.id === activeProjectId)
    ) {
      setActiveProjectId(projects[0].id);
    } else if (projects.length === 0) {
      setActiveProjectId(null);
    }
  }, [projects, activeProjectId]);

  const activeProject = projects.find((p) => p.id === activeProjectId);

  const handleProjectSubmit = (projectData) => {
    if (projectModalMode === "create") {
      const newId = `proj-${Date.now()}`;
      const newProject = {
        id: newId,
        name: projectData.name,
        description: projectData.description,
        lanes: [],
        createdAt: new Date().toLocaleDateString(),
      };
      setProjects([...projects, newProject]);
      setActiveProjectId(newId);
    } else {
      setProjects(
        projects.map((p) =>
          p.id === activeProjectId
            ? {
                ...p,
                name: projectData.name,
                description: projectData.description,
              }
            : p
        )
      );
    }
  };

  const handleDeleteProject = (projectId) => {
    const filtered = projects.filter((p) => p.id !== projectId);
    setProjects(filtered);
    if (activeProjectId === projectId && filtered.length > 0) {
      setActiveProjectId(filtered[0].id);
    }
  };

  const handleImportBoard = (importedBoard) => {
    const validatedBoard = validateBoard(importedBoard);
    if (validatedBoard) {
      importBoardForProject(activeProjectId, validatedBoard, importMode);
    }
  };

  const handleImportProjects = (importedProjects) => {
    const validatedProjects = validateProjects(importedProjects);
    if (validatedProjects.length > 0) {
      if (importMode === "merge") {
        const existingIds = new Set(projects.map((p) => p.id));
        const newProjects = validatedProjects.filter(
          (p) => !existingIds.has(p.id)
        );
        setProjects([...projects, ...newProjects]);
      } else {
        setProjects(validatedProjects);
      }
    }
  };

  const handleImportAll = (importedData) => {
    if (importedData.projects && importedData.projects.length > 0) {
      if (importMode === "merge") {
        const existingIds = new Set(projects.map((p) => p.id));
        const newProjects = importedData.projects.filter(
          (p) => !existingIds.has(p.id)
        );
        setProjects([...projects, ...newProjects]);
      } else {
        setProjects(importedData.projects);
      }
    }

    if (importedData.board && importedData.projects) {
      importedData.projects.forEach((project) => {
        importBoardForProject(project.id, importedData.board, importMode);
      });
    }

    if (importedData.preferences) {
      if (importMode === "merge") {
        setPreferences({ ...preferences, ...importedData.preferences });
      } else {
        setPreferences(importedData.preferences);
      }
    }
  };

  const handleClearAllData = () => {
    clearAllTaskFlowData();
    clearAllProjectBoards();
    setProjects([]);
    setPreferences({
      theme: "dark",
      viewMode: "board",
      filterPriority: "all",
      sortBy: "updated",
      searchTerm: "",
    });
  };

  const handleThemeChange = (newTheme) => {
    const root = document.documentElement;
    if (newTheme === "dark") {
      root.removeAttribute("data-theme");
    } else {
      root.setAttribute("data-theme", "light");
    }
    setPreferences({ ...preferences, theme: newTheme });
  };

  return (
    <div className="app">
      <Sidebar
        projects={projects}
        activeProjectId={activeProjectId}
        onSelectProject={setActiveProjectId}
        onNewProject={() => {
          setProjectModalMode("create");
          setIsProjectModalOpen(true);
        }}
        onSettings={() => setIsSettingsOpen(true)}
      />

      <div className="mainContent">
        <Header
          projectName={activeProject?.name || "Project"}
          project={activeProject}
          searchTerm={preferences.searchTerm}
          onSearchChange={(term) =>
            setPreferences({ ...preferences, searchTerm: term })
          }
          filterPriority={preferences.filterPriority}
          onFilterChange={(priority) =>
            setPreferences({ ...preferences, filterPriority: priority })
          }
          sortBy={preferences.sortBy}
          onSortChange={(sort) =>
            setPreferences({ ...preferences, sortBy: sort })
          }
          viewMode={preferences.viewMode}
          onViewChange={(mode) =>
            setPreferences({ ...preferences, viewMode: mode })
          }
          onProjectDetails={() => {
            setProjectModalMode("edit");
            setIsProjectModalOpen(true);
          }}
        />

        <div className="boardContainer">
          <Board
            projectId={activeProjectId}
            searchTerm={preferences.searchTerm}
            filterPriority={preferences.filterPriority}
            sortBy={preferences.sortBy}
            viewMode={preferences.viewMode}
          />
        </div>
      </div>

      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        project={projectModalMode === "edit" ? activeProject : null}
        onCreate={handleProjectSubmit}
        onDelete={handleDeleteProject}
        existingProjects={projects}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        projects={projects}
        activeProjectId={activeProjectId}
        preferences={preferences}
        onThemeChange={handleThemeChange}
        onImportBoard={handleImportBoard}
        onImportProjects={handleImportProjects}
        onImportAll={handleImportAll}
        onClearData={handleClearAllData}
      />
    </div>
  );
};
