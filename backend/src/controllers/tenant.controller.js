const db = require('../config/db');
const { logAudit } = require('../services/audit.service');

/**
 * GET TENANT BY ID
 * Tenant admin → only own tenant
 * Super admin → any tenant
 */
exports.getTenantById = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { role, tenantId: userTenantId } = req.user;

    if (role === 'tenant_admin' && tenantId !== userTenantId) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden'
      });
    }

    const result = await db.query(
      `SELECT 
        id,
        name,
        subdomain,
        status,
        subscription_plan,
        max_users,
        max_projects,
        created_at
       FROM tenants
       WHERE id = $1`,
      [tenantId]
    );

    if (!result.rowCount) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('getTenantById error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * UPDATE TENANT
 * Tenant admin → only name (own tenant)
 * Super admin → all fields
 */
exports.updateTenant = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { role, tenantId: userTenantId, userId } = req.user;

    // Tenant admin can only update own tenant
    if (role === 'tenant_admin' && tenantId !== userTenantId) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden'
      });
    }

    const fields = [];
    const values = [];
    let index = 1;

    // Tenant admin: ONLY name
    if (req.body.name) {
      fields.push(`name = $${index++}`);
      values.push(req.body.name);
    }

    // Super admin: everything
    if (role === 'super_admin') {
      if (req.body.status) {
        fields.push(`status = $${index++}`);
        values.push(req.body.status);
      }
      if (req.body.subscriptionPlan) {
        fields.push(`subscription_plan = $${index++}`);
        values.push(req.body.subscriptionPlan);
      }
      if (req.body.maxUsers !== undefined) {
        fields.push(`max_users = $${index++}`);
        values.push(req.body.maxUsers);
      }
      if (req.body.maxProjects !== undefined) {
        fields.push(`max_projects = $${index++}`);
        values.push(req.body.maxProjects);
      }
    }

    // Nothing valid to update
    if (!fields.length) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }

    const query = `
      UPDATE tenants
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = $${index}
      RETURNING id, name, updated_at
    `;

    values.push(tenantId);

    const result = await db.query(query, values);

    if (!result.rowCount) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found'
      });
    }

    // Audit log (safe userId)
    await logAudit({
      tenantId,
      userId: userId || null,
      action: 'TENANT_UPDATED',
      entityType: 'tenant',
      entityId: tenantId
    });

    res.json({
      success: true,
      message: 'Tenant updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('updateTenant error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * LIST TENANTS
 * Super admin ONLY
 */
exports.listTenants = async (req, res) => {
  try {
    const { role } = req.user;

    if (role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden'
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const result = await db.query(
      `SELECT
        id,
        name,
        subdomain,
        status,
        subscription_plan,
        max_users,
        max_projects,
        created_at
       FROM tenants
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    res.json({
      success: true,
      data: result.rows,
      page,
      limit
    });
  } catch (error) {
    console.error('listTenants error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};