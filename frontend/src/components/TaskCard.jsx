import React from 'react';
import { Calendar, Edit3, Trash2, CheckCircle2, Circle, Clock } from 'lucide-react';

const TaskCard = ({ task, onToggleStatus, onEdit, onDelete }) => {
  const { _id, title, description, status, priority, dueDate, tags } = task;

  const isCompleted = status === 'completed';
  
  // Format due date to a clean readable string
  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Check if task is overdue
  const isOverdue = () => {
    if (!dueDate || isCompleted) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(dueDate) < today;
  };

  return (
    <div className={`task-card priority-${priority} ${isCompleted ? 'completed' : ''} animate-scale`}>
      <div className="task-header">
        <span className="task-title">{title}</span>
        <span className={`badge badge-${priority}`} title={`${priority} priority`}>
          {priority}
        </span>
      </div>

      <p className="task-desc">{description || 'No description provided.'}</p>

      {tags && tags.length > 0 && (
        <div className="task-tags">
          {tags.map((tag, i) => (
            <span key={i} className="task-tag">
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="task-footer">
        <div className={`task-date ${isOverdue() ? 'overdue' : ''}`}>
          {isOverdue() ? (
            <>
              <Clock size={14} />
              <span>Overdue ({formatDate(dueDate)})</span>
            </>
          ) : dueDate ? (
            <>
              <Calendar size={14} />
              <span>Due: {formatDate(dueDate)}</span>
            </>
          ) : (
            <span style={{ fontStyle: 'italic', opacity: 0.5 }}>No due date</span>
          )}
        </div>

        <div className="task-actions">
          <button
            onClick={() => onToggleStatus(_id)}
            className="task-action-btn btn-toggle"
            title={isCompleted ? 'Mark as Pending' : 'Mark as Completed'}
          >
            {isCompleted ? (
              <CheckCircle2 size={18} style={{ color: 'var(--success)' }} />
            ) : (
              <Circle size={18} />
            )}
          </button>
          
          <button
            onClick={() => onEdit(task)}
            className="task-action-btn btn-edit"
            title="Edit Task"
          >
            <Edit3 size={17} />
          </button>

          <button
            onClick={() => onDelete(_id)}
            className="task-action-btn btn-delete"
            title="Delete Task"
          >
            <Trash2 size={17} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
