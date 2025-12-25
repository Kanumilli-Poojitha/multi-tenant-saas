const db = require('../config/db');

exports.logAudit = async ({
  tenantId = null,
  userId = null,
  action,
  entityType = null,
  entityId = null,
  ipAddress = null
}) => {
  try {
    await db.query(
      `INSERT INTO audit_logs (
        tenant_id,
        user_id,
        action,
        entity_type,
        entity_id,
        ip_address
      )
      VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        tenantId || null,
        userId || null,
        action,
        entityType,
        entityId,
        ipAddress
      ]
    );
  } catch (err) {
    console.error('Audit log failed:', err.message);
  }
};