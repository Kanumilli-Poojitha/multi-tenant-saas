const db = require('../config/db');

/* ---------------------------------------
   API 16: Create Task
---------------------------------------- */
exports.createTask = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { title, description, assignedTo, priority = 'medium', dueDate } = req.body;

    // 1. Verify project & tenant
    const projectResult = await db.query(
      `SELECT id, tenant_id FROM projects WHERE id = $1`,
      [projectId]
    );

    if (!projectResult.rowCount) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const project = projectResult.rows[0];

    if (project.tenant_id !== req.user.tenantId) {
      return res.status(403).json({ success: false, message: 'Project does not belong to your tenant' });
    }

    // 2. Validate assigned user
    if (assignedTo) {
      const userCheck = await db.query(
        `SELECT id FROM users WHERE id = $1 AND tenant_id = $2`,
        [assignedTo, project.tenant_id]
      );

      if (!userCheck.rowCount) {
        return res.status(400).json({
          success: false,
          message: 'Assigned user does not belong to same tenant'
        });
      }
    }

    // 3. Insert task
    const result = await db.query(
      `
      INSERT INTO tasks (
        project_id,
        tenant_id,
        title,
        description,
        status,
        priority,
        assigned_to,
        due_date
      )
      VALUES ($1, $2, $3, $4, 'todo', $5, $6, $7)
      RETURNING *
      `,
      [
        projectId,
        project.tenant_id,
        title,
        description,
        priority,
        assignedTo || null,
        dueDate || null
      ]
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
   API 17: List Project Tasks
---------------------------------------- */
exports.listProjectTasks = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { status, assignedTo, priority, search, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    // Verify project belongs to tenant
    const projectCheck = await db.query(
      `SELECT id FROM projects WHERE id = $1 AND tenant_id = $2`,
      [projectId, req.user.tenantId]
    );

    if (!projectCheck.rowCount) {
      return res.status(403).json({ success: false, message: 'Project not accessible' });
    }

    let filters = `WHERE t.project_id = $1`;
    const values = [projectId];
    let idx = 2;

    if (status) {
      filters += ` AND t.status = $${idx++}`;
      values.push(status);
    }

    if (assignedTo) {
      filters += ` AND t.assigned_to = $${idx++}`;
      values.push(assignedTo);
    }

    if (priority) {
      filters += ` AND t.priority = $${idx++}`;
      values.push(priority);
    }

    if (search) {
      filters += ` AND LOWER(t.title) LIKE LOWER($${idx++})`;
      values.push(`%${search}%`);
    }

    const query = `
      SELECT
        t.id,
        t.title,
        t.description,
        t.status,
        t.priority,
        t.due_date,
        t.created_at,
        json_build_object(
          'id', u.id,
          'fullName', u.full_name,
          'email', u.email
        ) AS "assignedTo"
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      ${filters}
      ORDER BY
        CASE t.priority
          WHEN 'high' THEN 1
          WHEN 'medium' THEN 2
          ELSE 3
        END,
        t.due_date ASC
      LIMIT $${idx++} OFFSET $${idx}
    `;

    values.push(limit, offset);

    const tasks = await db.query(query, values);

    res.json({
      success: true,
      data: {
        tasks: tasks.rows,
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
   API 18: Update Task Status
---------------------------------------- */
exports.updateTaskStatus = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;

    const result = await db.query(
      `
      UPDATE tasks t
      SET status = $1, updated_at = NOW()
      FROM projects p
      WHERE t.id = $2
        AND t.project_id = p.id
        AND p.tenant_id = $3
      RETURNING t.id, t.status, t.updated_at
      `,
      [status, taskId, req.user.tenantId]
    );

    if (!result.rowCount) {
      return res.status(403).json({ success: false, message: 'Task not accessible' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

/* ---------------------------------------
   API 19: Update Task
---------------------------------------- */
exports.updateTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { title, description, status, priority, assignedTo, dueDate } = req.body;

    const fields = [];
    const values = [];
    let idx = 1;

    if (title) fields.push(`title = $${idx++}`), values.push(title);
    if (description) fields.push(`description = $${idx++}`), values.push(description);
    if (status) fields.push(`status = $${idx++}`), values.push(status);
    if (priority) fields.push(`priority = $${idx++}`), values.push(priority);
    if (assignedTo !== undefined) fields.push(`assigned_to = $${idx++}`), values.push(assignedTo);
    if (dueDate !== undefined) fields.push(`due_date = $${idx++}`), values.push(dueDate);

    if (!fields.length) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    const query = `
      UPDATE tasks t
      SET ${fields.join(', ')}, updated_at = NOW()
      FROM projects p
      WHERE t.id = $${idx}
        AND t.project_id = p.id
        AND p.tenant_id = $${idx + 1}
      RETURNING t.*
    `;

    values.push(taskId, req.user.tenantId);

    const result = await db.query(query, values);

    if (!result.rowCount) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
};
