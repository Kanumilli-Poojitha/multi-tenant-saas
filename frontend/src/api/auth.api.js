import axios from "axios";

  const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

export const registerTenant = (data) =>
  API.post("/auth/register-tenant", data);

export const loginUser = (data) =>
  API.post("/auth/login", data);