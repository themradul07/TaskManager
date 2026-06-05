const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper to make API requests with JWT authorization token
const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMsg = data.message || 'Something went wrong';
    throw new Error(errorMsg);
  }

  return data;
};

export const api = {
  // Authentication
  auth: {
    register: (name, email, password) =>
      request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      }),
      
    login: (email, password) =>
      request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
      
    getProfile: () => request('/auth/me'),
  },

  // Tasks CRUD
  tasks: {
    // Fetches all tasks. Supports search, status, priority, tag, sortBy, order, page, limit
    get: (params = {}) => {
      const queryParams = new URLSearchParams();
      
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          queryParams.append(key, val);
        }
      });
      
      const queryString = queryParams.toString();
      return request(`/tasks${queryString ? `?${queryString}` : ''}`);
    },

    getById: (id) => request(`/tasks/${id}`),

    create: (taskData) =>
      request('/tasks', {
        method: 'POST',
        body: JSON.stringify(taskData),
      }),

    update: (id, taskData) =>
      request(`/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(taskData),
      }),

    toggle: (id) =>
      request(`/tasks/${id}/toggle`, {
        method: 'PATCH',
      }),

    delete: (id) =>
      request(`/tasks/${id}`, {
        method: 'DELETE',
      }),
  },
};
