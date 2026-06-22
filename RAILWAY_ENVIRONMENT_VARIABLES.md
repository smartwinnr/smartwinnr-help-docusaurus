# Railway Environment Variables Reference

All env vars for each Railway service. Pair with `RAILWAY_DEPLOYMENT.md` for
service-setup steps and `.env.example` for local-dev defaults.

## Project info

| | |
|---|---|
| **Project ID** | `c444ae51-eed3-4b16-b14d-7ebf13e3f317` |
| **Project name** | `smartwinnr_help` |
| **Environment** | `production` |
| **Environment ID** | `be1f5b5e-79db-44f4-ac3a-fbc3523d7efa` |

## Services overview

| Service | Service ID | Role |
|---|---|---|
| `Chroma` | `88657d7c-a058-41e5-ba9d-a40d73aeeaec` | Vector DB (manual template) |
| `docusaurus` | `17ed88cc-8660-4c9a-acec-a68a038a1ae7` | Unified docusaurus + API + auth |
| Digest cron (×3) | created per type | Weekly POST to `/api/admin/digests/send` |

> **Legacy note:** there used to be a separate `chatbot-api` service
> (`25d8ac64-8cc5-422e-9c85-f93ffd3fca76`). It's gone. All chat + vector +
> auth + admin routes now live in `docusaurus`.

---

## 1. `Chroma` service

```bash
# Core
IS_PERSISTENT=True
PORT=8000
CHROMA_HOST_PORT=8000
CHROMA_WORKERS=1
CHROMA_TIMEOUT_KEEP_ALIVE=30
ANONYMIZED_TELEMETRY=False

# CRITICAL: IPv6 binding so other services can reach chroma.railway.internal
CHROMA_HOST_ADDR=::

# Optional
CHROMA_AUTH_TOKEN_TRANSPORT_HEADER=Authorization
CHROMA_PRIVATE_URL=http://chroma.railway.internal

# Volume (provided by the template, don't remove)
RAILWAY_VOLUME_MOUNT_PATH=/chroma/chroma
```

| URL | |
|---|---|
| Public | `https://chroma-production-ebac.up.railway.app` |
| Internal | `http://chroma.railway.internal:8000` |

---

## 2. `docusaurus` service (the main one)

This is the unified entry — serves the built site and every `/api/*` route.

### Application + OpenAI

```bash
NODE_ENV=production            # toggles dev-login, ?as= preview, login-page DEV strip
OPENAI_API_KEY=sk-...
CHAT_MODEL=gpt-4o-mini         # or your preferred OpenAI chat model
EMBEDDING_MODEL=text-embedding-3-small
INTERNAL_API_KEY=...           # guards POST /api/vector/embed (indexer-only)
```

### ChromaDB connection (internal Railway DNS)

```bash
CHROMA_HOST=chroma.railway.internal
CHROMA_PORT=8000
CHROMA_SSL=false               # internal traffic is plain HTTP
COLLECTION_NAME=smartwinnr_docs
```

### Auth (magic-link)

```bash
HELP_JWT_SECRET=<32+ random bytes>                            # signs the swhelp_session cookie
HELP_SITE_URL=https://docusaurus-production.up.railway.app    # used by /auth/callback redirect
LAMBDA_MAGIC_LINK_URL=https://<your-lambda>/auth/issue-magic-link
```

### Chat logging + feedback (SQLite, needs a volume)

```bash
CHAT_LOGGING_ENABLED=true
CHAT_LOG_DB_PATH=/app/data/chat-logs.db
CHAT_LOG_RETENTION_DAYS=90
```

Mount a Railway volume at `/app/data`. Without it, every deploy wipes
`chat-logs.db`, `feedback.db`, and `digests.db`.

### Authoring wizard auto-deploy (optional)

```bash
AUTHORING_GIT_PUSH=true                              # master switch
GIT_PUSH_TOKEN=<fine-grained GitHub PAT>             # Contents R/W on this repo only
GITHUB_REPO=smartwinnr/smartwinnr-help-docusaurus
GIT_PUBLISH_BRANCH=main
GITHUB_API=https://api.github.com                    # override only for GHES
AUTHORING_MODEL=gpt-4o                               # wizard generate model
AUTHORING_RATE_LIMIT=10                              # generates / superadmin / 60 min
AUTHORING_DEPLOY_DEBOUNCE_MS=1800000                 # 30 min burst window
AUTHORING_DEPLOY_MIN_INTERVAL_MS=3600000             # min 60 min between deploys
```

