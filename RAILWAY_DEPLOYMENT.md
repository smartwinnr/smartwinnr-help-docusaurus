# Railway Deployment Guide

The SmartWinnr Help Center deploys to Railway as **two services + a few cron jobs**:

| Service | Image | Role |
|---|---|---|
| `docusaurus` | `Dockerfile.docusaurus` (Node 22 + built site + `server.js`) | Serves the built Docusaurus site **and** every `/api/*` route on a single port. Hosts auth, Wynnie chat, vector search, the authoring wizard, and the admin analytics dashboards. |
| `chroma` | Railway's official ChromaDB template | Vector database storing the `smartwinnr_docs` collection. Reached over Railway's private network. |
| Digest cron jobs (×3) | `curlimages/curl` | One per digest type (`editor-gap`, `ops-snapshot`, `module-overview`). POST weekly to `/api/admin/digests/send?type=...` with `CRON_SECRET`. |

The previous 3-service split (separate `chatbot-api` + `docusaurus`) has been
**collapsed** into the unified `server.js`. Don't recreate it.

## Prerequisites

- Railway CLI installed and authenticated.
- Railway project with the two services above set up.
- A fine-grained GitHub PAT (only needed if you want the authoring wizard's
  auto-deploy to push commits — see `AUTHORING_GIT_PUSH` in `.env.example`).

## Service URLs (production)

| Service | URL |
|---|---|
| Docusaurus (public) | `https://docusaurus-production.up.railway.app` |
| ChromaDB (public, rarely needed) | `https://chroma-production-ebac.up.railway.app` |
| ChromaDB internal (used by docusaurus) | `http://chroma.railway.internal:8000` |

## 1. ChromaDB service (`chroma`) — manual setup

ChromaDB does not deploy from this repo. Use Railway's official ChromaDB
template:

- **Template:** https://railway.com/deploy/kbvIRV
- **Service name:** `Chroma`
- **No repository connection needed**

### Critical configuration

```bash
CHROMA_HOST_ADDR=::          # IPv6 binding — REQUIRED for Railway internal networking
IS_PERSISTENT=True
PORT=8000
CHROMA_HOST_PORT=8000
CHROMA_WORKERS=1
CHROMA_TIMEOUT_KEEP_ALIVE=30
ANONYMIZED_TELEMETRY=False
```

Without `CHROMA_HOST_ADDR=::` the docusaurus service can't reach `chroma.railway.internal`.

### Persistent volume

The ChromaDB template includes a persistent volume mounted at `/chroma/chroma`.
Don't remove it — that's where your embeddings live.

## 2. Docusaurus + API service (`docusaurus`)

Deploys from this repo using `Dockerfile.docusaurus`.

### Build config (`railway.toml`)

```toml
[build]
builder = "dockerfile"
dockerfilePath = "Dockerfile.docusaurus"

[deploy]
startCommand = "npm run start:railway"     # = `node server.js`
healthcheckTimeout = 300
restartPolicyType = "on_failure"
```

The Dockerfile builds the static site **inside** the image (so the runtime
container is small), then runs `node server.js` which serves both the built
site and every `/api/*` route.

### Environment variables (minimum to run)

```bash
NODE_ENV=production

# OpenAI
OPENAI_API_KEY=sk-...
INTERNAL_API_KEY=...           # guards /api/vector/embed; share with indexer if you run it

# ChromaDB (use the Railway internal hostname)
CHROMA_HOST=chroma.railway.internal
CHROMA_PORT=8000
CHROMA_SSL=false               # internal traffic is plain HTTP
COLLECTION_NAME=smartwinnr_docs
EMBEDDING_MODEL=text-embedding-3-small
CHAT_MODEL=gpt-4o-mini         # or your preferred OpenAI chat model

# Auth (magic-link)
HELP_JWT_SECRET=<32+ random bytes>
HELP_SITE_URL=https://docusaurus-production.up.railway.app
LAMBDA_MAGIC_LINK_URL=https://<your-lambda>.amazonaws.com/auth/issue-magic-link

# Chat logging (SQLite — persisted on a Railway volume)
CHAT_LOGGING_ENABLED=true
CHAT_LOG_DB_PATH=/app/data/chat-logs.db
CHAT_LOG_RETENTION_DAYS=90

# Authoring wizard auto-deploy (optional)
AUTHORING_GIT_PUSH=true
GIT_PUSH_TOKEN=<fine-grained PAT — Contents: R/W on this repo only>
GITHUB_REPO=smartwinnr/smartwinnr-help-docusaurus
GIT_PUBLISH_BRANCH=main

# Digest cron auth (only if running the cron services)
CRON_SECRET=<32+ random bytes>
```

See `RAILWAY_ENVIRONMENT_VARIABLES.md` for the full reference (every env var
and its purpose).

### Persistent volume

`server.js` writes SQLite databases (`chat-logs.db`, `feedback.db`, `digests.db`)
under `/app/data`. Mount a Railway volume at `/app/data` so they survive
deployments. **Without the volume, all chat logs and feedback disappear on
every deploy.**

### Port binding

