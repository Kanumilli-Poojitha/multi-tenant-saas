# Product Requirements Document (PRD)

## 1. Overview
This document defines the product requirements for the Multi-Tenant SaaS Project & Task Management Platform.

## 2. User Personas

### 2.1 Super Admin
Manages the entire system, tenants, and subscriptions.

### 2.2 Tenant Admin
Manages users, projects, and tasks within their tenant.

### 2.3 Regular User
Works on tasks assigned within projects.

## 3. Functional Requirements

1. Users can log in using email, password, and tenant subdomain
2. Super admin can create and manage tenants
3. Tenant admins can manage users within limits
4. Tenant admins cannot delete themselves
5. Email uniqueness is enforced per tenant
6. Subscription limits are enforced
7. Users can create projects
8. Projects belong to a tenant
9. Tasks belong to projects
10. Tasks can be assigned to users
11. RBAC is enforced on all endpoints
12. Audit logs track critical actions
13. Tenants can be suspended
14. Suspended tenants cannot log in
15. Health check endpoint reports system status

## 4. Non-Functional Requirements

1. System must ensure tenant data isolation
2. Passwords must be securely hashed
3. APIs must respond within acceptable latency
4. System must be horizontally scalable
5. Docker-based deployment is required
