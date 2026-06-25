const requiredVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'ALLOWED_ORIGIN',
  'OPENAI_API_KEY',
  'ENCRYPTION_KEY',
];

const optionalVars = [
  'SPOTIFY_CLIENT_ID',
  'SPOTIFY_CLIENT_SECRET',
  'SPOTIFY_REDIRECT_URI',
  'YOUTUBE_CLIENT_ID',
  'YOUTUBE_CLIENT_SECRET',
  'YOUTUBE_REDIRECT_URI',
  'GOOGLE_CLIENT_ID',
];

const config = {};

for (const v of requiredVars) {
  if (!process.env[v]) {
    throw new Error(`Missing required env var: ${v}`);
  }
  config[v] = process.env[v];
}

for (const v of optionalVars) {
  config[v] = process.env[v] || null;
}

export default config;
