# API Documentation

## Authentication
All protected APIs require JWT token:

Authorization:Bearer<token>

## Auth APIs

 Health Check
GET http://localhost:5000/api/health
Authorization:Not Required

Response:
{
    "status": "ok",
    "database": "connected"
}

This endpoint is used by Docker to verify backend health.

1. Register Tenant

POST http://localhost:5000/api/auth/register-tenant

Authorization:Not Required
Body:
{
  "tenantName": "Acme Corp",
  "subdomain": "acme",
  "subscriptionPlan": "pro",
  "adminFullName": "Acme Admin",
  "adminEmail": "admin@acme.com",
  "adminPassword": "Admin@123"
}

Success Response:

{
    "success": true,
    "message": "Tenant registered successfully",
    "data": {
        "tenantId": "uuid",
        "subdomain": "acme",
        "adminUser": {
            "id": "uuid",
            "email": "admin@acme.com",
            "full_name": "Acme Admin",
            "role": "tenant_admin"
        }
    }
}

Error Responses:
400: Validation errors
409: Subdomain or email already exists

This endpoint registers a new tenant and automatically creates a tenant admin user.

2. Login
POST http://localhost:5000/api/auth/login
Authorization:Not Required

 Body:
{
  "email": "admin@acme.com",
  "password": "Admin@123",
  "subdomain": "acme"
}

Success Response:

{
    "success": true,
    "data": {
        "user": {
            "id": "uuid",
            "email": "admin@acme.com",
            "fullName": "Acme Admin",
            "role": "tenant_admin",
            "tenantId": "uuid"
        },
        "token": "JWT-token",
        "expiresIn": "24h"
    }
}

Error Responses:
401: Invalid credentials
404: Tenant not found
403: Account suspended/inactive

Tenant login requires the subdomain to correctly identify the tenant context.

3. Current User

GET /api/auth/me

Authorization:Required
Headers:
Authorization: Bearer <JWT-token>
Content-Type: application/json

Success Response (200):

{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "value",
    "fullName": "value",
    "role": "tenant_admin",
    "isActive": true,
    "tenant": {
      "id": "uuid",
      "name": "value",
      "subdomain": "value",
      "subscriptionPlan": "pro",
      "maxUsers": 10,
      "maxProjects": 20
    }
  }
}

Error Responses:
401: Token
invalid/expired/missing
404: User not found

4. Logout

POST /api/auth/logout

Authorization:Required
Headers: Authorization: Bearer {token}

Success Response (200):
{
  "success": true,
  "message": "Logged out successfully"
}


Tenant APIs (Super Admin)

5. Get Tenant

GET /api/tenants/:tenantId
Authorization: Required

Success Response (200):

{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "value",
    "subdomain": "value",
    "status": "active",
    "subscriptionPlan": "pro",
    "maxUsers": 10,
    "maxProjects": 20,
    "createdAt": "timestamp",
    "stats": {
      "totalUsers": 5,
      "totalProjects": 3,
      "totalTasks": 15
    }
  }
}

Error Responses:

403: Unauthorized access
404: Tenant not found

6. Update Tenant

PUT /api/tenants/:tenantId
Authorization:Required

Request Body (Tenant Admin – limited)
{
  "name": "Updated Tenant Name"
}

Request Body (Super Admin – full access)
{
  "name": "Updated Tenant Name",
  "status": "active",
  "subscriptionPlan": "pro",
  "maxUsers": 20,
  "maxProjects": 10
}

Success Response (200)
{
  "success": true,
  "message": "Tenant updated successfully",
  "data": {
    "id": "uuid",
    "name": "Updated Tenant Name",
    "updatedAt": "2025-01-01T10:30:00Z"
  }
}

Error Responses

403 – Unauthorized role
404 – Tenant not found

User APIs

7. List Tenants

GET /api/tenants
Authorization:Required
Role: Super Admin

Success Response (200):

