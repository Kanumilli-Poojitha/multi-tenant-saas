const fs = require("fs");
const path = require("path");
const { pool } = require("./db");

async function runMigrations() {
  const migrationsDir = path.join(__dirname, "../migrations");

  const files = fs
    .readdirSync(migrationsDir)
    .filter(f => f.endsWith(".sql"))
    .sort(); // 🔑 ENSURES enums run first

  for (const file of files) {
    console.log(`📄 Running migration: ${file}`);
    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
    await pool.query(sql);
  }

  console.log("✅ Migrations completed");
}

module.exports = runMigrations;