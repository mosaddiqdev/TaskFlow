import { useState } from "react";
import { Plus, Menu, X, ChevronDown, Settings } from "lucide-react";
import styles from "./Sidebar.module.css";

export function Sidebar({
  projects,
  activeProjectId,
  onSelectProject,
  onNewProject,
  onSettings,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [showProjects, setShowProjects] = useState(true);

  return (
    <>
      <button
        className={styles.mobileMenuBtn}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
      {isOpen && (
        <div
          className={styles.mobileOverlay}
          onClick={() => setIsOpen(false)}
        />
      )}
      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}>
        <div className={styles.logo}>
          <img
            src="/favicon.svg"
            alt="TaskFlow Logo"
            className={styles.logoIcon}
          />
          <div className={styles.logoText}>
            <h2>TaskFlow</h2>
            <p>Kanban</p>
          </div>
        </div>

        <div className={styles.projectsSection}>
          <button
            className={styles.projectsToggle}
            onClick={() => setShowProjects(!showProjects)}
          >
            <span className={styles.projectsLabel}>Projects</span>
            <ChevronDown
              size={16}
              className={`${styles.chevron} ${
                showProjects ? styles.chevronOpen : ""
              }`}
            />
          </button>

          {showProjects && (
            <div className={styles.projectsList}>
              {projects.length === 0 ? (
                <div className={styles.emptyProjects}>
                  <p>No projects yet</p>
                </div>
              ) : (
                projects.map((project) => (
                  <button
                    key={project.id}
                    className={`${styles.projectCard} ${
                      activeProjectId === project.id
                        ? styles.projectCardActive
                        : ""
                    }`}
                    onClick={() => onSelectProject(project.id)}
                    title={project.name}
                  >
                    <div className={styles.projectCardContent}>
                      <div className={styles.projectName}>{project.name}</div>
                      {project.description && (
                        <div className={styles.projectDesc}>
                          {project.description}
                        </div>
                      )}
                    </div>
                    <div className={styles.projectIndicator} />
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <button
            className={styles.createProjectBtn}
            onClick={onNewProject}
            title="Create New Project"
          >
            <Plus size={16} />
            <span>New Project</span>
          </button>
          <button
            className={styles.settingsBtn}
            onClick={onSettings}
            title="Settings"
            aria-label="Settings"
          >
            <Settings size={18} />
            <span>Settings</span>
          </button>
        </div>
      </aside>
    </>
  );
}
