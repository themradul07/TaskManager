import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';

const TaskFormModal = ({ isOpen, task, onSave, onClose }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isEditMode = !!task;

  // Populate form if in edit mode
  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setPriority(task.priority || 'medium');
      setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
      setTagsInput(task.tags ? task.tags.join(', ') : '');
    } else {
      // Clear form for creation mode
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate('');
      setTagsInput('');
    }
    setError('');
    setSubmitting(false);
  }, [task, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Task title is required');
      return;
    }

    if (title.length > 100) {
      setError('Title cannot exceed 100 characters');
      return;
    }

    setSubmitting(true);
    setError('');

    // Parse comma-separated tags into a clean array
    const tags = tagsInput
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    const taskData = {
      title: title.trim(),
      description: description.trim(),
      priority,
      dueDate: dueDate || null,
      tags,
    };

    try {
      await onSave(taskData);
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to save task');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content animate-scale">
        <div className="modal-header">
          <span className="modal-title">
            {isEditMode ? 'Edit Task Details' : 'Create New Task'}
          </span>
          <button className="modal-close" onClick={onClose} disabled={submitting}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            {error && (
              <div 
                style={{ 
                  background: 'var(--danger-light)', 
                  color: 'var(--danger)', 
                  padding: '12px', 
                  borderRadius: 'var(--radius-md)', 
                  marginBottom: '16px',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
              >
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="task-title">Task Title *</label>
              <input
                id="task-title"
                className={`form-input ${error && !title.trim() ? 'error' : ''}`}
                type="text"
                placeholder="What needs to be done?"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (e.target.value.trim()) setError('');
                }}
                disabled={submitting}
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="task-desc">Description</label>
              <textarea
                id="task-desc"
                className="form-input"
                placeholder="Add some details about this task..."
                rows="4"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={submitting}
                style={{ resize: 'vertical', minHeight: '80px' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="task-priority">Priority</label>
                <select
                  id="task-priority"
                  className="filter-select"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  disabled={submitting}
                  style={{ width: '100%', height: '48px', color: 'var(--text-primary)' }}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="task-duedate">Due Date</label>
                <input
                  id="task-duedate"
                  className="form-input"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  disabled={submitting}
                  style={{ height: '48px' }}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="task-tags">Tags (comma-separated)</label>
              <input
                id="task-tags"
                className="form-input"
                type="text"
                placeholder="e.g. Work, Personal, Marketing"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                disabled={submitting}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                Separate multiple tags with commas.
              </span>
            </div>
          </div>

          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={submitting}
              style={{ minWidth: '110px' }}
            >
              {submitting ? (
                <div className="spinner" style={{ width: '18px', height: '18px' }}></div>
              ) : (
                <>
                  <Check size={18} />
                  <span>{isEditMode ? 'Update' : 'Create'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskFormModal;
