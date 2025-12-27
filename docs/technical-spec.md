# Technical Specification

## 1. Project Structure

### Backend Structure

backend/
├── db/init/
│ ├── 000_enums_up.sql
│ ├── 001_init.sql
│ └── seed_data.sql
├── scripts/
│ ├── init.js
│ ├── migrate.js
│ └── seed.js
├── seeds/
│ └── 001_seed_data.sql
├── migrations/
│ ├── 000_enable_extensions.sql
│ ├── 000_enums.down.sql
│ ├── 001_create_enums.sql
│ ├── 002_create_tenants.sql
│ ├── 003_create_users.sql
│ ├── 004_create_projects.sql
│ ├── 005_create_tasks.sql
│ └──── 006_create_audit_logs.sql
├── src/
│ ├── config/
│ │ ├── db.js
│ │ └── jwt.js
│ ├── controllers/
│ │ ├── auth.controller.js
│ │ ├── tenant.controller.js
│ │ ├── user.controller.js
│ │ ├── project.controller.js
│ │ └── task.controller.js
│ ├── middlewares/
│ │ ├── auth.middleware.js
│ │ ├── role.middleware.js
│ │ ├── error.middleware.js
│ │ ├── validate.middleware.js
│ │ └── tenant.middleware.js
│ ├── routes/
│ │ ├── auth.routes.js
│ │ ├── tenant.routes.js
| | ├── tenantUsers.routes.js
| | ├── projectTasks.routes.js
│ │ ├── users.routes.js
│ │ ├── project.routes.js
│ │ └── task.routes.js
│ ├── services/
│ │ ├── audit.service.js
│ ├── utils/
│ │ └── password.js
│ └── app.js
│ └── health.js
│ └── server.js
├── .env
├── .env.example
├── start.sh
├── Dockerfile
├── submission.json
├── package.json
└── package.json

**Purpose**
- `controllers/` – Business logic for APIs  
- `routes/` – API route definitions  
- `middleware/` – Auth, role, and tenant validation  
- `utils/` – Reusable helper functions  
- `config/` – Database and environment setup  
- `migrations/` – Database schema migrations  

### Frontend Structure

frontend/
├── src/
│ ├── api/
│ │ ├── auth.api.js
│ │ ├── axios.js
│ ├── components/
│ │ ├── Navbar.jsx
│ │ ├── ProjectCard.jsx
│ │ ├── ProjectModal.jsx
│ │ ├── UserModal.jsx
│ │ └── ProtectedRoute.jsx
│ ├── pages/
│ │ ├── Login.jsx
│ │ ├── Register.jsx
│ │ ├── ProjectDetails.jsx
│ │ ├── Dashboard.jsx
│ │ ├── Projects.jsx
│ │ └── Users.jsx
│ ├── routes/
│ │ ├── ProtectedRoute.jsx
│ ├── services/
│ │ ├── projectService.js
│ │ └── taskService.js
│ ├── context/
│ │ └── AuthContext.jsx
│ ├── utils/
│ │ └── api.js
│ ├── App.jsx
│ ├── App.css
│ ├── main.jsx
│ └── index.css
├── .env
├── .gitignore
├── Dockerfile
└── package.json

**Purpose**
- `components/` – Reusable UI components  
- `pages/` – Application screens  
- `services/` – API communication layer  
- `context/` – Authentication state  

## 2. Development Setup Guide

### Prerequisites
- Node.js v18+
- PostgreSQL v14+
- Docker & Docker Compose
- Git

### Environment Variables

**Backend (`backend/.env`)**

PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/saas
JWT_SECRET=your_jwt_secret

**Frontend (`frontend/.env`)**

VITE_API_URL=http://localhost:5000

### Installation Steps
```bash
git clone <repository-url>
cd multi-tenant-saas

Backend

cd backend
npm install
npm run migrate
npm run seed
npm run dev

Frontend

cd frontend
npm install
npm run dev

Running with Docker

docker-compose up --build

Running Tests

cd backend
npm test