const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

let dbReady = false;

const connectWithRetry = async () => {
  let retries = 5;

  while (retries) {
    try {
      await pool.query("SELECT 1");
      console.log("✅ Connected to PostgreSQL");
      dbReady = true;
      return;
    } catch (err) {
      retries -= 1;
      console.log(`⏳ DB not ready, retrying... (${retries} left)`);
      await new Promise(res => setTimeout(res, 5000));
    }
  }

  console.error("❌ Could not connect to DB after retries");
  process.exit(1);
};

connectWithRetry();

module.exports = {
  pool,
  isDbReady: () => dbReady,
};