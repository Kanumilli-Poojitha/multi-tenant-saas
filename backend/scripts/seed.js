const bcrypt = require("bcrypt");
const { pool } = require("./db");

async function runSeeds() {
  console.log("🌱 Running seeds...");

  // Super Admin (tenant_id = NULL)
  const superPassword = await bcrypt.hash("Admin@123", 10);

  const superAdmin = await pool.query(
    `
    INSERT INTO users (email, password_hash, full_name, role)
    VALUES ($1, $2, $3, 'super_admin')
    ON CONFLICT DO NOTHING
    RETURNING id
    `,
    ["superadmin@system.com", superPassword, "Super Admin"]
  );

  // Tenant
  const tenantRes = await pool.query(
    `
    INSERT INTO tenants (name, subdomain, status, subscription_plan)
    VALUES ('Demo Tenant', 'demo', 'active', 'free')
    ON CONFLICT (subdomain) DO NOTHING
    RETURNING id
    `
  );

  const tenantId =
    tenantRes.rows[0]?.id ||
    (await pool.query("SELECT id FROM tenants WHERE subdomain='demo'"))
      .rows[0].id;

  // Tenant Admin
  const tenantAdminPassword = await bcrypt.hash("Tenant@123", 10);

  const tenantAdmin = await pool.query(
    `
    INSERT INTO users (tenant_id, email, password_hash, full_name, role)
    VALUES ($1, $2, $3, $4, 'tenant_admin')
    ON CONFLICT DO NOTHING
    RETURNING id
    `,
    [tenantId, "admin@demo.com", tenantAdminPassword, "Tenant Admin"]
  );

  const tenantAdminId =
    tenantAdmin.rows[0]?.id ||
    (
      await pool.query(
        "SELECT id FROM users WHERE email='admin@demo.com'"
      )
    ).rows[0].id;

  // Regular User
  const userPassword = await bcrypt.hash("User@123", 10);

  const userRes = await pool.query(
    `
    INSERT INTO users (tenant_id, email, password_hash, full_name, role)
    VALUES ($1, $2, $3, $4, 'user')
    ON CONFLICT DO NOTHING
    RETURNING id
    `,
    [tenantId, "user@demo.com", userPassword, "Demo User"]
  );

  const userId =
    userRes.rows[0]?.id ||
    (await pool.query("SELECT id FROM users WHERE email='user@demo.com'"))
      .rows[0].id;

  // Project
  const projectRes = await pool.query(
    `
    INSERT INTO projects (tenant_id, name, created_by)
    VALUES ($1, 'Demo Project', $2)
    RETURNING id
    `,
    [tenantId, tenantAdminId]
  );

  const projectId = projectRes.rows[0].id;

  // Task
  await pool.query(
    `
    INSERT INTO tasks (tenant_id, project_id, title, assigned_to)
    VALUES ($1, $2, 'Demo Task', $3)
    `,
    [tenantId, projectId, userId]
  );

  console.log("✅ Seed data loaded");
}

module.exports = runSeeds;