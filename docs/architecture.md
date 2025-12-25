# System Architecture

## 1. High-Level Architecture
The system follows a three-tier architecture:
- Frontend (React)
- Backend API
- PostgreSQL Database

---

## 2. Multi-Tenancy Enforcement
Tenant isolation is enforced using tenant_id filtering in all database queries.

---

## 3. API Endpoints

The backend exposes RESTful APIs grouped by functionality. All endpoints (except health check) are protected using JWT authentication and role-based access control.

### 3.1 Authentication & Authorization
1. POST /api/auth/login  
   - Authenticates user using email, password, and tenant subdomain

2. POST /api/auth/register-tenant  
   - Registers a new tenant and creates the tenant_admin (transactional)

3. POST /api/auth/logout  
   - Logs out the user (JWT-based, client-side token removal)

4. GET /api/auth/me  
   - Returns details of the currently authenticated user

---

### 3.2 Tenant Management (Super Admin Only)
5. GET /api/tenants  
   - List all tenants with pagination and filters

6. GET /api/tenants/:tenantId  
   - Get details of a specific tenant

7. PUT /api/tenants/:tenantId  
   - Update tenant details (subscription, status, limits)

---

### 3.3 User Management
8. POST /api/users  
   - Create a new user within a tenant (subscription limits enforced)

9. GET /api/users  
   - List all users within the tenant

10. DELETE /api/users/:userId  
    - Delete a user (tenant_admin cannot delete themselves)

---

### 3.4 Project Management
11. POST /api/projects  
    - Create a new project (max_projects limit enforced)

12. GET /api/projects  
    - List all projects within the tenant

13. PUT /api/projects/:projectId  
    - Update project details

14. DELETE /api/projects/:projectId  
    - Delete a project

---

### 3.5 Task Management
15. POST /api/projects/:projectId/tasks  
    - Create a task under a project

16. GET /api/projects/:projectId/tasks  
    - List tasks under a project

17. PUT /api/tasks/:taskId  
    - Update task details or status

18. DELETE /api/tasks/:taskId  
    - Delete a task

---

### 3.6 System Health
19. GET /health  
    - Health check endpoint to verify API and database connectivity


## 4. Database Design (ERD)
The database consists of:
- tenants
- users
- projects
- tasks
- audit_logs

Each relationship is enforced using foreign keys.

---

## 5. Diagrams

### 5.1 System Architecture Diagram
A high-level diagram showing the interaction between the frontend, backend API, and database.
(Location: docs/images/system-architecture.png)

### 5.2 Database ERD
An Entity Relationship Diagram illustrating all database tables and their relationships.
(Location: docs/images/database-erd.png)

