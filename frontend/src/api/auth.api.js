import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});
export const registerTenant = (form) =>
  API.post("/auth/register-tenant", {
    tenantName: form.organizationName,
    subdomain: form.subdomain,
    subscriptionPlan: "pro",
    adminFullName: form.adminFullName,
    adminEmail: form.adminEmail,
    adminPassword: form.password,
  });

export const loginUser = (data) =>
  API.post("/auth/login", data);