const express = require("express");
const cors = require("cors");
const errorHandler = require("./middlewares/error.middleware");

const healthCheck = require("./health");

const authRoutes = require("./routes/auth.routes");
const tenantRoutes = require("./routes/tenant.routes");
const tenantUsersRoutes = require("./routes/tenantUsers.routes");
const usersRoutes = require("./routes/users.routes");
const projectRoutes = require("./routes/project.routes");
const projectTaskRoutes = require("./routes/projectTasks.routes");
const taskRoutes = require("./routes/task.routes");

const app = express();

/**
 * ✅ CORS CONFIG (MANDATORY PER SPEC)
 * - Docker: http://frontend:3000
 * - Local:  http://localhost:3000
 */
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());

// ✅ REQUIRED HEALTH CHECK
app.get("/api/health", healthCheck);

app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

app.use("/api/auth", authRoutes);
app.use("/api/tenants", tenantRoutes);
app.use("/api/tenants", tenantUsersRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api", projectTaskRoutes);
app.use("/api", taskRoutes);

app.use(errorHandler);

module.exports = app;