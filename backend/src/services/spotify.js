import crypto from 'node:crypto';
import config from '../config.js';

const SPOTIFY_ACCOUNTS = 'https://accounts.spotify.com';
const SPOTIFY_API = 'https://api.spotify.com/v1';
const SCOPES = [
  'streaming',
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-email',
].join(' ');

function generateRandomString(length) {
  return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
}

function base64urlencode(buffer) {
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export function generateCodeVerifier() {
  return generateRandomString(64);
}

export function generateCodeChallenge(verifier) {
  return base64urlencode(crypto.createHash('sha256').update(verifier).digest());
}

export function getAuthUrl(codeVerifier, codeChallenge) {
  const params = new URLSearchParams({
    client_id: config.SPOTIFY_CLIENT_ID,
    response_type: 'code',
    redirect_uri: config.SPOTIFY_REDIRECT_URI,
    scope: SCOPES,
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
  });
  return `${SPOTIFY_ACCOUNTS}/authorize?${params.toString()}`;
}

export async function exchangeCode(code, codeVerifier) {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: config.SPOTIFY_REDIRECT_URI,
    client_id: config.SPOTIFY_CLIENT_ID,
    code_verifier: codeVerifier,
  });

  const res = await fetch(`${SPOTIFY_ACCOUNTS}/api/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!res.ok) {
    const err = await res.json();
    throw Object.assign(new Error(err.error_description || 'Token exchange failed'), { status: 400 });
  }

  const data = await res.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
  };
}

export async function refreshAccessToken(refreshToken) {
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: config.SPOTIFY_CLIENT_ID,
  });

  const res = await fetch(`${SPOTIFY_ACCOUNTS}/api/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!res.ok) {
    const err = await res.json();
    throw Object.assign(new Error(err.error_description || 'Token refresh failed'), { status: 401 });
  }

  const data = await res.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token || refreshToken,
    expiresIn: data.expires_in,
  };
}

export async function search(query, type, accessToken) {
  const params = new URLSearchParams({ q: query, type, limit: '10' });
  const res = await fetch(`${SPOTIFY_API}/search?${params.toString()}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const err = await res.json();
    throw Object.assign(new Error(err.error?.message || 'Spotify search failed'), { status: res.status });
  }

  return res.json();
}

export async function play(contextUri, accessToken, deviceId) {
  const body = { context_uri: contextUri };
  if (deviceId) body.device_id = deviceId;

  const res = await fetch(`${SPOTIFY_API}/me/player/play`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok && res.status !== 204) {
    const err = await res.json().catch(() => ({}));
    throw Object.assign(new Error(err.error?.message || 'Spotify play failed'), { status: res.status });
  }

  return true;
}
