import axios from 'axios';

/**
 * Centralized API service for all task operations.
 * Every function returns the Axios response data (unwrapped).
 * Errors are thrown so callers can handle them uniformly.
 */
const api = axios.create({
  baseURL: '/api/tasks',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

/**
 * Extract a user-friendly error message from an Axios error.
 */
const extractErrorMessage = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

/**
 * Fetch all tasks, optionally filtered and sorted.
 * @param {Object} params — { status?, sortBy?, order? }
 */
export const fetchTasks = async (params = {}) => {
  try {
    // Strip empty/undefined values so they don't become ?status=undefined
    const cleanParams = {};
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        cleanParams[key] = value;
      }
    });

    const { data } = await api.get('/', { params: cleanParams });
    return data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

/**
 * Create a new task.
 * @param {Object} taskData — { title, description?, priority?, status?, dueDate? }
 */
export const createTask = async (taskData) => {
  try {
    const { data } = await api.post('/', taskData);
    return data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

/**
 * Update an existing task.
 * @param {string} id — Task ID
 * @param {Object} updates — Partial task fields to update
 */
export const updateTask = async (id, updates) => {
  try {
    const { data } = await api.put(`/${id}`, updates);
    return data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

/**
 * Delete a task by ID.
 * @param {string} id — Task ID
 */
export const deleteTask = async (id) => {
  try {
    const { data } = await api.delete(`/${id}`);
    return data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};
