# Multi-Tenant SaaS Architecture Research & Design Decisions

## 1. Introduction
This document presents the architectural research and design decisions behind the Multi-Tenant SaaS Project & Task Management Platform. The goal of this system is to provide a scalable, secure, and production-ready SaaS application that supports multiple organizations (tenants) while ensuring strict data isolation, role-based access control, and operational reliability.

The application follows modern SaaS best practices including multi-tenancy, JWT-based authentication, role-based authorization, Docker-based deployment, and audit logging.

## 2. Multi-Tenancy Model Selection

### 2.1 Shared Database with Shared Schema
This project uses a **shared database with a shared schema**, where all tenants coexist in the same database and tables. Tenant isolation is enforced using a `tenant_id` column in all tenant-scoped tables.

**Reasons for choosing this approach:**
- Lower infrastructure cost
- Easier maintenance and deployment
- Centralized schema migrations
- Suitable for early-stage and mid-scale SaaS platforms

### 2.2 Tenant Isolation Strategy
Each tenant-scoped table (users, projects, tasks, audit_logs) includes a `tenant_id`. All queries are filtered by `tenant_id` unless the requesting user is a `super_admin`.

This guarantees that:
- Tenants cannot access each other’s data
- Accidental cross-tenant data leaks are prevented at the query level

## 3. Super Admin Design (Q1, Q6)

Super administrators are system-level users who are not associated with any tenant. In the database, this is represented by setting:

- `users.tenant_id = NULL`
- `users.role = 'super_admin'`

When a super_admin makes an API request:
- The JWT token contains `tenantId: null`
- Authorization logic bypasses tenant-based filtering
- Super admins can view and manage all tenants

This approach avoids artificial tenant assignment for system administrators and simplifies global operations such as tenant management and subscription control.

## 4. Authentication Strategy: JWT-Only vs Sessions (Q7, Q11)

### 4.1 JWT-Only Authentication (Chosen Approach)
This project uses **JWT-only authentication** without a mandatory sessions table.

**Workflow:**
- Login generates a signed JWT
- Client stores the token
- Token is verified on every request
- Logout is handled client-side by deleting the token

**Advantages:**
- Stateless and scalable
- No server-side session storage
- Easier horizontal scaling
- Ideal for containerized environments

### 4.2 Tradeoff: Sessions Table vs JWT
While session-based authentication allows server-side token revocation, it adds complexity and state management. Given the scope of this project, JWT-only authentication provides the best balance between security and simplicity.

## 5. JWT Payload Design (Q7)

Only minimal, non-sensitive data is included in the JWT payload:

- `userId`
- `tenantId` (null for super_admin)
- `role`

Sensitive data such as passwords or email addresses are never included in the token.

## 6. Role-Based Access Control (RBAC)

The system defines three roles:
- `super_admin`
- `tenant_admin`
- `user`

Authorization middleware enforces:
- Endpoint-level role checks
- Tenant-level access control
- Self-protection rules (e.g., tenant_admin cannot delete themselves)

RBAC ensures principle of least privilege across the system.

## 7. Data Integrity in Task & Project Creation (Q3)

When creating a task, the `tenant_id` is always derived from the associated project, not from the JWT token.

**Process:**
1. Verify project exists
2. Verify project belongs to the user’s tenant
3. Fetch `tenant_id` from project
4. Use this tenant_id when creating the task

This prevents malicious or accidental tenant_id manipulation.

## 8. Email Uniqueness per Tenant (Q4)

Email addresses are unique **per tenant**, not globally.

Database constraint:
UNIQUE (tenant_id, email)

This allows the same email to exist across different tenants while maintaining uniqueness within a tenant.

## 9. Subscription Limits Enforcement (Q5)

Each tenant has subscription limits such as:
- `max_users`
- `max_projects`

Before creating users or projects:
- Current count is checked
- Limits are enforced at API level
- Requests exceeding limits return HTTP 403

## 10. Tenant Registration as a Transaction (Q8)

Tenant registration is implemented as an atomic database transaction:
1. Create tenant
2. Create tenant_admin
3. Commit if successful
4. Rollback on failure

This prevents inconsistent states.

## 11. Audit Logging (Q12)

All critical actions are recorded in the `audit_logs` table, including:
- User management
- Project and task operations
- Tenant updates
- Authentication events (optional)

Audit logs improve traceability, debugging, and security monitoring.

## 12. Password Hashing Strategy (Q13)

Passwords are securely hashed using industry-standard algorithms such as bcrypt or Argon2.

- Plain-text passwords are never stored
- Password verification uses secure compare functions
- Weak algorithms like MD5 or SHA1 are never used

## 13. Data Deletion Strategy: Cascade vs NULL (Tradeoff)

Two strategies were considered:
- Cascade deletes
- Setting foreign keys to NULL

This project adopts a consistent approach where:
- Audit logs are preserved
- Tasks assigned to deleted users have `assigned_to = NULL`

This maintains historical integrity while preventing orphaned references.

## 14. Security Risks & Mitigations

### Risks:
- Cross-tenant data access
- JWT token leakage
- SQL injection
- Privilege escalation

### Mitigations:
- Strict tenant_id filtering
- JWT signature verification and expiry
- Parameterized queries
- Centralized authorization middleware

## 15. Docker-Based Deployment

Docker is used to ensure:
- Environment consistency
- Easy evaluation
- Reproducible builds
- One-command startup via docker-compose

All services (database, backend, frontend) are containerized and orchestrated together.

## 16. Conclusion

This architecture follows real-world SaaS best practices and balances scalability, security, and maintainability. The design choices made in this project align with modern production systems and demonstrate a strong understanding of multi-tenant SaaS architecture.
