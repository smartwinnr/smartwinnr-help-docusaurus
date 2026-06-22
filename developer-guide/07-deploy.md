# 07. Deploy

**Version:** 1.0 | **Last Updated:** June 2026

**Audience:** Engineers shipping a change to production.

---

## Table of contents

1. [Production topology](#production-topology)
2. [Two deploy paths](#two-deploy-paths)
3. [Pre-deploy checklist](#pre-deploy-checklist)
4. [Path A — engineer-driven Git push](#path-a--engineer-driven-git-push)
5. [Path B — wizard auto-deploy](#path-b--wizard-auto-deploy)
6. [Post-deploy validation](#post-deploy-validation)
7. [Rollback](#rollback)
8. [Adding an environment variable in production](#adding-an-environment-variable-in-production)
9. [SSH into a running container](#ssh-into-a-running-container)
10. [Deep references](#deep-references)

---

## Production topology

Production runs on **Railway**, in one project named `smartwinnr_help`,
with two services + a few cron jobs:

| Service | Image | Role |
|---|---|---|
| `docusaurus` | `Dockerfile.docusaurus` (Node 22 + built site + `server.js`) | The unified entry. Serves the built docs AND every `/api/*` route on the Railway-assigned port. |
| `chroma` | Railway's official ChromaDB template | Vector DB. Reached over Railway's private network (`chroma.railway.internal:8000`). |
| `digest-editor-gap`, `digest-ops-snapshot`, `digest-module-overview` | `curlimages/curl` | Cron services. Each is a one-line POST to `/api/admin/digests/send?type=…`, weekly at 09:00 UTC Monday. |

Service IDs and full env-var reference: see
[../RAILWAY_DEPLOYMENT.md](../RAILWAY_DEPLOYMENT.md) and
[../RAILWAY_ENVIRONMENT_VARIABLES.md](../RAILWAY_ENVIRONMENT_VARIABLES.md).

> **Note.** Legacy docs may refer to a third service called
> `chatbot-api`. That was collapsed into `docusaurus`. There is no
> separate chatbot service in production.

---

## Two deploy paths

The same git branch can be deployed two ways. Both end at the same
Railway service redeploying from the same Dockerfile build.

```
Path A — engineer-driven:
  Author writes code   → git push <branch>   → CI runs lint:docs + build
                       → merge to main       → Railway redeploys

Path B — wizard auto-deploy:
  Author uses /admin/authoring/   → wizard "Publish" button
                                  → server.js calls GitHub Git Data API
                                  → push to GIT_PUBLISH_BRANCH (typically main)
                                  → Railway watches the branch
                                  → debounce + min-interval applied
                                  → Railway redeploys
```

Path A is for **code changes** (any change outside `docs/`). Path B is
for **content changes** authored via the wizard. Don't use Path B for
code changes — it bypasses the CI checks.

---

## Pre-deploy checklist

Before pushing or publishing, run locally:

```bash
npm run lint:docs:fix                 # auto-fix lint
npm run typecheck                     # tsc --noEmit
npm run build                         # validates privileges + gates, then builds
```

If your change includes:

- **A new privilege key** → add it to `data/known-privileges.json` AND
  the main SmartWinnr app's organizations model. Re-run
  `npm run validate:privileges`.
- **A new role** → add to `src/access-policy.ts` AND `shared/access-policy.cjs`.
- **A new env var that prod needs** → see
  [§ Adding an env var in production](#adding-an-environment-variable-in-production)
  *before* you deploy. A missing env var that the code requires will
  crash the boot.
- **A schema change to a SQLite DB** → confirm the `CREATE TABLE IF NOT
  EXISTS` / lazy `ALTER TABLE ADD COLUMN` pattern is followed (see
  [05-tasks-backend.md](./05-tasks-backend.md#when-to-add-a-new-table-to-an-existing-db)).
- **A new docs section that needs immediate Wynnie support** → plan to
  run `npm run index-internal` after deploy.

---

## Path A — engineer-driven Git push

### Steps

```bash
# 1. Make sure you're on the right branch.
git checkout main && git pull
git checkout -b feature/your-change

# 2. Make changes. Test locally in Mode A or B.

# 3. Run validation.
npm run lint:docs:fix
npm run typecheck
npm run build

# 4. Commit + push.
git add <files>
git commit -m "feat(area): short summary"
git push -u origin feature/your-change

# 5. Open PR. Wait for CI. Merge to main.
```

Railway watches `main` and redeploys automatically once the merge lands.

### Watch the deploy

```bash
railway logs --service docusaurus -f
```

A successful deploy ends with:

```
[server] listening on PORT 8080
🔐 doc-gates.json loaded: 247 prefix gates, 902 article gates
[server] ready
```

If you see `🔓 doc-gates.json absent`, the build didn't emit the gate
table — investigate the build log.

---

## Path B — wizard auto-deploy

For content changes by authors using `/admin/authoring/`. Engineers
rarely trigger this directly.

### Prerequisites (one-time setup)

These env vars must be set on the `docusaurus` Railway service:

```
AUTHORING_GIT_PUSH=true
GIT_PUSH_TOKEN=<fine-grained GitHub PAT, Contents R/W on this repo only>
GITHUB_REPO=smartwinnr/smartwinnr-help-docusaurus
GIT_PUBLISH_BRANCH=main
```

The PAT must be fine-grained, scoped to this single repo, with
`Contents: Read and write` permission only.

### How the publish flow works

```
Editor clicks Publish
   ↓
server.js writes the .md file to docs/<path>
   ↓
GitHub Git Data API: get blob SHA, create tree, create commit, update ref
   ↓
Commit lands on GIT_PUBLISH_BRANCH
   ↓
Railway detects the push and redeploys
```

### Rate limits

- **Per-publish debounce.** `AUTHORING_DEPLOY_DEBOUNCE_MS` (default 30
  min). After the first publish, a 30-min window collects further
  publishes into the same deploy. Last-write-wins for a given article.
- **Min interval between deploys.** `AUTHORING_DEPLOY_MIN_INTERVAL_MS`
  (default 60 min). Railway is rate-limited; we honor that explicitly.

Tune both with env vars on `docusaurus`. Tighter for rapid content
iteration, looser to save on build minutes.

### Watching a wizard deploy

```
GET /api/admin/authoring/deploy/state
```

returns the current queue state. The wizard UI polls this and shows a
banner: "Your article will deploy in N minutes."

---

## Post-deploy validation

After every deploy:

```bash
# 1. Health check (public, no auth).
curl https://docusaurus-production.up.railway.app/api/health
# Expect: {"status":"healthy",...}

# 2. Sign in and load a page.
# Open /auth/login in a browser, request a magic link, sign in.

# 3. Try the chatbot on a question you know the answer for.
# Confirm citations link to the right articles.

# 4. If your change touched gating, try a wrong-role URL.
# curl --cookie "swhelp_session=…" https://prod/admin-only-path/
# Expect: 403.
```

If your deploy added or changed docs, the Wynnie corpus is stale until
you re-index. Either:

- Wait for the next scheduled re-index (none today — see "Caveats"
  below), or
- Run it manually:

  ```bash
  railway run --service docusaurus npm run index-internal
  ```

> **Caveat — no auto-reindex.** Railway doesn't automatically run the
> indexer post-deploy. New articles ship invisibly to Wynnie until
> someone re-indexes. There's a known gap to fix; for now,
> re-index manually after any docs change.

### Visual regression checks

For a UI change (theme, sidebar, ChatBot, admin pages), spot-check:

- Sidebar collapse + expand on `/modules/quiz/`.
- ChatBot opens + accepts a message + renders citations.
- Mobile menu opens (test in DevTools mobile view).
- `/admin/analytics/chat` and `/admin/analytics/feedback` render without
  errors.
- The customer landing page (`/`) renders persona doors + module strip.

---

## Rollback

### If the bad change is on `main`:

```bash
git checkout main
git revert <bad-commit-sha>
git push
```

Railway redeploys the revert automatically.

For Path B (wizard) deploys, the same rule applies — they ended up as
real commits on `main`.

### If `main` is broken at the build step:

Railway's auto-redeploy will fail. You have two options:

1. **Roll back via Railway dashboard.** Each service has a Deployments
   tab; click "Redeploy" on a previous green deploy. This is the
   fastest path.
2. **Force-push a fix** (only with leadership sign-off, since it rewrites
   history). Generally avoid.

### If the DB schema change is the problem:

SQLite migrations are forward-additive (lazy `ALTER TABLE ADD COLUMN`).
Reverting code that wrote new columns is safe — the columns persist but
the old code just doesn't write/read them. **Don't** drop the columns
manually; if you do and then re-deploy the new code, the lazy `ADD
COLUMN` re-runs and re-creates them, but any old rows have NULL.

### If ChromaDB is the problem:

The vector DB is a derived index. The worst-case recovery is:

```bash
FORCE_FULL_REINDEX=true npm run index-internal
```

This takes ~10-15 minutes and costs ~$0.50 in embedding API calls. The
content in `docs/` is the source of truth, so a full re-embed is
always safe.

---

## Adding an environment variable in production

Steps in order, before the deploy that needs the var:

```bash
# 1. Set the var on the docusaurus service.
railway variables --service docusaurus --set "MY_VAR=secret-value"

# 2. Verify.
railway variables --service docusaurus | grep MY_VAR

# 3. Now deploy the code that reads it (Path A or merge to main).
```

> **Trap.** If you deploy code that requires the var before the var is
> set, the boot crashes. Always set the var first, then deploy.

For shared secrets (e.g. `CRON_SECRET` used by both `docusaurus` and the
cron services), set it on **every service** that needs it. Railway
does not propagate vars across services automatically.

---

## SSH into a running container

```bash
railway ssh --service docusaurus
```

Inside the container:

```bash
ls /app/data                           # the persistent volume
sqlite3 /app/data/chat-logs.db         # inspect the chat-log DB
cat /app/build/doc-gates.json | jq     # confirm the URL guard table
ps aux | grep node                     # confirm server.js is running
```

The project ID, environment ID, and service IDs for the full `railway ssh
--project=…` syntax are in [../RAILWAY_SSH_ACCESS.md](../RAILWAY_SSH_ACCESS.md).

### Common in-container tasks

```bash
# Force a re-index.
npm run index-internal

# Force a full re-embed (rare).
FORCE_FULL_REINDEX=true npm run index-internal

# Check the chat-log circuit breaker state.
sqlite3 /app/data/chat-logs.db "SELECT count(*) FROM exchanges WHERE created_at > datetime('now','-1 hour');"

# Tail server.js logs (more recent than railway logs):
tail -f /proc/$(pgrep -f server.js)/fd/1
```

---

## Deep references

For details this guide doesn't repeat:

- **Full Railway setup, env-var matrix, and ChromaDB template setup:**
  [../RAILWAY_DEPLOYMENT.md](../RAILWAY_DEPLOYMENT.md).
- **Every env var per service, with troubleshooting:**
  [../RAILWAY_ENVIRONMENT_VARIABLES.md](../RAILWAY_ENVIRONMENT_VARIABLES.md).
- **`railway ssh` with project + environment + service IDs:**
  [../RAILWAY_SSH_ACCESS.md](../RAILWAY_SSH_ACCESS.md).
- **The build → URL-guard pipeline:**
  [03-architecture.md](./03-architecture.md#url-guard).

---

Next: [08-debugging.md](./08-debugging.md) →