Railway sets `PORT` automatically. `server.js` reads it. Don't hard-code 3000
in this service's env vars — it'll just be ignored or, worse, override the
Railway-assigned port and break health checks.

## 3. Digest cron jobs (optional but recommended)

The analytics emails (editor-gap, ops-snapshot, module-overview) run as Railway
cron services. Each is a one-line `curl` POST to the main service.

Create one Railway service per cron entry (Dashboard → New Service → Cron Job).

**Required env vars on each cron service:**

```bash
HELP_SITE_URL=https://docusaurus-production.up.railway.app
CRON_SECRET=<same value as on the main service>
```

**Schedule (UTC) — every Monday at 09:00:**

```
editor-gap:
  schedule: 0 9 * * 1
  command:  curl -fsS -X POST -H "x-cron-secret: $CRON_SECRET" "$HELP_SITE_URL/api/admin/digests/send?type=editor-gap"

ops-snapshot:
  schedule: 0 9 * * 1
  command:  curl -fsS -X POST -H "x-cron-secret: $CRON_SECRET" "$HELP_SITE_URL/api/admin/digests/send?type=ops-snapshot"

module-overview:
  schedule: 0 9 * * 1
  command:  curl -fsS -X POST -H "x-cron-secret: $CRON_SECRET" "$HELP_SITE_URL/api/admin/digests/send?type=module-overview"
```

A non-zero curl exit code (any per-region failure → 500 from the server)
marks the cron run as failed in Railway, so partial failures stay visible.

## Indexing docs into ChromaDB

The indexer is **not** run automatically by Railway after a deploy. To
re-embed after publishing new docs:

```bash
# From your local machine (talks to the deployed embed endpoint):
INTERNAL_API_KEY=<key> CHROMA_HOST=chroma.railway.internal \
  npm run index-internal

# Or shell into the docusaurus service:
railway ssh --service docusaurus
node server.js &        # if it isn't already running (it is, in prod)
npm run index-internal  # incremental; SHA-256 hashed
```

Force a full re-embed (rarely needed, costs OpenAI tokens for every chunk):

```bash
FORCE_FULL_REINDEX=true npm run index-internal
```

## Authoring wizard auto-deploy

When `AUTHORING_GIT_PUSH=true`, the wizard's "Publish" button commits the new
or edited article via the GitHub Git Data API to `GIT_PUBLISH_BRANCH`. Railway
watches the branch and redeploys. Debouncing: 30 min default window for
bursts; ≤ 1 deploy / 60 min by default. Tune via `AUTHORING_DEPLOY_DEBOUNCE_MS`
and `AUTHORING_DEPLOY_MIN_INTERVAL_MS`.

The GitHub PAT must be **fine-grained**, scoped to **only this repo**, with:

- Contents: Read and write (required to push commits)
- Metadata: Read-only (auto-required by GitHub)

## Health check

```bash
curl https://<your-docusaurus-domain>/api/health
# → {"status":"healthy","timestamp":"…","service":"docusaurus-integrated-api","version":"1.0.0"}
```

Public — runs before auth middleware. Use this for Railway's deploy health check.

## SSH access

See `RAILWAY_SSH_ACCESS.md` for the project/environment/service IDs and the
exact `railway ssh` commands. Common uses:

- Inspect `chat-logs.db` with `sqlite3` after a chat-logger circuit breaker trip.
- Run a manual `npm run index-internal` after a big docs change.
- Tail logs in real time: `railway logs --service docusaurus`.

## Troubleshooting

**Cannot connect to ChromaDB.** Verify `CHROMA_HOST_ADDR=::` is set on the
ChromaDB service. Without it, the IPv6 binding fails and internal DNS
resolution gets you nothing.

**Health check failing on deploy.** Likely an env-var or build issue, not a
network one. Check `railway logs --service docusaurus` — the failure mode
prints during startup.

**Auth-redirect loop.** Check `HELP_JWT_SECRET` matches what the Mailgun
Lambda is signing with. A mismatch makes every token "invalid" and bounces
users back to `/auth/login`.

**Chat works locally but not in prod.** Almost always missing
`INTERNAL_API_KEY`, `HELP_JWT_SECRET`, or the volume mount at `/app/data` (so
SQLite writes blow up). Logs will show the circuit breaker tripping.

**Digest emails not arriving.** Check `CRON_SECRET` matches between the cron
service and the main service. Tail logs during the scheduled run.

## Security notes

- Never commit `OPENAI_API_KEY`, `INTERNAL_API_KEY`, `HELP_JWT_SECRET`,
  `GIT_PUSH_TOKEN`, or `CRON_SECRET`. Set them via the Railway dashboard or CLI.
- Rotate `HELP_JWT_SECRET` and `GIT_PUSH_TOKEN` periodically.
- The `GIT_PUSH_TOKEN` PAT should be scoped to this repo only — never a
  classic full-access token.
- The dev shortcuts (`/auth/dev-login`, `?as=<role>`) are disabled when
  `NODE_ENV=production`. The Dockerfile sets it AFTER `npm install` so dev
  dependencies are still installed for the build.
