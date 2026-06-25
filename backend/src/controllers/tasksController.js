import { sql } from '../db.js';

export async function listTasks(req, res, next) {
  try {
    const { completed, category, priority, page, limit } = req.query;
    const offset = (page - 1) * limit;

    const conditions = [sql`user_id = ${req.user.id}`];

    if (completed !== undefined) {
      conditions.push(sql`completed = ${completed === 'true'}`);
    }
    if (category) {
      conditions.push(sql`category = ${category}`);
    }
    if (priority) {
      conditions.push(sql`priority = ${priority}`);
    }

    const where = conditions.reduce((acc, cond, i) =>
      i === 0 ? cond : sql`${acc} AND ${cond}`
    );

    const countResult = await sql`SELECT COUNT(*) FROM tasks WHERE ${where}`;
    const total = parseInt(countResult.rows[0].count, 10);

    const tasksResult = await sql`
      SELECT * FROM tasks
      WHERE ${where}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    return res.json({
      success: true,
      data: { tasks: tasksResult.rows, total, page, limit },
    });
  } catch (err) {
    next(err);
  }
}

export async function createTask(req, res, next) {
  try {
    const { title, priority, category, dueDate } = req.validatedBody;
    const result = await sql`
      INSERT INTO tasks (user_id, title, priority, category, due_date)
      VALUES (${req.user.id}, ${title}, ${priority}, ${category || null}, ${dueDate || null})
      RETURNING *
    `;
    return res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

export async function updateTask(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await sql`SELECT id FROM tasks WHERE id = ${id} AND user_id = ${req.user.id}`;
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Task not found' } });
    }

    const { title, priority, category, dueDate, completed } = req.validatedBody;
    const result = await sql`
      UPDATE tasks SET
        title = COALESCE(${title || null}, title),
        priority = COALESCE(${priority || null}, priority),
        category = COALESCE(${category || null}, category),
        due_date = COALESCE(${dueDate || null}, due_date),
        completed = COALESCE(${completed !== undefined ? completed : null}, completed),
        updated_at = NOW()
      WHERE id = ${id} AND user_id = ${req.user.id}
      RETURNING *
    `;
    return res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

export async function deleteTask(req, res, next) {
  try {
    const { id } = req.params;
    const result = await sql`DELETE FROM tasks WHERE id = ${id} AND user_id = ${req.user.id} RETURNING id`;
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Task not found' } });
    }
    return res.json({ success: true, data: { success: true } });
  } catch (err) {
    next(err);
  }
}

export async function toggleTask(req, res, next) {
  try {
    const { id } = req.params;
    const result = await sql`
      UPDATE tasks
      SET completed = NOT completed, updated_at = NOW()
      WHERE id = ${id} AND user_id = ${req.user.id}
      RETURNING *
    `;
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Task not found' } });
    }
    return res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
}
