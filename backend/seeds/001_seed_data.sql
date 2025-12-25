-- ======================
-- SEED DATA
-- ======================

-- SUPER ADMIN
INSERT INTO users (id, tenant_id, email, password_hash, full_name, role, is_active, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    NULL,
    'superadmin@system.com',
    '$2b$10$hashedAdmin123',  -- replace with actual bcrypt hash of Admin@123
    'Super Admin',
    'super_admin',
    TRUE,
    NOW(),
    NOW()
);

-- SAMPLE TENANT
INSERT INTO tenants (id, name, subdomain, status, subscription_plan, max_users, max_projects, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'Demo Company',
    'demo',
    'active',
    'pro',
    10,  -- example max_users for pro plan
    10,  -- example max_projects for pro plan
    NOW(),
    NOW()
);

-- TENANT ADMIN
INSERT INTO users (id, tenant_id, email, password_hash, full_name, role, is_active, created_at, updated_at)
SELECT
    gen_random_uuid(),
    t.id,
    'admin@demo.com',
    '$2b$10$hashedDemo123',  -- replace with actual bcrypt hash of Demo@123
    'Tenant Admin',
    'tenant_admin',
    TRUE,
    NOW(),
    NOW()
FROM tenants t
WHERE t.subdomain = 'demo';

-- REGULAR USER 1
INSERT INTO users (id, tenant_id, email, password_hash, full_name, role, is_active, created_at, updated_at)
SELECT
    gen_random_uuid(),
    t.id,
    'user1@demo.com',
    '$2b$10$hashedUser123',  -- replace with bcrypt hash of User@123
    'User One',
    'user',
    TRUE,
    NOW(),
    NOW()
FROM tenants t
WHERE t.subdomain = 'demo';

-- REGULAR USER 2
INSERT INTO users (id, tenant_id, email, password_hash, full_name, role, is_active, created_at, updated_at)
SELECT
    gen_random_uuid(),
    t.id,
    'user2@demo.com',
    '$2b$10$hashedUser123',  -- same hash as above for simplicity
    'User Two',
    'user',
    TRUE,
    NOW(),
    NOW()
FROM tenants t
WHERE t.subdomain = 'demo';

-- SAMPLE PROJECT 1
INSERT INTO projects (id, tenant_id, name, description, status, created_by, created_at, updated_at)
SELECT
    gen_random_uuid(),
    t.id,
    'Project Alpha',
    'First sample project for Demo Company',
    'active',
    u.id,
    NOW(),
    NOW()
FROM tenants t
JOIN users u ON u.tenant_id = t.id
WHERE t.subdomain = 'demo' AND u.role = 'tenant_admin'
LIMIT 1;

-- SAMPLE PROJECT 2
INSERT INTO projects (id, tenant_id, name, description, status, created_by, created_at, updated_at)
SELECT
    gen_random_uuid(),
    t.id,
    'Project Beta',
    'Second sample project for Demo Company',
    'active',
    u.id,
    NOW(),
    NOW()
FROM tenants t
JOIN users u ON u.tenant_id = t.id
WHERE t.subdomain = 'demo' AND u.role = 'tenant_admin'
LIMIT 1;

-- TASKS DISTRIBUTED ACROSS PROJECTS
-- Task 1 for Project Alpha
INSERT INTO tasks (id, project_id, tenant_id, title, description, status, priority, assigned_to, due_date, created_at, updated_at)
SELECT
    gen_random_uuid(),
    p.id,
    t.id,
    'Design Database Schema',
    'Create initial ERD and migrations',
    'todo',
    'high',
    u.id,
    NOW() + INTERVAL '7 days',
    NOW(),
    NOW()
FROM tenants t
JOIN projects p ON p.tenant_id = t.id
JOIN users u ON u.tenant_id = t.id
WHERE p.name = 'Project Alpha' AND u.role = 'tenant_admin'
LIMIT 1;

-- Task 2 for Project Alpha
INSERT INTO tasks (id, project_id, tenant_id, title, description, status, priority, assigned_to, due_date, created_at, updated_at)
SELECT
    gen_random_uuid(),
    p.id,
    t.id,
    'Setup Backend API',
    'Initialize backend project structure and endpoints',
    'in_progress',
    'medium',
    u.id,
    NOW() + INTERVAL '10 days',
    NOW(),
    NOW()
FROM tenants t
JOIN projects p ON p.tenant_id = t.id
JOIN users u ON u.tenant_id = t.id
WHERE p.name = 'Project Alpha' AND u.role = 'user'
LIMIT 1;

-- Task 3 for Project Beta
INSERT INTO tasks (id, project_id, tenant_id, title, description, status, priority, assigned_to, due_date, created_at, updated_at)
SELECT
    gen_random_uuid(),
    p.id,
    t.id,
    'Frontend UI Design',
    'Create React components and pages',
    'todo',
    'high',
    u.id,
    NOW() + INTERVAL '7 days',
    NOW(),
    NOW()
FROM tenants t
JOIN projects p ON p.tenant_id = t.id
JOIN users u ON u.tenant_id = t.id
WHERE p.name = 'Project Beta' AND u.role = 'tenant_admin'
LIMIT 1;

-- Task 4 for Project Beta
INSERT INTO tasks (id, project_id, tenant_id, title, description, status, priority, assigned_to, due_date, created_at, updated_at)
SELECT
    gen_random_uuid(),
    p.id,
    t.id,
    'Setup CI/CD',
    'Integrate deployment pipeline',
    'in_progress',
    'medium',
    u.id,
    NOW() + INTERVAL '5 days',
    NOW(),
    NOW()
FROM tenants t
JOIN projects p ON p.tenant_id = t.id
JOIN users u ON u.tenant_id = t.id
WHERE p.name = 'Project Beta' AND u.role = 'user'
LIMIT 1;

-- Task 5 for Project Beta
INSERT INTO tasks (id, project_id, tenant_id, title, description, status, priority, assigned_to, due_date, created_at, updated_at)
SELECT
    gen_random_uuid(),
    p.id,
    t.id,
    'Write Documentation',
    'Document database schema, API, and project structure',
    'todo',
    'low',
    u.id,
    NOW() + INTERVAL '3 days',
    NOW(),
    NOW()
FROM tenants t
JOIN projects p ON p.tenant_id = t.id
JOIN users u ON u.tenant_id = t.id
WHERE p.name = 'Project Beta' AND u.role = 'user'
LIMIT 1;
