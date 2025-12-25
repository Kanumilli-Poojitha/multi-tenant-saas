const db = require('../config/db');

/* ---------------------------------------
   API 12: Create Project
---------------------------------------- */
exports.createProject = async (req, res, next) => {
  try {
    const { name, description, status = 'active' } = req.body;
    const { tenantId, userId } = req.user;

    // 1. Check project limit
    const limitResult = await db.query(
      `
      SELECT
        COUNT(p.id) AS project_count,
        t.max_projects
      FROM tenants t
      LEFT JOIN projects p ON p.tenant_id = t.id
      WHERE t.id = $1
      GROUP BY t.max_projects
      `,
      [tenantId]
    );

    const { project_count, max_projects } = limitResult.rows[0];

    if (Number(project_count) >= max_projects) {
      return res.status(403).json({
        success: false,
        message: 'Project limit reached'
      });
    }

    // 2. Create project
    const result = await db.query(
      `
      INSERT INTO projects (
        tenant_id,
        name,
        description,
        status,
        created_by
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [tenantId, name, description, status, userId]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
};

/* ---------------------------------------
   API 13: List Projects
---------------------------------------- */
exports.listProjects = async (req, res, next) => {
  try {
    const { tenantId } = req.user;
    const { status, search, page = 1, limit = 20 } = req.query;

    const offset = (page - 1) * limit;

    let filters = `WHERE p.tenant_id = $1`;
    const values = [tenantId];
    let idx = 2;

    if (status) {
      filters += ` AND p.status = $${idx++}`;
      values.push(status);
    }

    if (search) {
      filters += ` AND LOWER(p.name) LIKE LOWER($${idx++})`;
      values.push(`%${search}%`);
    }

    const query = `
      SELECT
        p.id,
        p.name,
        p.description,
        p.status,
        p.created_at,
        json_build_object(
          'id', u.id,
          'fullName', u.full_name
        ) AS "createdBy",
        COUNT(t.id) AS "taskCount",
        COUNT(t.id) FILTER (WHERE t.status = 'completed') AS "completedTaskCount"
      FROM projects p
      JOIN users u ON u.id = p.created_by
      LEFT JOIN tasks t ON t.project_id = p.id
      ${filters}
      GROUP BY p.id, u.id
      ORDER BY p.created_at DESC
      LIMIT $${idx++} OFFSET $${idx}
    `;

    values.push(limit, offset);

    const projects = await db.query(query, values);

    res.json({
      success: true,
      data: {
        projects: projects.rows,
        pagination: {
          currentPage: Number(page),
          limit: Number(limit)
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

/* ---------------------------------------
   API 14: Update Project
---------------------------------------- */
exports.updateProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { name, description, status } = req.body;
    const { tenantId, userId, role } = req.user;

    // 1. Fetch project
    const projectResult = await db.query(
      `SELECT * FROM projects WHERE id = $1`,
      [projectId]
    );

    if (!projectResult.rowCount) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const project = projectResult.rows[0];

    if (project.tenant_id !== tenantId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (role !== 'tenant_admin' && project.created_by !== userId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // 2. Partial update
    const fields = [];
    const values = [];
    let idx = 1;

    if (name) {
      fields.push(`name = $${idx++}`);
      values.push(name);
    }
    if (description) {
      fields.push(`description = $${idx++}`);
      values.push(description);
    }
    if (status) {
      fields.push(`status = $${idx++}`);
      values.push(status);
    }

    if (!fields.length) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    const query = `
      UPDATE projects
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = $${idx}
      RETURNING id, name, description, status, updated_at
    `;

    values.push(projectId);

    const result = await db.query(query, values);

    res.json({
      success: true,
      message: 'Project updated successfully',
      data: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
};

/* ---------------------------------------
   API 15: Delete Project
---------------------------------------- */
exports.deleteProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { tenantId, userId, role } = req.user;

    const projectResult = await db.query(
      `SELECT * FROM projects WHERE id = $1`,
      [projectId]
    );

    if (!projectResult.rowCount) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const project = projectResult.rows[0];

    if (project.tenant_id !== tenantId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (role !== 'tenant_admin' && project.created_by !== userId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Delete project (tasks handled via FK or cascade)
    await db.query(`DELETE FROM projects WHERE id = $1`, [projectId]);

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};