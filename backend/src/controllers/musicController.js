import { sql } from '../db.js';
import { encrypt, decrypt } from '../services/encryption.js';
import * as spotify from '../services/spotify.js';
import * as youtube from '../services/youtube.js';

function parseCookies(header) {
  const cookies = {};
  if (!header) return cookies;
  for (const pair of header.split(';')) {
    const [key, ...rest] = pair.split('=');
    cookies[key.trim()] = rest.join('=').trim();
  }
  return cookies;
}

async function getValidSpotifyToken(userId) {
  const result = await sql`
    SELECT id, access_token, refresh_token, expires_at
    FROM music_tokens
    WHERE user_id = ${userId} AND service = 'spotify'
    LIMIT 1
  `;

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];
  const expiresAt = new Date(row.expires_at);
  const now = new Date();
  const fiveMinutes = 5 * 60 * 1000;

  if (expiresAt.getTime() - now.getTime() > fiveMinutes) {
    return decrypt(row.access_token);
  }

  const refreshed = await spotify.refreshAccessToken(decrypt(row.refresh_token));
  const newExpiresAt = new Date(Date.now() + refreshed.expiresIn * 1000);

  await sql`
    UPDATE music_tokens
    SET access_token = ${encrypt(refreshed.accessToken)},
        refresh_token = ${encrypt(refreshed.refreshToken)},
        expires_at = ${newExpiresAt.toISOString()}
    WHERE id = ${row.id}
  `;

  return refreshed.accessToken;
}

async function getValidYoutubeToken(userId) {
  const result = await sql`
    SELECT id, access_token, refresh_token, expires_at
    FROM music_tokens
    WHERE user_id = ${userId} AND service = 'youtube'
    LIMIT 1
  `;

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];
  const expiresAt = new Date(row.expires_at);
  const now = new Date();
  const fiveMinutes = 5 * 60 * 1000;

  if (expiresAt.getTime() - now.getTime() > fiveMinutes) {
    return decrypt(row.access_token);
  }

  const refreshed = await youtube.refreshAccessToken(decrypt(row.refresh_token));
  const newExpiresAt = new Date(Date.now() + refreshed.expiresIn * 1000);

  await sql`
    UPDATE music_tokens
    SET access_token = ${encrypt(refreshed.accessToken)},
        refresh_token = ${encrypt(refreshed.refreshToken)},
        expires_at = ${newExpiresAt.toISOString()}
    WHERE id = ${row.id}
  `;

  return refreshed.accessToken;
}

export async function getSpotifyAuthUrl(req, res) {
  try {
    const codeVerifier = spotify.generateCodeVerifier();
    const codeChallenge = spotify.generateCodeChallenge(codeVerifier);
    const url = spotify.getAuthUrl(codeVerifier, codeChallenge);

    res.setHeader(
      'Set-Cookie',
      `spotify_code_verifier=${codeVerifier}; Path=/api/music/spotify/callback; HttpOnly; Secure; SameSite=Lax; Max-Age=600`
    );

    return res.json({ success: true, data: { url, code_verifier: codeVerifier } });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to generate Spotify auth URL' },
    });
  }
}

export async function spotifyCallback(req, res, next) {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Missing authorization code' },
      });
    }

    const cookies = parseCookies(req.headers.cookie);
    const codeVerifier = cookies.spotify_code_verifier || req.body.code_verifier;
    if (!codeVerifier) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Missing code verifier' },
      });
    }

    const tokens = await spotify.exchangeCode(code, codeVerifier);
    const expiresAt = new Date(Date.now() + tokens.expiresIn * 1000);

    const existing = await sql`
      SELECT id FROM music_tokens
      WHERE user_id = ${req.user.id} AND service = 'spotify'
      LIMIT 1
    `;

    if (existing.rows.length > 0) {
      await sql`
        UPDATE music_tokens
        SET access_token = ${encrypt(tokens.accessToken)},
            refresh_token = ${encrypt(tokens.refreshToken)},
            expires_at = ${expiresAt.toISOString()},
            extra_data = NULL
        WHERE id = ${existing.rows[0].id}
      `;
    } else {
      await sql`
        INSERT INTO music_tokens (user_id, service, access_token, refresh_token, expires_at)
        VALUES (${req.user.id}, 'spotify', ${encrypt(tokens.accessToken)}, ${encrypt(tokens.refreshToken)}, ${expiresAt.toISOString()})
      `;
    }

    return res.json({ success: true, data: { connected: true } });
  } catch (err) {
    next(err);
  }
}

