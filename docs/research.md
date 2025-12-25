# Multi-Tenant SaaS Architecture Research & Design Decisions

## 1. Introduction
This document presents the research, architectural analysis, and design decisions behind the **Multi-Tenant SaaS Project & Task Management Platform**. The objective of this system is to build a production-ready SaaS application that supports multiple organizations (tenants) while ensuring strict data isolation, secure authentication, role-based access control (RBAC), and scalable deployment.

The system is designed using modern SaaS best practices including multi-tenancy, JWT-based authentication, RESTful APIs, Docker-based containerization, and audit logging.

## 2. Multi-Tenancy Architecture Analysis
Multi-tenancy is a core requirement of SaaS systems, allowing multiple organizations to share the same application while keeping their data fully isolated. Three common multi-tenancy approaches were evaluated.

### 2.1 Multi-Tenancy Approaches Comparison

| Approach | Description | Pros | Cons |
|--------|------------|------|------|
| Shared DB + Shared Schema | All tenants share the same database and tables, isolated via tenant_id | Low cost, simple migrations, easy scaling | Requires strict query-level isolation |
| Shared DB + Separate Schema | One database, separate schema per tenant | Better isolation, easier per-tenant backups | Complex schema management, harder migrations |
| Separate Database per Tenant | Each tenant has its own database | Strong isolation, independent scaling | High cost, operational complexity |

### 2.2 Chosen Approach: Shared Database + Shared Schema
This project uses a shared database with a shared schema, where all tenant-scoped tables include a `tenant_id` column.

**Reasons for selection:**
- Cost-effective for early to mid-scale SaaS products
- Simplified schema migrations
- Easier Docker-based deployment
- Suitable for centralized management and evaluation

Tenant isolation is enforced strictly at the API and database query level.

## 3. Tenant Isolation Strategy
Each tenant-scoped table (`users`, `projects`, `tasks`, `audit_logs`) includes a `tenant_id`.  
All API queries are filtered using `tenant_id` derived from the authenticated JWT token.

This ensures:
- Tenants cannot access other tenants’ data
- No cross-tenant data leakage through API manipulation
- Strong logical isolation despite shared infrastructure

## 4. Super Admin Design
Super administrators are system-level users not associated with any tenant.

Database representation:
- `users.tenant_id = NULL`
- `users.role = 'super_admin'`

Behavior:
- JWT contains `tenantId = null`
- Tenant-based query filtering is bypassed
- Super admins can manage all tenants and subscriptions

This avoids artificial tenant assignment and simplifies global administration.

## 5. Authentication Strategy

### 5.1 JWT-Based Authentication (Chosen)
The system uses **JWT-only authentication** with a 24-hour expiry.

Workflow:
1. User logs in
2. Server issues signed JWT
3. Token is sent with each request
4. Token is verified using middleware

Advantages:
- Stateless and scalable
- Ideal for containerized environments
- No server-side session storage required

### 5.2 JWT Payload Design
JWT payload includes only:
- `userId`
- `tenantId`
- `role`

Sensitive data is never included in the token.

## 6. Role-Based Access Control (RBAC)
Three roles are supported:
- `super_admin`
- `tenant_admin`
- `user`

Authorization is enforced at:
- API endpoint level
- Tenant access level
- Resource ownership level

RBAC follows the principle of least privilege and prevents unauthorized actions.

## 7. Database Design & Integrity
Key design considerations:
- Foreign keys with CASCADE deletes where appropriate
- Unique constraint on `(tenant_id, email)`
- Indexes on tenant_id columns for performance

Task creation derives `tenant_id` from the associated project, preventing malicious manipulation.

## 8. Subscription Management
Three subscription plans are supported:
- Free: 5 users, 3 projects
- Pro: 25 users, 15 projects
- Enterprise: 100 users, 50 projects

Limits are enforced at API level before resource creation.  
New tenants default to the free plan.

## 9. Transaction Safety
Critical operations (such as tenant registration) are executed inside database transactions:
1. Create tenant
2. Create tenant admin
3. Commit on success
4. Rollback on failure

This prevents partial or inconsistent states.

## 10. Audit Logging
All important actions are recorded in the `audit_logs` table, including:
- User management
- Project and task operations
- Tenant updates

Audit logging improves traceability, security monitoring, and debugging.

## 11. Security Considerations
Key security measures implemented:
1. Strict tenant_id filtering
2. JWT signature verification and expiry
3. Secure password hashing (bcrypt/Argon2)
4. Parameterized SQL queries
5. Centralized authorization middleware

These measures protect against:
- Cross-tenant access
- SQL injection
- Privilege escalation
- Token misuse

## 12. Docker-Based Deployment
The application is fully containerized using Docker and Docker Compose:
- Database
- Backend
- Frontend

All services start with a single command:
docker-compose up -d
This ensures environment consistency and simplifies evaluation.

## 13. Conclusion
This architecture follows real-world SaaS best practices and balances scalability, security, and maintainability. The design decisions align with production-grade systems and demonstrate a solid understanding of multi-tenant SaaS architecture.