{
  "success": true,
  "data": {
    "tenants": [
      {
        "id": "uuid",
        "name": "value",
        "subdomain": "value",
        "status": "active",
        "subscriptionPlan": "pro",
        "totalUsers": 5,
        "totalProjects": 3,
        "createdAt": "timestamp"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalTenants": 47,
      "limit": 10
    }
  }
}

Error Responses:
403: Not super_admin

8. Add User to Tenant

POST /api/tenants/{TENANT_ID}/users
Authorization:Not Required
used: http://localhost:5000/api/tenants/a3fcb1c9-baef-45cf-b42c-a01970f8bccb/users

Headers:
Authorization: Bearer <TENANT_ADMIN_JWT>
Content-Type: application/json

Body:
{
  "email": "user1@acme.com",
  "fullName": "Acme User",
  "password": "User@123",
  "role": "user"
}

Response:
{
    "success": true,
    "message": "User created successfully",
    "data": {
        "id": "uuid",
        "email": "user1@acme.com",
        "fullName": "Acme User",
        "role": "user",
        "tenantId": "uuid",
        "isActive": true,
        "createdAt": "2025-12-26T03:12:24.164Z"
    }
}

Error Responses:

403: Subscription limit reached OR not authorized
409: Email already exists in this tenant

Users are created within a tenant scope, ensuring isolation and role-based access.

9. List Tenant Users

GET /api/tenants/{TENANT_ID}/users
Authorization:Required
used: http://localhost:5000/api/tenants/a3fcb1c9-baef-45cf-b42c-a01970f8bccb/users
Headers:
Authorization: Bearer <TENANT_ADMIN_JWT>
Content-Type: application/json

Response:
{
    "success": true,
    "data": {
        "users": [
            {
                "id": "uuid",
                "email": "user1@acme.com",
                "fullName": "Acme User",
                "role": "user",
                "isActive": true,
                "createdAt": "2025-12-26T03:12:24.164Z"
            },
            {
                "id": "uuid",
                "email": "admin@acme.com",
                "fullName": "Acme Admin",
                "role": "tenant_admin",
                "isActive": true,
                "createdAt": "2025-12-26T02:15:36.363Z"
            }
        ],
        "total": 2
    }
}

This returns only users belonging to the current tenant.

10. Update User
End point: PUT /api/users/:userId
Authentication:Required

Request Body (Self – limited access)
{
  "fullName": "Updated User Name"
}

Request Body (Tenant Admin – full access)
{
  "fullName": "Updated User Name",
  "role": "tenant_admin",
  "isActive": true
}

Request Body (Deactivate User – Tenant Admin)
{
  "isActive": false
}

Success Response (200)
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": "uuid",
    "fullName": "Updated User Name",
    "role": "user",
    "updatedAt": "2025-01-01T15:00:00Z"
  }
}

11. Delete User

DELETE /api/users/:userId
Authorization:Required

Success Response (200):
{
  "success": true,
  "message": "User deleted successfully"
}

Error Responses:

403: Cannot delete self OR not authorized
404: User not found

Project APIs
12. Create Project

POST /api/projects
Authorization:Required

Headers:
Authorization: Bearer <TENANT_ADMIN_JWT>
Content-Type: application/json

Body:
{
  "name": "Acme Website Revamp",
  "description": "Redesign company website"
}

Response:
{
    "success": true,
    "data": {
        "id": "uuid",
        "tenant_id": "uuid",
        "name": "Acme Website Revamp",
        "description": "Redesign company website",
        "status": "active",
        "created_by": "uuid",
        "created_at": "2025-12-26T03:54:22.254Z",
        "updated_at": "2025-12-26T03:54:22.254Z"
    }
}

Error Responses:

403:Project limit reached
Projects are always associated with a tenant.

13. List Projects

GET api/projects
Authorization:Required

Headers:
Authorization: Bearer <TENANT_ADMIN_JWT>
Content-Type: application/json

Response:
{
    "success": true,
    "data": {
        "projects": [
            {
                "id": "uuid",
                "name": "Acme Website Revamp",
                "description": "Redesign company website",
                "status": "active",
                "created_at": "2025-12-26T03:54:22.254Z",
                "createdBy": {
                    "id": "uuid",
                    "fullName": "Acme Admin"
                },
                "taskCount": "0",
                "completedTaskCount": "0"
            }
        ],
        "pagination": {
            "currentPage": 1,
            "limit": 20
        }
    }
}

14. Update Project

PUT /api/projects/:projectId
Authorization:Required

Request Body
{
  "name": "Updated Project Name",
  "description": "Updated project description",
  "status": "active"
}
tenant_admin

Project creator:

Request Body
{
  "name": "Updated Project Name",
  "description": "Updated project description",
  "status": "active"
}

Success Response (200)
{
  "success": true,
  "message": "Project updated successfully",
  "data": {
    "id": "uuid",
    "name": "Updated Project Name",
    "description": "Updated project description",
    "status": "active",
    "updatedAt": "2025-01-01T11:00:00Z"
  }
}

Error Responses

403 – Not authorized or tenant mismatch
404 – Project not found

15. Delete Project

DELETE /api/projects/:projectId
Authorization:Required

Success Response (200):

{
  "success": true,
  "message": "Project deleted successfully"
}

Error Responses:

403: Not authorized
404: Project not found OR belongs to different tenant

Task APIs
16. Create Task

POST /api/projects/:projectId/tasks
Authorization:Required

Request Body
{
  "title": "Design Login Page",
  "description": "Create UI for login screen",
  "assignedTo": "user-uuid",
  "priority": "high",
  "dueDate": "2025-01-20"
}

