import { useState } from 'react';
import { Plus, Trash2, ChevronDown } from 'lucide-react';
import styles from './TemplatesPanel.module.css';

export function TemplatesPanel({ isOpen, templates, lanes, onUseTemplate, onDeleteTemplate, onSaveTemplate }) {
  const [showForm, setShowForm] = useState(false);
  const [selectedLaneId, setSelectedLaneId] = useState(lanes[0]?.id || '');
  const [templateName, setTemplateName] = useState('');
  const [templateTitle, setTemplateTitle] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [templatePriority, setTemplatePriority] = useState('medium');
  const [error, setError] = useState('');

  const handleSave = (e) => {
    e.preventDefault();
    if (!templateName.trim()) {
      setError('Template name is required');
      return;
    }
    if (!templateTitle.trim()) {
      setError('Card title is required');
      return;
    }

    onSaveTemplate({
      name: templateName,
      title: templateTitle,
      description: templateDescription,
      priority: templatePriority,
    });

    setTemplateName('');
    setTemplateTitle('');
    setTemplateDescription('');
    setTemplatePriority('medium');
    setError('');
    setShowForm(false);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.panel}>
      {/* Lane Selector */}
      <div className={styles.laneSelector}>
        <label className={styles.label}>Add to Lane:</label>
        <select
          value={selectedLaneId}
          onChange={(e) => setSelectedLaneId(e.target.value)}
          className={styles.select}
        >
          {lanes.map((lane) => (
            <option key={lane.id} value={lane.id}>
              {lane.title}
            </option>
          ))}
        </select>
      </div>

      {/* Templates List */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>
          Saved Templates ({templates.length})
        </h3>
        {templates.length === 0 ? (
          <p className={styles.emptyText}>No templates yet</p>
        ) : (
          <div className={styles.templatesList}>
            {templates.map((template, index) => (
              <div key={index} className={styles.templateItem}>
                <div className={styles.templateInfo}>
                  <p className={styles.templateName}>{template.name}</p>
                  <p className={styles.templatePreview}>{template.title}</p>
                </div>
                <div className={styles.templateActions}>
                  <button
                    className={styles.useBtn}
                    onClick={() => onUseTemplate(template, selectedLaneId)}
                    title="Use this template"
                  >
                    <Plus size={14} />
                  </button>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => onDeleteTemplate(index)}
                    title="Delete template"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Template Form */}
      <div className={styles.section}>
        <button
          className={styles.toggleBtn}
          onClick={() => setShowForm(!showForm)}
        >
          <ChevronDown
            size={16}
            style={{
              transform: showForm ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s',
            }}
          />
          <span>Create New Template</span>
        </button>

        {showForm && (
          <form onSubmit={handleSave} className={styles.form}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Template Name *</label>
              <input
                type="text"
                value={templateName}
                onChange={(e) => {
                  setTemplateName(e.target.value);
                  if (error) setError('');
                }}
                placeholder="e.g. Bug Report"
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Card Title *</label>
              <input
                type="text"
                value={templateTitle}
                onChange={(e) => {
                  setTemplateTitle(e.target.value);
                  if (error) setError('');
                }}
                placeholder="e.g. [BUG] Fix issue with..."
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Description</label>
              <textarea
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                placeholder="Optional description"
                className={styles.textarea}
                rows="2"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Priority</label>
              <select
                value={templatePriority}
                onChange={(e) => setTemplatePriority(e.target.value)}
                className={styles.select}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            {error && <span className={styles.errorMessage}>{error}</span>}

            <div className={styles.formActions}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
              <button type="submit" className={styles.submitBtn}>
                Save Template
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
