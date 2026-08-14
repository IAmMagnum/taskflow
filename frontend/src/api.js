
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://taskflow-xt8t.onrender.com/api';
async function handleResponse(response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Server error (${response.status})`);
  }
  if (response.status === 204) return null;
  return response.json();
}

export const api = {
  getBoard: async (boardId = 1, priority = 'All') => {
    const url = `${API_BASE_URL}/board/${boardId}${priority !== 'All' ? `?priority=${priority}` : ''}`;
    const res = await fetch(url);
    return handleResponse(res);
  },

  createTask: async (taskData) => {
    const res = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData)
    });
    return handleResponse(res);
  },

  updateTask: async (id, taskData) => {
    const res = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData)
    });
    return handleResponse(res);
  },

  deleteTask: async (id) => {
    const res = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'DELETE'
    });
    return handleResponse(res);
  }
};