Success Response (201)
{
  "success": true,
  "data": {
    "id": "uuid",
    "projectId": "uuid",
    "tenantId": "uuid",
    "title": "Design Login Page",
    "description": "Create UI for login screen",
    "status": "todo",
    "priority": "high",
    "assignedTo": "user-uuid",
    "dueDate": "2025-01-20",
    "createdAt": "2025-01-01T12:00:00Z"
  }
}

Error Responses

403 – Project not in user tenant
400 – Assigned user not in same tenant

17. List Tasks

GET /api/projects/:projectId/tasks
Authorization:Required

Success Response (200):

{
  "success": true,
  "data": {
    "tasks": [
      {
        "id": "uuid",
        "title": "value",
        "description": "value",
        "status": "in_progress",
        "priority": "high",
        "assignedTo": {
          "id": "uuid",
          "fullName": "value",
          "email": "value"
        },
        "dueDate": "2024-07-01",
        "createdAt": "timestamp"
      }
    ],
    "total": 5,
   "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "limit": 50
    }
  }
}

18. Update Task Status

PATCH /api/tasks/:taskId
Authorization:Required

Request Body
{
  "status": "completed"
}

Success Response (200)
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "completed",
    "updatedAt": "2025-01-01T13:00:00Z"
  }
}

Error Responses

403 – Task not in user tenant
404 – Task not found

19. Update Task

PUT /api/tasks/:taskId
Authorization:Required

Request Body
{
  "title": "Update Login UI",
  "description": "Revamp UI with new colors",
  "status": "in_progress",
  "priority": "high",
  "assignedTo": "user-uuid",
  "dueDate": "2025-01-25"
}

Success Response (200)
{
  "success": true,
  "message": "Task updated successfully",
  "data": {
    "id": "uuid",
    "title": "Update Login UI",
    "description": "Revamp UI with new colors",
    "status": "in_progress",
    "priority": "high",
    "assignedTo": {
      "id": "uuid",
      "fullName": "Demo User",
      "email": "user@demo.com"
    },
    "dueDate": "2025-01-25",
    "updatedAt": "2025-01-01T14:00:00Z"
  }
}

Error Responses

403 – Task not in user tenant
400 – Assigned user not in same tenant
404 – Task not found

## MULTI-TENANCY DEMONSTRATION:

1. Login as Second Tenant
Repeat Register Tenant + Login

Body:
{
  "tenantName": "Demo Corp",
  "subdomain": "democorp",
  "subscriptionPlan": "pro",
  "adminFullName": "demo Admin",
  "adminEmail": "demo@acme.com",
  "adminPassword": "demo@123"
}

Response:
{
    "success": true,
    "message": "Tenant registered successfully",
    "data": {
        "tenantId": "uuid",
        "subdomain": "democorp",
        "adminUser": {
            "id": "uuid",
            "email": "demo@acme.com",
            "full_name": "demo Admin",
            "role": "tenant_admin"
        }
    }
}

Login:

body:
{
  "email": "demo@acme.com",
  "password": "demo@123",
  "subdomain": "democorp"
}

Response:
{
    "success": true,
    "data": {
        "user": {
            "id": "uuid",
            "email": "demo@acme.com",
            "fullName": "demo Admin",
            "role": "tenant_admin",
            "tenantId": "uuid"
        },
        "token": "JWT-token",
        "expiresIn": "24h"
    }
}

2. Data Isolation Proof

GET http://localhost:5000/api/projects
Headers:
Authorization: Bearer <second_TENANT_ADMIN_JWT>
Content-Type: application/json
Response:
{
    "success": true,
    "data": {
        "projects": [
            {
                "id": "uuid",
                "name": "Demo Websitep",
                "description": "Demonstration company website",
                "status": "active",
                "created_at": "2025-12-26T04:19:41.828Z",
                "createdBy": {
                    "id": "uuid",
                    "fullName": "demo Admin"
                },
                "taskCount": "0",
                "completedTaskCount": "0"
            }
        ],
        "pagination": {
            "currentPage": 1,
            "limit": 20
        }
    }
}

Projects from the previous tenant are not visible here.

3. Unauthorized Cross-Tenant Access (403)
GET http://localhost:5000/api/tenants/{OTHER_TENANT_ID}/users
example:http://localhost:5000/api/tenants/a3fcb1c9-baef-45cf-b42c-a01970f8bccb/users
Headers:
Authorization: Bearer <second_TENANT_ADMIN_JWT>
Content-Type: application/json
Response:
{
    "success": false,
    "message": "Forbidden"
}

Cross-tenant access is blocked. The backend returns 403, enforcing isolation.