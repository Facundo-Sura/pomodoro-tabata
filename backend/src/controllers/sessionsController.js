import { sql } from '../db.js';

export async function createSession(req, res, next) {
  try {
    const { type, duration, rounds, taskId } = req.validatedBody;
    const result = await sql`
      INSERT INTO sessions (user_id, type, duration_minutes, rounds, task_id)
      VALUES (${req.user.id}, ${type}, ${duration}, ${rounds || 1}, ${taskId || null})
      RETURNING *
    `;
    return res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

export async function listSessions(req, res, next) {
  try {
    const { page, limit, type } = req.query;
    const offset = (page - 1) * limit;

    const conditions = [sql`user_id = ${req.user.id}`];

    if (type) {
      conditions.push(sql`type = ${type}`);
    }

    const where = conditions.reduce((acc, cond, i) =>
      i === 0 ? cond : sql`${acc} AND ${cond}`
    );

    const countResult = await sql`SELECT COUNT(*) FROM sessions WHERE ${where}`;
    const total = parseInt(countResult.rows[0].count, 10);

    const sessionsResult = await sql`
      SELECT * FROM sessions
      WHERE ${where}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    return res.json({
      success: true,
      data: { sessions: sessionsResult.rows, total, page, limit },
    });
  } catch (err) {
    next(err);
  }
}

export async function getStats(req, res, next) {
  try {
    const userId = req.user.id;

    const totalsResult = await sql`
      SELECT
        COUNT(*) FILTER (WHERE type = 'pomodoro') AS total_pomodoros,
        COUNT(*) FILTER (WHERE type = 'tabata') AS total_tabatas,
        COALESCE(SUM(duration_minutes) FILTER (WHERE type = 'pomodoro'), 0) AS total_focus_minutes,
        COALESCE(SUM(duration_minutes) FILTER (WHERE type = 'tabata'), 0) AS total_training_minutes,
        COUNT(*) AS total_sessions
      FROM sessions
      WHERE user_id = ${userId}
    `;

    const todayResult = await sql`
      SELECT COUNT(*) AS today
      FROM sessions
      WHERE user_id = ${userId}
        AND created_at >= CURRENT_DATE
    `;

    const weekResult = await sql`
      SELECT COUNT(*) AS this_week
      FROM sessions
      WHERE user_id = ${userId}
        AND created_at >= DATE_TRUNC('week', NOW())
    `;

    const streakRows = await sql`
      WITH daily_sessions AS (
        SELECT DISTINCT DATE(created_at) AS session_day
        FROM sessions
        WHERE user_id = ${userId}
      ),
      streak_groups AS (
        SELECT
          session_day,
          session_day - DENSE_RANK() OVER (ORDER BY session_day DESC)::int AS grp
        FROM daily_sessions
      )
      SELECT
        COUNT(*) AS streak_length,
        MAX(session_day) AS latest_day
      FROM streak_groups
      GROUP BY grp
      ORDER BY latest_day DESC
    `;

    let currentStreak = 0;
    let longestStreak = 0;

    if (streakRows.rows.length > 0) {
      const streakLengths = streakRows.rows.map((r) => parseInt(r.streak_length, 10));
      longestStreak = Math.max(...streakLengths);

      const latestDay = new Date(streakRows.rows[0].latest_day);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      latestDay.setHours(0, 0, 0, 0);
      const diffDays = Math.floor((today - latestDay) / (1000 * 60 * 60 * 24));

      if (diffDays <= 1) {
        currentStreak = parseInt(streakRows.rows[0].streak_length, 10);
      }
    }

    const stats = {
      total_pomodoros: parseInt(totalsResult.rows[0].total_pomodoros, 10),
      total_tabatas: parseInt(totalsResult.rows[0].total_tabatas, 10),
      total_focus_minutes: parseInt(totalsResult.rows[0].total_focus_minutes, 10),
      total_training_minutes: parseInt(totalsResult.rows[0].total_training_minutes, 10),
      total_sessions: parseInt(totalsResult.rows[0].total_sessions, 10),
      current_streak: currentStreak,
      longest_streak: longestStreak,
      this_week: parseInt(weekResult.rows[0].this_week, 10),
      today: parseInt(todayResult.rows[0].today, 10),
    };

    return res.json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
}
