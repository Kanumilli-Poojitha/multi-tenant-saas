import api from "../utils/api";

export const getProjects = (status) =>
  api.get(`/projects${status ? `?status=${status}` : ""}`);

export const getProjectById = (id) =>
  api.get(`/projects/${id}`);

export const createProject = (data) =>
  api.post("/projects", data);

export const updateProject = (id, data) =>
  api.put(`/projects/${id}`, data);

export const deleteProject = (id) =>
  api.delete(`/projects/${id}`);