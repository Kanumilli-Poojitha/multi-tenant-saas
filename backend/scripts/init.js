const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const { pool } = require("../src/db");

async function runSQLFiles(folder) {
  const files = fs.readdirSync(folder).filter(f => f.endsWith(".sql")).sort();

  for (const file of files) {
    console.log(`📄 Running ${file}`);
    const sql = fs.readFileSync(path.join(folder, file), "utf8");
    await pool.query(sql);
  }
}

async function runSeeds() {
  console.log("🌱 Seeding data...");

  const adminPass = await bcrypt.hash("Admin@123", 10);
  await pool.query(`
    INSERT INTO users (email, password_hash, full_name, role)
    VALUES ('superadmin@system.com', '${adminPass}', 'Super Admin', 'super_admin')
    ON CONFLICT DO NOTHING;
  `);

  const tenant = await pool.query(`
    INSERT INTO tenants (name, subdomain)
    VALUES ('Demo Tenant', 'demo')
    ON CONFLICT (subdomain) DO NOTHING
    RETURNING id;
  `);

  const tenantId =
    tenant.rows[0]?.id ||
    (await pool.query("SELECT id FROM tenants WHERE subdomain='demo'"))
      .rows[0].id;

  const tenantPass = await bcrypt.hash("Tenant@123", 10);
  await pool.query(`
    INSERT INTO users (tenant_id, email, password_hash, full_name, role)
    VALUES ('${tenantId}', 'admin@demo.com', '${tenantPass}', 'Tenant Admin', 'tenant_admin')
    ON CONFLICT DO NOTHING;
  `);

  const userPass = await bcrypt.hash("User@123", 10);
  await pool.query(`
    INSERT INTO users (tenant_id, email, password_hash, full_name, role)
    VALUES ('${tenantId}', 'user@demo.com', '${userPass}', 'Demo User', 'user')
    ON CONFLICT DO NOTHING;
  `);

  console.log("✅ Seeds completed");
}

async function init() {
  try {
    await runSQLFiles(path.join(__dirname, "../migrations"));
    await runSeeds();
    console.log("✅ Init finished");
    process.exit(0);
  } catch (err) {
    console.error("❌ Init failed", err);
    process.exit(1);
  }
}

init();