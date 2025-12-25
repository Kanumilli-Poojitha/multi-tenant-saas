const { pool, isDbReady } = require("./db");

const healthCheck = async (req, res) => {
  if (!isDbReady()) {
    return res.status(503).json({
      status: "starting",
      database: "not_ready",
    });
  }

  try {
    await pool.query("SELECT 1");
    res.json({
      status: "ok",
      database: "connected",
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      database: "disconnected",
    });
  }
};

module.exports = healthCheck;