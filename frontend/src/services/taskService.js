import api from "../utils/api";

export const getTasksByProject = (projectId) =>
  api.get(`/projects/${projectId}/tasks`);

export const createTask = (projectId, data) =>
  api.post(`/projects/${projectId}/tasks`, data);

export const updateTask = (id, data) =>
  api.put(`/tasks/${id}`, data);

export const updateTaskStatus = (id, status) =>
  api.patch(`/tasks/${id}/status`, { status });

export const deleteTask = (id) =>
  api.delete(`/tasks/${id}`);