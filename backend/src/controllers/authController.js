import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sql } from '../db.js';
import config from '../config.js';
import { GoogleIdTokenVerifier } from 'google-auth-library';

const SALT_ROUNDS = 10;
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY_DAYS = 30;

function generateAccessToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, config.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
}

async function storeRefreshToken(userId) {
  const token = crypto.randomUUID();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

  await sql`INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (${userId}, ${token}, ${expiresAt.toISOString()})`;
  return token;
}

export async function register(req, res, next) {
  try {
    const { email, password } = req.validatedBody;

    const existing = await sql`SELECT id FROM users WHERE email = ${email}`;
    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: { code: 'CONFLICT', message: 'Email already registered' },
      });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const result = await sql`INSERT INTO users (email, password_hash) VALUES (${email}, ${passwordHash}) RETURNING id, email, created_at`;
    const user = result.rows[0];

    const accessToken = generateAccessToken(user);
    const refreshToken = await storeRefreshToken(user.id);

    res.status(201).json({
      success: true,
      data: { accessToken, refreshToken, user: { id: user.id, email: user.email } },
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.validatedBody;

    const result = await sql`SELECT id, email, password_hash FROM users WHERE email = ${email}`;
    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Invalid email or password' },
      });
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Invalid email or password' },
      });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = await storeRefreshToken(user.id);

    res.json({
      success: true,
      data: { accessToken, refreshToken, user: { id: user.id, email: user.email } },
    });
  } catch (err) {
    next(err);
  }
}

export async function refreshToken(req, res, next) {
  try {
    const { refreshToken: token } = req.validatedBody;

    const result = await sql`SELECT id, user_id, expires_at, revoked FROM refresh_tokens WHERE token = ${token}`;
    if (result.rows.length === 0 || result.rows[0].revoked) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Invalid refresh token' },
      });
    }

    if (new Date(result.rows[0].expires_at) < new Date()) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Refresh token expired' },
      });
    }

    await sql`UPDATE refresh_tokens SET revoked = true WHERE id = ${result.rows[0].id}`;

    const userResult = await sql`SELECT id, email FROM users WHERE id = ${result.rows[0].user_id}`;
    const user = userResult.rows[0];

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = await storeRefreshToken(user.id);

    res.json({
      success: true,
      data: { accessToken: newAccessToken, refreshToken: newRefreshToken },
    });
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res, next) {
  try {
    const { refreshToken: token } = req.validatedBody;

    await sql`UPDATE refresh_tokens SET revoked = true WHERE token = ${token}`;
    res.json({ success: true, data: { success: true } });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req, res, next) {
  try {
    const result = await sql`SELECT id, email, settings, created_at FROM users WHERE id = ${req.user.id}`;
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'User not found' },
      });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

export async function googleAuth(req, res, next) {
  try {
    const { idToken } = req.validatedBody;

    const verifier = new GoogleIdTokenVerifier({
      audience: config.GOOGLE_CLIENT_ID,
    });
    const ticket = await verifier.verify(idToken);
    const payload = ticket.getPayload();

    let result = await sql`SELECT id, email FROM users WHERE google_id = ${payload.sub}`;
    if (result.rows.length === 0) {
      result = await sql`INSERT INTO users (email, google_id) VALUES (${payload.email}, ${payload.sub}) RETURNING id, email`;
    }
    const user = result.rows[0];

    const accessToken = generateAccessToken(user);
    const refreshToken = await storeRefreshToken(user.id);

    res.json({
      success: true,
      data: { accessToken, refreshToken, user: { id: user.id, email: user.email } },
    });
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Invalid Google token' },
    });
  }
}
