import { sql } from '../db.js';

export async function getSettings(req, res, next) {
  try {
    const result = await sql`SELECT settings FROM users WHERE id = ${req.user.id}`;
    const settings = result.rows[0]?.settings ?? {};
    return res.json({ success: true, data: settings });
  } catch (err) {
    next(err);
  }
}

export async function updateSettings(req, res, next) {
  try {
    const result = await sql`
      UPDATE users
      SET settings = settings || ${JSON.stringify(req.validatedBody)}::jsonb
      WHERE id = ${req.user.id}
      RETURNING settings
    `;
    return res.json({ success: true, data: result.rows[0].settings });
  } catch (err) {
    next(err);
  }
}
