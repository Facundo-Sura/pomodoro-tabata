# Productivity Hub — Backend API

REST API for the Productivity Hub application. Express.js on Vercel serverless, PostgreSQL persistence, JWT authentication.

## Tech Stack

- **Runtime**: Node.js 20+ (ES Modules)
- **Framework**: Express.js 4
- **Database**: PostgreSQL via `@vercel/postgres`
- **Auth**: JWT (access + refresh tokens), Google OAuth
- **Validation**: Zod
- **AI**: OpenAI API (streaming via SSE)
- **Music**: Spotify Web API (PKCE), YouTube Data API
- **Deployment**: Vercel Serverless

## Prerequisites

- Node.js 20+ (or Bun)
- PostgreSQL database (Vercel Postgres, Supabase, or local)
- Vercel account (for deployment)
- OpenAI API key
- Spotify Developer account (optional, for music integration)
- YouTube Data API key (optional, for music integration)

## Local Development

1. Clone the repo and navigate to the backend:
   ```bash
   git clone <repo-url>
   cd productivity-hub/backend
   ```

2. Install dependencies:
   ```bash
   bun install
   # or
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

4. Create database tables:
   ```bash
   bun run db:setup
   ```

5. Start the dev server:
   ```bash
   bun run dev
   ```

The API runs at `http://localhost:3000` by default.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Secret for signing access tokens |
| `JWT_REFRESH_SECRET` | Yes | Secret for signing refresh tokens |
| `ALLOWED_ORIGIN` | Yes | Frontend URL for CORS (e.g., `http://localhost:5173`) |
| `OPENAI_API_KEY` | Yes | OpenAI API key for chat |
| `ENCRYPTION_KEY` | Yes | 32-byte hex key for encrypting music tokens. Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `SPOTIFY_CLIENT_ID` | No | Spotify app client ID |
| `SPOTIFY_CLIENT_SECRET` | No | Spotify app client secret |
| `SPOTIFY_REDIRECT_URI` | No | Spotify OAuth callback URL |
| `YOUTUBE_CLIENT_ID` | No | Google Cloud YouTube OAuth client ID |
| `YOUTUBE_CLIENT_SECRET` | No | Google Cloud YouTube OAuth client secret |
| `YOUTUBE_REDIRECT_URI` | No | YouTube OAuth callback URL |
| `GOOGLE_CLIENT_ID` | No | Google OAuth client ID for user sign-in |

## API Endpoints

