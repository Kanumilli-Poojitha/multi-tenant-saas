const { pool, isDbReady } = require("./config/db");

const healthCheck = async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({
      status: "ok",
      database: "connected",
    });
  } catch (err) {
    res.status(503).json({
      status: "starting",
      database: "not_ready",
    });
  }
};

module.exports = healthCheck;