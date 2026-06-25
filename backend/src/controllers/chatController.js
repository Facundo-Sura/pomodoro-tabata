import crypto from 'node:crypto';
import { sql } from '../db.js';
import { streamChat } from '../services/openai.js';

export async function sendMessage(req, res, next) {
  try {
    const { message, sessionId } = req.body;
    const userId = req.user.id;
    const sessionIdFinal = sessionId || crypto.randomUUID();

    await sql`
      INSERT INTO chat_history (user_id, session_id, role, content)
      VALUES (${userId}, ${sessionIdFinal}, 'user', ${message})
    `;

    const history = await sql`
      SELECT role, content FROM chat_history
      WHERE user_id = ${userId} AND session_id = ${sessionIdFinal}
      ORDER BY created_at ASC
      LIMIT 20
    `;

    const messages = history.map((m) => ({ role: m.role, content: m.content }));

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    let aborted = false;
    req.on('close', () => {
      aborted = true;
    });

    let fullResponse = '';

    try {
      fullResponse = await streamChat(messages, (chunk) => {
        if (!aborted) {
          res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
        }
      });
    } catch (err) {
      if (!aborted) {
        res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      }
      return;
    }

    if (!aborted) {
      await sql`
        INSERT INTO chat_history (user_id, session_id, role, content)
        VALUES (${userId}, ${sessionIdFinal}, 'assistant', ${fullResponse})
      `;

      res.write('data: [DONE]\n\n');
      res.end();
    }
  } catch (err) {
    next(err);
  }
}

export async function getHistory(req, res, next) {
  try {
    const userId = req.user.id;
    const { session_id } = req.query;

    if (!session_id) {
      return res.status(400).json({
        success: false,
        error: 'session_id query param is required',
      });
    }

    const messages = await sql`
      SELECT id, role, content, created_at FROM chat_history
      WHERE user_id = ${userId} AND session_id = ${session_id}
      ORDER BY created_at ASC
    `;

    res.json({ messages, sessionId: session_id });
  } catch (err) {
    next(err);
  }
}