### Health

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/health` | No | Health check |

### Auth (`/api/auth`)

Rate limited: 5 requests per 15 minutes.

| Method | Path | Auth | Body | Description |
|--------|------|------|------|-------------|
| POST | `/register` | No | `{email, password}` | Register new user |
| POST | `/login` | No | `{email, password}` | Login |
| POST | `/refresh` | No | `{refresh_token}` | Rotate refresh token |
| POST | `/logout` | Yes | `{refresh_token}` | Revoke refresh token |
| GET | `/me` | — | — | Get current user |
| POST | `/google` | No | `{idToken}` | Google OAuth sign-in |

### User (`/api/user`)

| Method | Path | Auth | Body | Description |
|--------|------|------|------|-------------|
| GET | `/settings` | Yes | — | Get user settings |
| PUT | `/settings` | Yes | `{...settings}` | Update settings (deep merge) |

### Tasks (`/api/tasks`)

| Method | Path | Auth | Body/Params | Description |
|--------|------|------|-------------|-------------|
| GET | `/` | Yes | `?completed=&category=&priority=` | List tasks (filtered) |
| POST | `/` | Yes | `{title, priority?, category?, due_date?}` | Create task |
| PUT | `/:id` | Yes | `{title?, priority?, ...}` | Update task |
| DELETE | `/:id` | Yes | — | Delete task |
| PATCH | `/:id/toggle` | Yes | — | Toggle completed |

### Sessions (`/api/sessions`)

| Method | Path | Auth | Body/Params | Description |
|--------|------|------|-------------|-------------|
| POST | `/` | Yes | `{type, duration, rounds, task_id?}` | Create session |
| GET | `/` | Yes | `?page=1&limit=20` | List sessions (paginated) |
| GET | `/stats` | Yes | — | Get session statistics |

### Music (`/api/music`)

| Method | Path | Auth | Body/Params | Description |
|--------|------|------|-------------|-------------|
| GET | `/spotify/auth-url` | Yes | — | Get Spotify OAuth URL (PKCE) |
| POST | `/spotify/callback` | Yes | `{code, code_verifier}` | Exchange Spotify code |
| GET | `/spotify/token` | Yes | — | Get valid Spotify token |
| GET | `/spotify/search` | Yes | `?q=&type=track` | Search Spotify |
| POST | `/spotify/play` | Yes | `{uri, device_id?}` | Play on Spotify |
| GET | `/youtube/auth-url` | Yes | — | Get YouTube OAuth URL |
| POST | `/youtube/callback` | Yes | `{code}` | Exchange YouTube code |
| GET | `/youtube/search` | Yes | `?q=` | Search YouTube |
| POST | `/youtube/play` | Yes | `{videoId}` | Play YouTube video |

### Chat (`/api/chat`)

| Method | Path | Auth | Body/Params | Description |
|--------|------|------|-------------|-------------|
| POST | `/` | Yes | `{message, session_id?}` | Send message (SSE stream) |
| GET | `/history` | Yes | `?session_id=&limit=50` | Get chat history |

## Database Schema

```
┌──────────────┐     ┌────────────────┐     ┌──────────────┐
│    users     │     │ refresh_tokens │     │    tasks     │
├──────────────┤     ├────────────────┤     ├──────────────┤
│ id (UUID PK) │◄──┐│ id (UUID PK)   │     │ id (UUID PK) │
│ email (uniq) │   ││ user_id (FK)   │────►│ user_id (FK) │──┐
│ password_hash│   ││ token (unique) │     │ title        │  │
│ google_id    │   ││ expires_at     │     │ priority     │  │
│ settings     │   ││ revoked        │     │ category     │  │
│ created_at   │   ││ created_at     │     │ completed    │  │
└──────────────┘   │└────────────────┘     │ due_date     │  │
       │           │                       │ created_at   │  │
       │           │                       │ updated_at   │  │
       │           │                       └──────────────┘  │
       │           │                                         │
       │           │     ┌────────────────┐     ┌───────────┘
       │           │     │    sessions    │     │
       │           │     ├────────────────┤     │
       │           │     │ id (UUID PK)   │     │
       │           │◄──┐│ user_id (FK)   │─────┘
       │           │   ││ type           │
       │           │   ││ duration       │
       │           │   ││ rounds         │
       │           │   ││ task_id (FK)   │──►tasks
       │           │   ││ created_at     │
       │           │   │└────────────────┘
       │           │   │
       │           │   │  ┌────────────────┐     ┌────────────────┐
       │           │   │  │  music_tokens  │     │  chat_history  │
       │           │   │  ├────────────────┤     ├────────────────┤
       │           │   │  │ id (UUID PK)   │     │ id (UUID PK)   │
       │           │   └─►│ user_id (FK)   │     │ user_id (FK)   │──┐
       │           │      │ service        │     │ session_id     │  │
       │           │      │ access_token   │     │ role           │  │
       │           │      │ refresh_token  │     │ content        │  │
       │           │      │ expires_at     │     │ created_at     │  │
       │           │      │ extra_data     │     └────────────────┘  │
       │           │      │ created_at     │                         │
       │           │      └────────────────┘                         │
       │           │                                                 │
       └───────────┴─────────────────────────────────────────────────┘
```

## Deployment to Vercel

1. Push the repository to GitHub.

2. In the [Vercel dashboard](https://vercel.com), import the repository.

3. Configure the project:
   - **Framework Preset**: Other
   - **Root Directory**: `backend`
   - **Build Command**: (leave empty or `echo "No build step"`)
   - **Output Directory**: `.`

4. Set all environment variables in the Vercel project settings.

5. Deploy. Vercel will create serverless functions from `api/index.js`.

## Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start dev server with nodemon |
| `bun run start` | Start production server |
| `bun run db:setup` | Create database tables |
| `bun run build` | No-op (Vercel handles build) |
