const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const { pool } = require("../src/config/db");

const LOCK_FILE = "/tmp/db_initialized.lock";

if (fs.existsSync(LOCK_FILE)) {
  console.log("⚠️ Database already initialized. Skipping migrations & seeds.");
  process.exit(0);
}

async function waitForDB() {
  console.log("⏳ Waiting for database...");
  for (let i = 1; i <= 15; i++) {
    try {
      await pool.query("SELECT 1");
      console.log("✅ Connected to PostgreSQL");
      return;
    } catch (err) {
      console.log(`⏳ Retry ${i}/15...`);
      await new Promise(res => setTimeout(res, 2000));
    }
  }
  throw new Error("Database not ready after retries");
}

async function runSQLFiles(folder) {
  const files = fs
    .readdirSync(folder)
    .filter(f => f.endsWith(".sql") && !f.endsWith(".down.sql"))
    .sort();

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

  const tenantResult = await pool.query(`
    INSERT INTO tenants (name, subdomain, status, subscription_plan, max_users, max_projects)
    VALUES ('Demo Tenant', 'demo', 'active', 'free', 5, 3)
    ON CONFLICT (subdomain) DO NOTHING
    RETURNING id;
  `);

  const tenantId =
    tenantResult.rows[0]?.id ||
    (await pool.query("SELECT id FROM tenants WHERE subdomain='demo'")).rows[0].id;

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
    await waitForDB();
    console.log("🚀 Running migrations...");
    await runSQLFiles(path.join(__dirname, "../migrations"));
    await runSeeds();
    fs.writeFileSync(LOCK_FILE, "initialized");
    console.log("🔒 Init lock created");

    console.log("✅ Init finished successfully");
    process.exit(0);
  } catch (err) {
    console.error("❌ Init failed", err);
    process.exit(1);
  }
}

init();