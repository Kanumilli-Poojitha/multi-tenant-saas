# System Architecture Document

## 1. System Architecture Overview

The Multi-Tenant SaaS Platform follows a standard three-tier architecture with strict separation of concerns.

### Components:
- **Client (Browser)**: Accessed by end users
- **Frontend Application**: React-based UI running in a Docker container
- **Backend API Server**: Node.js + Express REST API
- **Database**: PostgreSQL for persistent data storage

### Authentication Flow:
1. User logs in via frontend
2. Backend validates credentials
3. JWT token is issued
4. Token is sent with every authenticated request
5. Backend validates token and enforces RBAC and tenant isolation

## 2. System Architecture Diagram

The diagram below illustrates the high-level interaction between system components including authentication flow.

**Diagram Location:**  
`docs/images/system-architecture.png`

**Diagram Includes:**
- Client (Browser)
- Frontend Application
- Backend API Server
- PostgreSQL Database
- JWT-based Authentication Flow
- Dockerized deployment

## 3. Database Schema Design (ERD)

The application uses a **shared database with shared schema** multi-tenancy model.

### Core Tables:
- `tenants`
- `users`
- `projects`
- `tasks`
- `audit_logs`

### Multi-Tenancy Enforcement:
- All tenant-scoped tables contain a `tenant_id`
- `users.tenant_id` is `NULL` only for `super_admin`
- Indexes exist on `tenant_id` for performance
- Foreign keys enforce referential integrity

**ERD Diagram Location:**  
`docs/images/database-erd.png`

## 4. API Architecture

All APIs follow REST principles and return a consistent response format:
```json
{ "success": true, "message": "...", "data": {} }

4.1 Authentication & Authorization

| Method | Endpoint                  | Auth | Role   |
| ------ | ------------------------- | ---- | ------ |
| POST   | /api/auth/login           | No   | Public |
| POST   | /api/auth/register-tenant | No   | Public |
| GET    | /api/auth/me              | Yes  | All    |
| POST   | /api/auth/logout          | Yes  | All    |

4.2 Tenant Management

| Method | Endpoint               | Auth | Role        |
| ------ | ---------------------- | ---- | ----------- |
| GET    | /api/tenants           | Yes  | Super Admin |
| GET    | /api/tenants/:tenantId | Yes  | Super Admin |
| PUT    | /api/tenants/:tenantId | Yes  | Super Admin |

4.3 User Management

| Method | Endpoint           | Auth | Role         |
| ------ | ------------------ | ---- | ------------ |
| POST   | /api/users         | Yes  | Tenant Admin |
| GET    | /api/users         | Yes  | Tenant Admin |
| DELETE | /api/users/:userId | Yes  | Tenant Admin |

4.4 Project Management

| Method | Endpoint                 | Auth | Role         |
| ------ | ------------------------ | ---- | ------------ |
| POST   | /api/projects            | Yes  | Tenant Admin |
| GET    | /api/projects            | Yes  | Tenant Users |
| PUT    | /api/projects/:projectId | Yes  | Tenant Admin |
| DELETE | /api/projects/:projectId | Yes  | Tenant Admin |

4.5 Task Management

| Method | Endpoint                      | Auth | Role         |
| ------ | ------------------------------| ---- | -------------|
| POST   | /api/projects/:projectId/tasks| Yes  | Tenant Users |
| GET    | /api/projects/:projectId/tasks| Yes  | Tenant Users |
| PUT    | /api/tasks/:taskId            | Yes  | Tenant Users |
| DELETE | /api/tasks/:taskId            | Yes  | Tenant Admin |

4.6 System Health

| Method | Endpoint    | Auth | Role   |
| ------ | ----------- | ---- | ------ |
| GET    | /api/health | No   | Public |

5. Deployment Architecture

All services run in Docker containers
Managed using docker-compose
Services communicate using Docker service names
One-command startup: docker-compose up -d
