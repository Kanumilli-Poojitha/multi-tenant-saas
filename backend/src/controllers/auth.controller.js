const db = require("../config/db");
const jwt = require("jsonwebtoken");
const { JWT_SECRET, JWT_EXPIRES_IN } = require("../config/jwt");
const { hashPassword, comparePassword } = require("../utils/password");
const { logAudit } = require("../services/audit.service");

exports.registerTenant = async (req, res, next) => {
  const client = await db.getClient();

  try {
    const {
      tenantName,
      subdomain,
      adminEmail,
      adminPassword,
      adminFullName,
    } = req.body;

    await client.query("BEGIN");

    const exists = await client.query(
      "SELECT 1 FROM tenants WHERE subdomain = $1",
      [subdomain]
    );

    if (exists.rowCount) {
      await client.query("ROLLBACK");
      return res.status(409).json({
        success: false,
        message: "Subdomain already exists",
      });
    }

    const tenantResult = await client.query(
      `
      INSERT INTO tenants (
        id, name, subdomain, status, subscription_plan,
        max_users, max_projects, created_at
      )
      VALUES (
        gen_random_uuid(), $1, $2, 'active', 'free', 5, 3, NOW()
      )
      RETURNING id, subdomain
      `,
      [tenantName, subdomain]
    );

    const tenantId = tenantResult.rows[0].id;

    const passwordHash = await hashPassword(adminPassword);

    const adminResult = await client.query(
      `
      INSERT INTO users (
        id, tenant_id, email, password_hash,
        full_name, role, is_active, created_at
      )
      VALUES (
        gen_random_uuid(), $1, $2, $3, $4, 'tenant_admin', true, NOW()
      )
      RETURNING id, email, full_name, role
      `,
      [tenantId, adminEmail, passwordHash, adminFullName]
    );

    await client.query("COMMIT");

    res.status(201).json({
      success: true,
      message: "Tenant registered successfully",
      data: {
        tenantId,
        subdomain,
        adminUser: adminResult.rows[0],
      },
    });
  } catch (err) {
    await client.query("ROLLBACK");
    next(err);
  } finally {
    client.release();
  }
};

/**
 * Login (Super Admin + Tenant Users)
 */
exports.login = async (req, res) => {
  const { email, password, subdomain } = req.body;

  /* =========================
     SUPER ADMIN LOGIN
     ========================= */
  const superAdmin = await db.query(
    "SELECT * FROM users WHERE email = $1 AND role = 'super_admin'",
    [email]
  );

  if (superAdmin.rowCount) {
    const user = superAdmin.rows[0];

    if (!(await comparePassword(password, user.password_hash))) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          role: user.role,
        },
        token,
        expiresIn: JWT_EXPIRES_IN,
      },
    });
  }

  /* =========================
     TENANT USER LOGIN
     ========================= */
  if (!subdomain) {
    return res.status(400).json({
      success: false,
      message: "subdomain is required",
    });
  }

  const tenantResult = await db.query(
    "SELECT id FROM tenants WHERE subdomain = $1 AND status = $2",
    [subdomain, "active"]
  );

  if (!tenantResult.rowCount) {
    return res.status(404).json({
      success: false,
      message: "Tenant not found",
    });
  }

  const tenantId = tenantResult.rows[0].id;

  const userResult = await db.query(
    "SELECT * FROM users WHERE email = $1 AND tenant_id = $2",
    [email, tenantId]
  );

  if (
    !userResult.rowCount ||
    !(await comparePassword(password, userResult.rows[0].password_hash))
  ) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials",
    });
  }

  const user = userResult.rows[0];

  if (!user.is_active) {
    return res.status(403).json({
      success: false,
      message: "Account inactive",
    });
  }

  const token = jwt.sign(
    {
      userId: user.id,
      tenantId,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        tenantId,
      },
      token,
      expiresIn: JWT_EXPIRES_IN,
    },
  });
};

/**
 * Get current user
 */
exports.me = async (req, res) => {
  const result = await db.query(
    `SELECT
      u.id,
      u.email,
      u.full_name,
      u.role,
      u.is_active,
      t.id AS tenant_id,
      t.name,
      t.subdomain,
      t.subscription_plan,
      t.max_users,
      t.max_projects
     FROM users u
     LEFT JOIN tenants t ON t.id = u.tenant_id
     WHERE u.id = $1`,
    [req.user.userId]
  );

  if (!result.rowCount) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  const r = result.rows[0];

  res.json({
    success: true,
    data: {
      id: r.id,
      email: r.email,
      fullName: r.full_name,
      role: r.role,
      isActive: r.is_active,
      tenant: r.tenant_id
        ? {
            id: r.tenant_id,
            name: r.name,
            subdomain: r.subdomain,
            subscriptionPlan: r.subscription_plan,
            maxUsers: r.max_users,
            maxProjects: r.max_projects,
          }
        : null,
    },
  });
};

/**
 * Logout (JWT is stateless)
 */
exports.logout = async (req, res) => {
  await logAudit({
    tenantId: req.user.tenantId || null,
    userId: req.user.userId,
    action: "LOGOUT",
    entityType: "auth",
    entityId: req.user.userId,
  });

  res.json({
    success: true,
    message: "Logged out successfully",
  });
};