### Digest cron auth

```bash
CRON_SECRET=<32+ random bytes>     # must match the cron services
```

### Indexing controls

```bash
FORCE_FULL_REINDEX=false           # set true to nuke + re-embed everything
```

### Port

Railway sets `PORT` automatically. **Do not hard-code 3000 or 3001 here** —
that overrides Railway's assignment and breaks health checks. `server.js`
reads `process.env.PORT`.

| URL | |
|---|---|
| Public | `https://docusaurus-production.up.railway.app` |
| Internal | `http://docusaurus.railway.internal` |

---

## 3. Digest cron services (×3)

One service per digest type. Same shape, different `type=` parameter.

```bash
HELP_SITE_URL=https://docusaurus-production.up.railway.app
CRON_SECRET=<same value as the main service>
```

**Schedule + command** (configured in the Railway dashboard, not via env var):

| Service | Schedule (UTC) | Command |
|---|---|---|
| `digest-editor-gap` | `0 9 * * 1` | `curl -fsS -X POST -H "x-cron-secret: $CRON_SECRET" "$HELP_SITE_URL/api/admin/digests/send?type=editor-gap"` |
| `digest-ops-snapshot` | `0 9 * * 1` | `curl -fsS -X POST -H "x-cron-secret: $CRON_SECRET" "$HELP_SITE_URL/api/admin/digests/send?type=ops-snapshot"` |
| `digest-module-overview` | `0 9 * * 1` | `curl -fsS -X POST -H "x-cron-secret: $CRON_SECRET" "$HELP_SITE_URL/api/admin/digests/send?type=module-overview"` |

A non-zero curl exit code (any per-region failure → 500 from the server)
marks the cron run as failed in Railway, so partial failures stay visible.

---

## Critical configuration callouts

### ChromaDB IPv6 binding

```bash
CHROMA_HOST_ADDR=::
```

Without this on the `Chroma` service, internal DNS to `chroma.railway.internal`
fails silently — the docusaurus service can't connect.

### Internal vs public URLs

- **Service-to-service** uses internal hostnames (`chroma.railway.internal`).
  No SSL — `CHROMA_SSL=false`.
- **External access** uses public URLs.

### Health check

```bash
curl https://docusaurus-production.up.railway.app/api/health
```

Public (runs before auth middleware). Wire this into Railway's health-check
config.

---

## Common operations

```bash
# View variables on a service
railway variables --service docusaurus
railway variables --service 88657d7c-a058-41e5-ba9d-a40d73aeeaec  # Chroma

# Set a variable
railway variables --service docusaurus --set "OPENAI_API_KEY=sk-..."

# Deploy
railway up --service docusaurus

# Tail logs
railway logs --service docusaurus
railway logs --service 88657d7c-a058-41e5-ba9d-a40d73aeeaec

# Run a one-off
railway run --service docusaurus npm run index-internal
```

## Security

- Never commit `OPENAI_API_KEY`, `INTERNAL_API_KEY`, `HELP_JWT_SECRET`,
  `GIT_PUSH_TOKEN`, `CRON_SECRET`, or any other secret. Set via the Railway
  dashboard or CLI.
- Rotate `HELP_JWT_SECRET` and `GIT_PUSH_TOKEN` periodically. After rotation,
  every existing user session is invalidated (good).
- The `GIT_PUSH_TOKEN` must be a **fine-grained** PAT scoped to this repo
  only — never a classic full-access token.

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| ChromaDB unreachable from docusaurus | `CHROMA_HOST_ADDR=::` missing on Chroma |
| Auth-redirect loop | `HELP_JWT_SECRET` mismatch between Lambda and docusaurus |
| Chat returns 500 | Volume not mounted at `/app/data` → SQLite write fails → circuit breaker trips |
| Indexer 401s | `INTERNAL_API_KEY` mismatch between indexer and docusaurus |
| Wizard publish silently no-ops | `AUTHORING_GIT_PUSH` not `true`, or `GIT_PUSH_TOKEN` lacks Contents:write |
| Digest cron prints 401 | `CRON_SECRET` mismatch between cron service and docusaurus |
