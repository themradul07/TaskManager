import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, SlidersHorizontal, AlertCircle, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';

import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { api } from '../services/api';

import NavBar from '../components/NavBar';
import StatsGrid from '../components/StatsGrid';
import TaskCard from '../components/TaskCard';
import TaskFormModal from '../components/TaskFormModal';
import ConfirmModal from '../components/ConfirmModal';

const Dashboard = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Task states
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters, search, and sorting states
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [taskToDeleteId, setTaskToDeleteId] = useState(null);

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Fetch tasks callback
  const fetchTasks = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      const data = await api.tasks.get({
        search,
        status: statusFilter,
        priority: priorityFilter,
        tag: tagFilter,
        sortBy,
        order,
        page,
        limit: 6,
      });

      setTasks(data.tasks || []);
      setStats(data.stats || null);
      setTags(data.uniqueTags || []);
      setTotalPages(data.pages || 1);
    } catch (err) {
      console.error(err);
      showToast('error', err.message || 'Failed to fetch tasks.');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, search, statusFilter, priorityFilter, tagFilter, sortBy, order, page, showToast]);

  // Trigger search and filters fetch
  useEffect(() => {
    // Small debounce for search query typing
    const delayDebounce = setTimeout(() => {
      if (isAuthenticated) {
        fetchTasks();
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [search, statusFilter, priorityFilter, tagFilter, sortBy, order, page, isAuthenticated]);

  // Reset page index on filter change
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, priorityFilter, tagFilter, sortBy, order]);

  // Handle task creation or modification submit
  const handleSaveTask = async (taskData) => {
    try {
      if (taskToEdit) {
        // Edit Mode
        await api.tasks.update(taskToEdit._id, taskData);
        showToast('success', 'Task updated successfully!');
      } else {
        // Create Mode
        await api.tasks.create(taskData);
        showToast('success', 'Task created successfully!');
      }
      fetchTasks();
    } catch (err) {
      throw err; // Form modal catches this and shows form-level error
    }
  };

  // Handle task deletion confirmation trigger
  const handleDeleteConfirm = async () => {
    if (!taskToDeleteId) return;

    try {
      await api.tasks.delete(taskToDeleteId);
      showToast('success', 'Task deleted successfully.');
      setIsDeleteOpen(false);
      setTaskToDeleteId(null);
      fetchTasks();
    } catch (err) {
      console.error(err);
      showToast('error', err.message || 'Failed to delete task.');
    }
  };

  // Toggle single task completion status (adds confetti celebration!)
  const handleToggleStatus = async (id) => {
    try {
      const updated = await api.tasks.toggle(id);
      
      // Fire confetti if completing a task
      if (updated.status === 'completed') {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.7 },
          colors: ['#4f46e5', '#7c3aed', '#10b981', '#3b82f6']
        });
        showToast('success', 'Task completed! Keep it up. 🎉');
      } else {
        showToast('info', 'Task status set to pending.');
      }
      fetchTasks();
    } catch (err) {
      console.error(err);
      showToast('error', err.message || 'Failed to update task status.');
    }
  };

  // Modal handlers
  const openCreateModal = () => {
    setTaskToEdit(null);
    setIsFormOpen(true);
  };

  const openEditModal = (task) => {
    setTaskToEdit(task);
    setIsFormOpen(true);
  };

  const openDeleteModal = (id) => {
    setTaskToDeleteId(id);
    setIsDeleteOpen(true);
  };

  // If authorization status is loading, show standard spinner page
  if (authLoading || (!user && isAuthenticated)) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="spinner" style={{ width: '40px', height: '40px' }}></div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <NavBar />

      <main className="dashboard-container">
        {/* Welcome Section */}
        <div 
          style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '32px',
            flexWrap: 'wrap',
            gap: '16px'
          }}
        >
          <div className="animate-fade">
            <h1 style={{ fontSize: '2.2rem', fontWeight: '800', fontFamily: 'var(--font-display)' }}>
              Hello, <span className="gradient-text">{user?.name}</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: '4px' }}>
              Here is your overview for today.
            </p>
          </div>

          <button 
            onClick={openCreateModal} 
            className="btn btn-primary animate-fade"
            style={{ boxShadow: '0 8px 20px rgba(99, 102, 241, 0.25)' }}
          >
            <Plus size={18} strokeWidth={2.5} />
            <span>Add New Task</span>
          </button>
        </div>

        {/* Dashboard Stats */}
        <StatsGrid stats={stats} loading={loading && tasks.length === 0} />

        {/* Controls, Filters & Search bar */}
        <div className="controls-bar animate-fade">
          <div className="search-wrapper">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search tasks by title or description..."
              className="search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="filters-wrapper">
            {/* Status Filter */}
            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              title="Filter by Status"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>

            {/* Priority Filter */}
            <select
              className="filter-select"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              title="Filter by Priority"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>

            {/* Tag Filter */}
            <select
              className="filter-select"
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              title="Filter by Tag"
            >
              <option value="all">All Tags</option>
              {tags.map((tag, i) => (
                <option key={i} value={tag}>
                  #{tag}
                </option>
              ))}
            </select>

            {/* Sorting select */}
            <select
              className="filter-select"
              value={`${sortBy}-${order}`}
              onChange={(e) => {
                const [sort, ord] = e.target.value.split('-');
                setSortBy(sort);
                setOrder(ord);
              }}
              title="Sort Tasks"
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="dueDate-asc">Due Date (Earliest)</option>
              <option value="dueDate-desc">Due Date (Latest)</option>
              <option value="priority-desc">Priority (High to Low)</option>
            </select>

            <button 
              className="btn btn-secondary" 
              onClick={fetchTasks} 
              title="Refresh Task List"
              style={{ padding: '10px' }}
            >
              <RefreshCw size={16} className={loading ? 'spin' : ''} />
            </button>
          </div>
        </div>

        {/* Tasks grid section */}
        {loading && tasks.length === 0 ? (
          <div className="tasks-grid">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="skeleton-card">
                <div>
                  <div className="skeleton skeleton-title"></div>
                  <div className="skeleton skeleton-text" style={{ height: '40px' }}></div>
                  <div className="skeleton skeleton-text" style={{ width: '40%' }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                  <div className="skeleton" style={{ width: '100px', height: '16px' }}></div>
                  <div className="skeleton" style={{ width: '60px', height: '24px' }}></div>
                </div>
              </div>
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="empty-state animate-fade">
            <div className="empty-state-icon">
              <AlertCircle size={48} strokeWidth={1.5} />
            </div>
            <h3 className="empty-state-title">No tasks found</h3>
            <p className="empty-state-desc">
              {search || statusFilter !== 'all' || priorityFilter !== 'all' || tagFilter !== 'all'
                ? "We couldn't find any tasks matching your filters. Try adjusting your query parameters."
                : "Your task board is looking clean! Click 'Add New Task' to begin organizing your work."}
            </p>
            {(search || statusFilter !== 'all' || priorityFilter !== 'all' || tagFilter !== 'all') ? (
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setSearch('');
                  setStatusFilter('all');
                  setPriorityFilter('all');
                  setTagFilter('all');
                }}
              >
                Clear Filters
              </button>
            ) : (
              <button className="btn btn-primary" onClick={openCreateModal}>
                Create Your First Task
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="tasks-grid">
              {tasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onToggleStatus={handleToggleStatus}
                  onEdit={openEditModal}
                  onDelete={openDeleteModal}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="pagination animate-fade">
                <button
                  className="pagination-btn"
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                >
                  &lt;
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    className={`pagination-btn ${page === p ? 'active' : ''}`}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                ))}

                <button
                  className="pagination-btn"
                  onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={page === totalPages}
                >
                  &gt;
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Form Dialog Modal */}
      <TaskFormModal
        isOpen={isFormOpen}
        task={taskToEdit}
        onSave={handleSaveTask}
        onClose={() => setIsFormOpen(false)}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        title="Confirm Task Deletion"
        message="Are you absolutely sure you want to delete this task? This cannot be undone and will permanently remove this record."
        onConfirm={handleDeleteConfirm}
        onClose={() => setIsDeleteOpen(false)}
      />
    </div>
  );
};

export default Dashboard;
