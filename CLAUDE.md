# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Repositories

This project spans **three separate repos**, each on GitLab (`gitlab.ceng.metu.edu.tr/group08/runalyst`):

| Repo | Branch | Purpose |
|------|--------|---------|
| `runalyst` (this repo) | `app_final_ver_copy` | Expo React Native frontend |
| `runalyst-backend-run` | `backend` | FastAPI backend (auth, runs, analysis, chat) — deployed on Render |
| `runalyst-backend-ev` | `backend` | GPU worker service (polls SQS, runs CV pipeline, posts results back) |

The frontend communicates only with the Render backend. The GPU worker is a separate long-running process on an SSH GPU server.

---

## Frontend (this repo)

### Dev server

```bash
npm install
npx expo start                  # local network (LAN)
npx expo start --tunnel         # cross-network via ngrok (use for iPhone with Expo Go)
```

Metro runs on port 8082 (mapped from 8081 in docker-compose). Press `r` in terminal to force reload, `s` to switch between Expo Go / dev client mode.

### Lint & test

```bash
npm run lint
npm test                        # jest-expo, matches **/__tests__/**/*.test.[jt]s?(x)
```

### EAS builds

```bash
eas build --platform android --profile preview   # internal APK
eas build --platform ios --profile simulator      # iOS simulator build
```

Google Sign-In does **not** work in Expo Go — requires a dev/preview build.

### Key files

- **`utils/endpoints.ts`** — single source of truth for all API calls. Uses `requestAuth()` (adds Bearer token, handles 401 → token refresh automatically). Cache layer wraps most GET calls with L1 (in-memory) + L2 (AsyncStorage) via `utils/cache.ts`.
- **`utils/cache.ts`** — two-level cache. Call `cacheInvalidate(key)` after mutations, `cacheClear()` on logout.
- **`app/(tabs)/`** — bottom-tab screens: `index.tsx` (home/dashboard), `account.tsx`, `chat.tsx`, `history.tsx`.
- **`app/run/[id].tsx`** — run detail + analysis results screen.
- **`components/atomic/`** — primitive UI (Button, Typography, Layout, Feedback, Inputs).
- **`components/composite/`** — feature-level components (Analysis, Auth, Home, Chat, Upload, etc.).
- **`constants/design.ts`** — shared spacing/color tokens.

### Auth flow

`expo-secure-store` holds `access_token` and `refresh_token`. On 401, `requestAuth()` calls `/auth/refresh` once (deduped with a shared promise) and retries. On refresh failure, tokens are cleared and the user must sign in again.

Google OAuth uses `expo-auth-session`. Apple Sign-In uses `expo-apple-authentication` (iOS only). After OAuth, the backend returns its own JWT pair (not the provider token).

### Video upload flow

1. `generateUploadUrl()` → `POST /runs/upload-url` → backend calls Supabase to create a signed upload URL.
2. `binaryUpload(fileUri, uploadUrl, contentType)` → `FileSystem.uploadAsync` (PUT, binary) directly to Supabase Storage bucket `user_videos_test`.
3. `createRunRecord(path, title)` → `POST /runs/create-record` → backend saves DB record and pushes to SQS.

### Environment variables (`.env`)

```
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID
EXPO_PUBLIC_AUTH_REDIRECT_URI
```

---

## Backend (`runalyst-backend-run`)

FastAPI app under `backend/`. Deployed on Render. API docs at `/documentation`.

### Running locally

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

`requirements.txt` must be **UTF-8 encoded** — pip silently fails on UTF-16.

### Tests

```bash
cd backend
pytest                          # all tests
pytest tests/test_runs.py       # single file
```

Tests use SQLite in-memory via `StaticPool`. JSONB columns are not tested (SQLite incompatibility).

### Architecture

```
app/
  api/endpoints/     # thin route handlers (auth, users, profiles, runs, analysis, chat)
  services/          # business logic (auth, run, analysis, chat, queue, email)
  crud/              # SQLAlchemy DB operations
  models/            # ORM models (all imported in models/__init__.py — required for mapper)
  schemas/           # Pydantic in/out models
  core/              # config, security, OAuth clients, AWS/Supabase clients
  deps/              # FastAPI dependencies (get_db, get_current_user_id, verify_gpu_api_key)
```

Route prefixes: `/auth`, `/users`, `/profiles`, `/runs`, `/analysis`, `/chat`.

### Auth details

- JWTs signed with `JWT_SECRET`, 15-minute access tokens, 30-day refresh tokens stored in `refresh_tokens` table.
- GPU worker authenticates via `X-GPU-API-Key` header checked against `settings.GPU_API_KEY`.

### Required Render environment variables

```
DATABASE_URL
JWT_SECRET
SQS_QUEUE_URL
AWS_REGION
GPU_API_KEY          # must match the GPU worker's .env
GEMINI_API_KEY
RESEND_API_KEY       # optional, for email verification
SUPABASE_URL
SUPABASE_KEY
```

`SQS_QUEUE_URL` and `GPU_API_KEY` raise at **import time** if missing — the app will not start.

### Migrations

Alembic migrations are in `backend/migrations/versions/`. All migrations must be **idempotent** (check `information_schema.tables`/`columns` before `CREATE TABLE`/`ADD COLUMN`) because the production DB may already have the table from a previous deploy.

### Analysis pipeline

1. GPU worker downloads video from Supabase, runs CV pipeline, posts JSON to `POST /analysis/save-result` with `X-GPU-API-Key`.
2. Backend saves result in `analysis_results` table (linked to `runs` via `run_id`).
3. Chat (`/chat`) uses Gemini (`gemini-2.5-flash`) with the stored `modules` JSON as context. Session state is in-memory (`session_store`), so it resets on redeploy.

---

## Cross-service contracts

- `RunOut` schema must include `user_id` (used by frontend to filter own runs).
- `AnalysisOut` schema must include `run_id` (used by history page to match scores to runs).
- `AnalysisCreateIn` expects `{ run_id: int, fps: float, modules: dict }` from the GPU worker.
