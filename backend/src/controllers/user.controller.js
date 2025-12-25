const db = require('../config/db');
const bcrypt = require('bcryptjs');
const { logAudit } = require('../services/audit.service');

/**
 * API 8 — Add User to Tenant
 */
exports.addUserToTenant = async (req, res) => {
  const { tenantId } = req.params;
  const { email, password, fullName, role = 'user' } = req.body;
  const { role: userRole, tenantId: adminTenantId, userId } = req.user;

  if (userRole !== 'tenant_admin' || tenantId !== adminTenantId) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  // Check tenant user limit
  const limitResult = await db.query(
    `SELECT max_users FROM tenants WHERE id = $1`,
    [tenantId]
  );

  const countResult = await db.query(
    `SELECT COUNT(*) FROM users WHERE tenant_id = $1`,
    [tenantId]
  );

  if (Number(countResult.rows[0].count) >= limitResult.rows[0].max_users) {
    return res.status(403).json({
      success: false,
      message: 'Subscription limit reached'
    });
  }

  // Check duplicate email in same tenant
  const existing = await db.query(
    `SELECT 1 FROM users WHERE email = $1 AND tenant_id = $2`,
    [email, tenantId]
  );

  if (existing.rowCount) {
    return res.status(409).json({
      success: false,
      message: 'Email already exists in this tenant'
    });
  }

  const passwordHash = bcrypt.hashSync(password, 10);

  const result = await db.query(
    `INSERT INTO users (email, password_hash, full_name, role, tenant_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, email, full_name, role, tenant_id, is_active, created_at`,
    [email, passwordHash, fullName, role, tenantId]
  );

  await logAudit({
    tenantId,
    userId,
    action: 'USER_CREATED',
    entityType: 'user',
    entityId: result.rows[0].id
  });

  res.status(201).json({
    success: true,
    message: 'User created successfully',
    data: {
      id: result.rows[0].id,
      email: result.rows[0].email,
      fullName: result.rows[0].full_name,
      role: result.rows[0].role,
      tenantId: result.rows[0].tenant_id,
      isActive: result.rows[0].is_active,
      createdAt: result.rows[0].created_at
    }
  });
};

/**
 * API 9 — List Tenant Users
 */
exports.listTenantUsers = async (req, res) => {
  const { tenantId } = req.params;
  const { tenantId: userTenantId } = req.user;

  if (tenantId !== userTenantId) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  const result = await db.query(
    `SELECT id, email, full_name, role, is_active, created_at
     FROM users
     WHERE tenant_id = $1
     ORDER BY created_at DESC`,
    [tenantId]
  );

  res.json({
    success: true,
    data: {
      users: result.rows.map(u => ({
        id: u.id,
        email: u.email,
        fullName: u.full_name,
        role: u.role,
        isActive: u.is_active,
        createdAt: u.created_at
      })),
      total: result.rowCount
    }
  });
};

/**
 * API 10 — Update User
 */
exports.updateUser = async (req, res) => {
  const { userId } = req.params;
  const { role, tenantId, userId: requesterId } = req.user;

  if (role !== 'tenant_admin' && requesterId !== userId) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  const fields = [];
  const values = [];
  let idx = 1;

  if (req.body.fullName) {
    fields.push(`full_name = $${idx++}`);
    values.push(req.body.fullName);
  }

  if (role === 'tenant_admin') {
    if (req.body.role) {
      fields.push(`role = $${idx++}`);
      values.push(req.body.role);
    }
    if (req.body.isActive !== undefined) {
      fields.push(`is_active = $${idx++}`);
      values.push(req.body.isActive);
    }
  }

  if (!fields.length) {
    return res.status(400).json({ success: false, message: 'No valid fields' });
  }

  values.push(userId, tenantId);

  const result = await db.query(
    `UPDATE users
     SET ${fields.join(', ')}, updated_at = NOW()
     WHERE id = $${idx++} AND tenant_id = $${idx}
     RETURNING id, full_name, role, updated_at`,
    values
  );

  if (!result.rowCount) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  await logAudit({
    tenantId,
    userId: requesterId,
    action: 'USER_UPDATED',
    entityType: 'user',
    entityId: userId
  });

  res.json({
    success: true,
    message: 'User updated successfully',
    data: result.rows[0]
  });
};

/**
 * API 11 — Delete User
 */
exports.deleteUser = async (req, res) => {
  const { userId } = req.params;
  const { role, userId: requesterId, tenantId } = req.user;

  if (role !== 'tenant_admin' || requesterId === userId) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  const result = await db.query(
    `DELETE FROM users WHERE id = $1 AND tenant_id = $2`,
    [userId, tenantId]
  );

  if (!result.rowCount) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  await logAudit({
    tenantId,
    userId: requesterId,
    action: 'USER_DELETED',
    entityType: 'user',
    entityId: userId
  });

  res.json({
    success: true,
    message: 'User deleted successfully'
  });
};