export async function getSpotifyToken(req, res) {
  try {
    const accessToken = await getValidSpotifyToken(req.user.id);
    if (!accessToken) {
      return res.status(400).json({
        success: false,
        error: { code: 'NOT_CONNECTED', message: 'Spotify not connected' },
      });
    }

    return res.json({ success: true, data: { accessToken } });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to retrieve Spotify token' },
    });
  }
}

export async function spotifySearch(req, res, next) {
  try {
    const { q, type } = req.query;
    if (!q) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Missing query parameter q' },
      });
    }

    const accessToken = await getValidSpotifyToken(req.user.id);
    if (!accessToken) {
      return res.status(400).json({
        success: false,
        error: { code: 'NOT_CONNECTED', message: 'Spotify not connected' },
      });
    }

    const results = await spotify.search(q, type || 'track', accessToken);
    return res.json({ success: true, data: results });
  } catch (err) {
    next(err);
  }
}

export async function spotifyPlay(req, res, next) {
  try {
    const { uri, device_id } = req.body;
    if (!uri) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Missing playback URI' },
      });
    }

    const accessToken = await getValidSpotifyToken(req.user.id);
    if (!accessToken) {
      return res.status(400).json({
        success: false,
        error: { code: 'NOT_CONNECTED', message: 'Spotify not connected' },
      });
    }

    await spotify.play(uri, accessToken, device_id);
    return res.json({ success: true, data: { playing: true } });
  } catch (err) {
    next(err);
  }
}

export async function getYoutubeAuthUrl(req, res) {
  try {
    const url = youtube.getAuthUrl();
    return res.json({ success: true, data: { url } });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to generate YouTube auth URL' },
    });
  }
}

export async function youtubeCallback(req, res, next) {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Missing authorization code' },
      });
    }

    const tokens = await youtube.exchangeCode(code);
    const expiresAt = new Date(Date.now() + tokens.expiresIn * 1000);

    const existing = await sql`
      SELECT id FROM music_tokens
      WHERE user_id = ${req.user.id} AND service = 'youtube'
      LIMIT 1
    `;

    if (existing.rows.length > 0) {
      await sql`
        UPDATE music_tokens
        SET access_token = ${encrypt(tokens.accessToken)},
            refresh_token = ${encrypt(tokens.refreshToken)},
            expires_at = ${expiresAt.toISOString()},
            extra_data = NULL
        WHERE id = ${existing.rows[0].id}
      `;
    } else {
      await sql`
        INSERT INTO music_tokens (user_id, service, access_token, refresh_token, expires_at)
        VALUES (${req.user.id}, 'youtube', ${encrypt(tokens.accessToken)}, ${encrypt(tokens.refreshToken)}, ${expiresAt.toISOString()})
      `;
    }

    return res.json({ success: true, data: { connected: true } });
  } catch (err) {
    next(err);
  }
}

export async function youtubeSearch(req, res, next) {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Missing query parameter q' },
      });
    }

    const accessToken = await getValidYoutubeToken(req.user.id);
    if (!accessToken) {
      return res.status(400).json({
        success: false,
        error: { code: 'NOT_CONNECTED', message: 'YouTube not connected' },
      });
    }

    const results = await youtube.search(q, accessToken);
    return res.json({ success: true, data: results });
  } catch (err) {
    next(err);
  }
}

export async function youtubePlay(req, res) {
  try {
    const { videoId } = req.body;
    if (!videoId) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Missing videoId' },
      });
    }

    return res.json({ success: true, data: { videoId } });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'YouTube play failed' },
    });
  }
}
