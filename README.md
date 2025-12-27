# Multi-Tenant SaaS Project Management System

A full-stack multi-tenant SaaS application that enables organizations (tenants) to manage users, projects, and tasks with strict tenant isolation.  
Built to demonstrate scalable backend architecture, role-based access control, and Dockerized deployment.

**Target Audience:** SaaS startups, backend engineers, and developers learning multi-tenant system design.

## 🚀 Features

- Multi-tenant architecture with subdomain-based isolation
- Role-based access control (Super Admin, Tenant Admin, User)
- Secure authentication using JWT
- Tenant management and subscription limits
- User management per tenant
- Project creation and assignment
- Task management with status tracking
- Audit logging for critical actions
- PostgreSQL migrations & seed automation
- Dockerized backend, frontend, and database

## Technology Stack

### Frontend
- React + Vite
- JavaScript (ES6)
- Axios
- Node.js

### Backend
- Node.js 20
- Express.js 5.2.1
- JWT (jsonwebtoken 9.0.3)
- bcrypt / bcryptjs
- express-validator
- dotenv

### Database
- PostgreSQL 15

### DevOps / Containerization
- Docker
- Docker Compose

## Architecture Overview

This system follows a containerized multi-tier architecture:

- **Frontend** communicates with backend via REST APIs
- **Backend** handles authentication, business logic, and tenant isolation
- **PostgreSQL** stores tenant, user, project, and task data
- **Init script** runs migrations and seeds once using a lock mechanism

2. System Architecture Diagram

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

## Installation & Setup

### Prerequisites
- Docker & Docker Compose
- Node.js 20+ (for local development)

### Step-by-step Setup
git clone <repository-url>
cd multi-tenant-saas

Start all services

docker-compose up -d

Migrations
Automatically executed on first backend startup
Located in /backend/migrations
Uses IF NOT EXISTS for safe re-runs

Database Seeding
Automatically handled by scripts/init.js

Creates:

Super Admin
Demo Tenant
Tenant Admin
Demo User

Backend
Runs on: http://localhost:5000

Health check: /api/health

Frontend
Runs on: http://localhost:3000

Environment Variables
Backend (.env)

| Variable     | Description                  |
| ------------ | ---------------------------- |
| PORT         | Backend server port          |
| DATABASE_URL | PostgreSQL connection string |
| JWT_SECRET   | Secret key for JWT signing   |
| FRONTEND_URL | Allowed frontend origin      |

API Documentation

Detailed API documentation available in:
docs/API.md

APIs are tested using Postman

Demo video
youtube link:

https://www.youtube.com/watch?v=A142LvTUz9M
