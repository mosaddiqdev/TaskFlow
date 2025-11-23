import { useState } from "react";
import {
  Search,
  LayoutGrid,
  List,
  MoreVertical,
  Filter,
  ArrowUpDown,
  X,
} from "lucide-react";
import { Dropdown } from "../Dropdown/Dropdown";
import styles from "./Header.module.css";

export function Header({
  projectName,
  project,
  searchTerm,
  onSearchChange,
  filterPriority,
  onFilterChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewChange,
  onProjectDetails,
}) {
  const [showFilters, setShowFilters] = useState(false);

  const priorityOptions = [
    { label: "All Priority", value: "all" },
    { label: "High", value: "high" },
    { label: "Medium", value: "medium" },
    { label: "Low", value: "low" },
  ];

  const sortOptions = [
    { label: "Recently Updated", value: "updated" },
    { label: "Created Date", value: "created" },
    { label: "Priority", value: "priority" },
    { label: "Alphabetical", value: "alphabetical" },
  ];

  return (
    <>
      <header className={styles.header}>
        {/* Top Section - Title & Menu */}
        <div className={styles.topSection}>
          <div className={styles.titleArea}>
            <h1 className={styles.projectName}>{projectName}</h1>

            <button
              className={styles.menuBtn}
              onClick={onProjectDetails}
              title="Project details"
              aria-label="Project menu"
            >
              <MoreVertical size={18} />
            </button>
          </div>

          <div className={styles.headerActions}>
            <div className={styles.viewControls}>
              <button
                className={`${styles.viewBtn} ${
                  viewMode === "board" ? styles.active : ""
                }`}
                onClick={() => onViewChange("board")}
                title="Board view"
              >
                <LayoutGrid size={18} />
              </button>
              <button
                className={`${styles.viewBtn} ${
                  viewMode === "list" ? styles.active : ""
                }`}
                onClick={() => onViewChange("list")}
                title="List view"
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Section - Search & Filters */}
        <div className={styles.bottomSection}>
          <div className={styles.searchBox}>
            <Search size={16} />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className={styles.searchInput}
            />

            {/* Filter Button Inside Search Bar */}
            <button
              className={styles.searchFilterBtn}
              onClick={() => setShowFilters(!showFilters)}
              title="Toggle filters"
              aria-label="Toggle filters"
            >
              <Filter size={16} />
            </button>
          </div>

          <div className={styles.filterControls}>
            <Dropdown
              label="Priority"
              options={priorityOptions}
              value={filterPriority}
              onChange={onFilterChange}
              icon={Filter}
            />

            <Dropdown
              label="Sort"
              options={sortOptions}
              value={sortBy}
              onChange={onSortChange}
              icon={ArrowUpDown}
            />
          </div>
        </div>
      </header>

      {/* Mobile Filter Bottom Sheet */}
      {showFilters && (
        <>
          <div
            className={styles.mobileFilterOverlay}
            onClick={() => setShowFilters(false)}
          />
          <div className={styles.mobileFilterPanel}>
            <div className={styles.filterPanelHeader}>
              <h3>Filters & Sort</h3>
              <button
                className={styles.closePanelBtn}
                onClick={() => setShowFilters(false)}
                aria-label="Close filters"
              >
                <X size={20} />
              </button>
            </div>
            <div className={styles.filterPanelContent}>
              {/* Priority Filter Pills */}
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Priority</label>
                <div className={styles.pillGroup}>
                  {priorityOptions.map((option) => (
                    <button
                      key={option.value}
                      className={`${styles.pill} ${
                        filterPriority === option.value ? styles.pillActive : ""
                      }`}
                      onClick={() => onFilterChange(option.value)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort Pills */}
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Sort By</label>
                <div className={styles.pillGroup}>
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      className={`${styles.pill} ${
                        sortBy === option.value ? styles.pillActive : ""
                      }`}
                      onClick={() => onSortChange(option.value)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
