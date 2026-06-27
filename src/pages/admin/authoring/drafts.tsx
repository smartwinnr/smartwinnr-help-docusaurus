import React, {useEffect, useState, type ReactNode} from 'react';
import Layout from '@theme/Layout';
import BrowserOnly from '@docusaurus/BrowserOnly';
import Link from '@docusaurus/Link';
import {useCurrentUser} from '@site/src/contexts/UserContext';
import {useNotify, type Notify} from '@site/src/components/admin/authoring/Notify';
import styles from './styles.module.css';

/**
 * Authoring queue. Two tabs:
 *
 *   Drafts    - articles with `draft: true`. Edit (wizard), Publish, Delete.
 *   Published - all published articles in a chosen module + sub-folder.
 *               Refine (wizard), Edit raw, Unpublish (re-draft), Delete.
 *
 * Superadmin only. See plan §B.
 *
 * GET    /api/admin/authoring/drafts
 * GET    /api/admin/authoring/articles?module=&subFolder=&filter=published
 * POST   /api/admin/authoring/publish
 * POST   /api/admin/authoring/unpublish
 * DELETE /api/admin/authoring/draft
 * DELETE /api/admin/authoring/article?path=...
 */

type Draft = {
  path: string;
  slug: string;
  title: string;
  lastUpdate: string | null;
};

type Article = Draft & { draft: boolean };

type DeployState = {
  queue: Array<{path: string; slug: string; title: string; action: 'upsert' | 'delete'}>;
  lastDeployTs: number;
  nextAutoDeployAt: number | null;
  canDeployNow: boolean;
  minIntervalMs: number;
  debounceMs: number;
  gitPushEnabled: boolean;
  configOk: boolean;
};

// Modules are fetched from GET /api/admin/authoring/modules on Published-tab
// mount (sourced from data/modules.json). Adding a module via
// /admin/authoring/modules makes it appear here on next render.
type ModuleEntry = {slug: string; label: string};

const SUB_FOLDERS: Array<{value: string; label: string}> = [
  {value: 'for-learners',          label: 'For Learners'},
  {value: 'for-managers',          label: 'For Managers'},
  {value: 'create-and-manage',     label: 'Create & Manage'},
  {value: 'assign-and-schedule',   label: 'Assign & Schedule'},
  {value: 'features',              label: 'Features'},
  {value: 'reports-and-analytics', label: 'Reports & Analytics'},
  {value: 'settings-and-permissions', label: 'Settings & Permissions'},
  {value: 'best-practices',        label: 'Best Practices'},
  {value: 'faqs-and-troubleshooting', label: 'FAQs & Troubleshooting'},
];

function parsePath(p: string): {module: string; subFolder: string; slug: string} | null {
  const m = /^docs\/modules\/([^/]+)\/([^/]+)\/([^/]+)\.(md|mdx)$/.exec(p.replace(/\\/g, '/'));
  return m ? {module: m[1], subFolder: m[2], slug: m[3]} : null;
}

/**
 * Mirror the wizard's STORAGE_KEY constant in `index.tsx`. Update both
 * places together if the key ever changes. Used here to invalidate the
 * wizard's persisted state when the draft it references is deleted /
 * published - otherwise a new Authoring visit would restore a wizard
 * pointing at a now-stale file path.
 */
const WIZARD_STORAGE_KEY = 'sw.authoring.wizard.v1';

function clearWizardStateIfTargets(parsed: {module: string; subFolder: string; slug: string}) {
  if (typeof window === 'undefined') return;
  try {
    const raw = window.localStorage.getItem(WIZARD_STORAGE_KEY);
    if (!raw) return;
    const persisted = JSON.parse(raw);
    const inp = persisted && persisted.inputs;
    if (
      inp
      && inp.module === parsed.module
      && inp.subFolder === parsed.subFolder
      && inp.slug === parsed.slug
    ) {
      window.localStorage.removeItem(WIZARD_STORAGE_KEY);
    }
  } catch { /* swallow */ }
}

/** Unconditional wizard-state clear, fired by the "New article" link so
 *  the wizard always opens fresh. Other entry points (navbar, in-place
 *  refresh) keep the autosave / resume-work behavior. */
function clearWizardState() {
  if (typeof window === 'undefined') return;
  try { window.localStorage.removeItem(WIZARD_STORAGE_KEY); } catch { /* swallow */ }
}

// ─────────────────────────────────────────────────────────────────────────
// Drafts tab
// ─────────────────────────────────────────────────────────────────────────

function DraftsTab({notify}: {notify: Notify}): ReactNode {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [deployState, setDeployState] = useState<DeployState | null>(null);
  const [deploying, setDeploying] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/authoring/drafts', {credentials: 'same-origin'});
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const data = await res.json();
      setDrafts(data.drafts || []);
    } catch (err) {
      notify.error(`Failed to load drafts: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  }

  async function refreshDeployState() {
    try {
      const res = await fetch('/api/admin/authoring/deploy/state', {credentials: 'same-origin'});
      if (!res.ok) return;
      setDeployState(await res.json());
    } catch {/* fail soft */}
  }

  async function deployNow() {
    setDeploying(true);
    try {
      const res = await fetch('/api/admin/authoring/deploy', {
        method: 'POST',
        credentials: 'same-origin',
      });
      const data = await res.json();
      if (!res.ok) {
        notify.error(data.message || data.error || 'Deploy failed');
      } else if (data.mode === 'noop') {
        notify.info('Queue cleared (AUTHORING_GIT_PUSH is off - no commit made).');
        await refresh();
      } else {
        notify.success(`Deployed ${data.committed} article(s) - Railway will redeploy in ~2-5 min.`);
        await refresh();
      }
    } catch (err) {
      notify.error((err as Error).message);
    } finally {
      setDeploying(false);
      await refreshDeployState();
    }
  }

  // Cancel a queued publish straight from the deploy strip. Re-drafts the
  // article and drops it from the queue (via /unpublish), so a pending publish
  // is findable + revertible without hunting for it on the Published tab.
  async function cancelQueued(item: DeployState['queue'][number]) {
    const parsed = parsePath(item.path);
    if (!parsed) { notify.error('This queued item cannot be canceled from here.'); return; }
    const label = item.title || item.slug;
    const ok = await notify.confirm({
      title: `Cancel queued publish?`,
      message: `Removes "${label}" from the deploy queue and re-drafts it (draft: true). It won't ship. You can re-publish it any time from the Drafts tab.`,
      confirmLabel: 'Cancel publish',
      cancelLabel: 'Keep it queued',
      danger: true,
    });
    if (!ok) return;
    setBusy(item.path);
    try {
      const res = await fetch('/api/admin/authoring/unpublish', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        credentials: 'same-origin',
        body: JSON.stringify(parsed),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        notify.error(data.error || 'Cancel failed');
      } else {
        notify.success(data.fileMissing
          ? `Removed "${label}" from the deploy queue (its file was already gone).`
          : `Canceled "${label}". Re-drafted and removed from the deploy queue.`);
        await refresh();
        await refreshDeployState();
      }
    } catch (err) {
      notify.error((err as Error).message);
    } finally {
      setBusy(null);
    }
  }

  useEffect(() => {
    refresh();
    refreshDeployState();
    const id = window.setInterval(refreshDeployState, 30_000);
    return () => window.clearInterval(id);
  }, []);

  async function publishDraft(d: Draft) {
    const parsed = parsePath(d.path);
    if (!parsed) { notify.error('Could not parse path'); return; }
    setBusy(d.path);
    try {
      const res = await fetch('/api/admin/authoring/publish', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        credentials: 'same-origin',
        body: JSON.stringify(parsed),
      });
      const data = await res.json();
      if (!res.ok) {
        const blockers: Array<{label: string; detail?: string}> = (data.audit && data.audit.findings || [])
          .filter((f: {blocking: boolean}) => f.blocking);
        const summary = blockers.map((f) => f.label + (f.detail ? ` (${f.detail})` : '')).join('; ');
        notify.error(`${data.error}${summary ? ' - ' + summary : ''}`);
      } else {
        clearWizardStateIfTargets(parsed);
        notify.success(`Published "${d.title}".`);
        await refresh();
      }
    } finally {
      setBusy(null);
      await refreshDeployState();
    }
  }

  async function remove(d: Draft) {
    const ok = await notify.confirm({
      title: `Delete "${d.title}"?`,
      message: 'This removes the file from docs/. The action cannot be undone.',
      confirmLabel: 'Delete draft',
      cancelLabel: 'Keep it',
      danger: true,
    });
    if (!ok) return;

    const parsed = parsePath(d.path);
    if (!parsed) { notify.error('Could not parse path'); return; }
    setBusy(d.path);
    try {
      const q = new URLSearchParams(parsed).toString();
      const res = await fetch(`/api/admin/authoring/draft?${q}`, {
        method: 'DELETE',
        credentials: 'same-origin',
      });
      if (!res.ok) {
        const data = await res.json();
        notify.error(data.error || 'Delete failed');
      } else {
        clearWizardStateIfTargets(parsed);
        notify.success(`Deleted "${d.title}".`);
        await refresh();
      }
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      {deployState && deployState.queue.length > 0 && (() => {
        const upserts = deployState.queue.filter((q) => q.action !== 'delete').length;
        const deletes = deployState.queue.filter((q) => q.action === 'delete').length;
        const parts: string[] = [];
        if (upserts) parts.push(`${upserts} publish${upserts === 1 ? '' : 'es'}`);
        if (deletes) parts.push(`${deletes} delete${deletes === 1 ? '' : 's'}`);
        return (
        <>
        <div className={styles.deployStrip}>
          <div>
            <strong>{deployState.queue.length}</strong> change(s) queued ({parts.join(', ')}), waiting to deploy.
            {!deployState.canDeployNow && (
              <span className={styles.hint}>
                {' '}Next deploy available in ~{Math.max(1, Math.ceil((deployState.minIntervalMs - (Date.now() - deployState.lastDeployTs)) / 60000))} min.
              </span>
            )}
            {!deployState.configOk && deployState.queue.length > 0 && (
              <span className={styles.warn}>
                {' '}⚠ Deploy is set to no-op (AUTHORING_GIT_PUSH / GIT_PUSH_TOKEN / GITHUB_REPO not all set).
              </span>
            )}
          </div>
          <button
            type="button"
            className={styles.btnPrimary}
            disabled={deploying || !deployState.canDeployNow}
            onClick={deployNow}>
            {deploying ? 'Deploying…' : 'Deploy now'}
          </button>
        </div>
        <ul className={styles.deployQueue}>
          {deployState.queue.map((item) => {
            const isDelete = item.action === 'delete';
            const canCancel = !isDelete && !!parsePath(item.path);
            return (
              <li key={item.path} className={styles.deployQueueItem}>
                <span
                  className={styles.deployBadge}
                  data-action={item.action}>
                  {isDelete ? 'Delete' : 'Publish'}
                </span>
                <span className={styles.deployQueueTitle}>{item.title || item.slug}</span>
                <code className={styles.smallCode}>{item.path}</code>
                <span className={styles.deployQueueSpacer} />
                {canCancel ? (
                  <button
                    type="button"
                    className={styles.btnGhost}
                    disabled={busy === item.path}
                    onClick={() => cancelQueued(item)}
                    title="Re-draft this article and remove it from the deploy queue.">
                    Cancel
                  </button>
                ) : (
                  <span className={styles.hint}>{isDelete ? 'Drops on deploy' : '—'}</span>
                )}
              </li>
            );
          })}
        </ul>
        </>
        );
      })()}

      <div className={styles.tabToolbar}>
        <span className={styles.hint}>
          Articles flagged <code>draft: true</code>. Hidden in production builds.
        </span>
        <button type="button" className={styles.btnGhost} onClick={refresh} disabled={loading}>
          Refresh
        </button>
      </div>

      {loading && <p className={styles.hint}>Loading…</p>}
      {!loading && drafts.length === 0 && (
        <p className={styles.hint}>No drafts. Start one from the <Link to="/admin/authoring" onClick={clearWizardState}>authoring wizard</Link>.</p>
      )}
      {!loading && drafts.length > 0 && (
        <table className={styles.draftTable}>
          <thead>
            <tr>
              <th>Title</th>
              <th>Path</th>
              <th>Last update</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {drafts.map((d) => (
              <tr key={d.path}>
                <td><strong>{d.title}</strong></td>
                <td><code className={styles.smallCode}>{d.path}</code></td>
                <td className={styles.tabular}>{d.lastUpdate ?? '-'}</td>
                <td className={styles.rowActions}>
                  {(() => {
                    const parsed = parsePath(d.path);
                    if (!parsed) return null;
                    const qs = new URLSearchParams(parsed).toString();
                    return (
                      <Link
                        to={`/admin/authoring/?${qs}`}
                        className={styles.btnGhost}>
                        Edit
                      </Link>
                    );
                  })()}
                  <button
                    type="button"
                    className={styles.btnPrimary}
                    disabled={busy === d.path}
                    onClick={() => publishDraft(d)}>
                    Publish
                  </button>
                  <button
                    type="button"
                    className={styles.btnGhost}
                    disabled={busy === d.path}
                    onClick={() => remove(d)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Published tab
// ─────────────────────────────────────────────────────────────────────────

function PublishedTab({notify}: {notify: Notify}): ReactNode {
  const [moduleSlug, setModuleSlug] = useState<string>('');
  const [subFolder, setSubFolder] = useState<string>('');
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [modules, setModules] = useState<ModuleEntry[]>([]);
  const [modulesLoading, setModulesLoading] = useState<boolean>(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/authoring/modules', {credentials: 'same-origin'});
        if (!res.ok) { setModulesLoading(false); return; }
        const data = await res.json();
        setModules((data.modules || []).slice().sort((a: ModuleEntry, b: ModuleEntry) => a.label.localeCompare(b.label)));
      } catch {/* fail soft */}
      finally { setModulesLoading(false); }
    })();
  }, []);

  async function refresh() {
    if (!moduleSlug || !subFolder) { setArticles([]); return; }
    setLoading(true);
    try {
      const qs = new URLSearchParams({module: moduleSlug, subFolder, filter: 'published'});
      const res = await fetch(`/api/admin/authoring/articles?${qs}`, {credentials: 'same-origin'});
      const data = await res.json();
      if (!res.ok) { notify.error(data.error || `${res.status} ${res.statusText}`); return; }
      setArticles(data.articles || []);
    } catch (err) {
      notify.error(`Failed to load articles: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [moduleSlug, subFolder]);

  async function remove(a: Article) {
    const ok = await notify.confirm({
      title: `Delete "${a.title}"?`,
      message: `This removes a PUBLISHED article from docs/. The change ships on the next deploy. The action cannot be undone.`,
      confirmLabel: 'Delete article',
      cancelLabel: 'Keep it',
      danger: true,
    });
    if (!ok) return;
    setBusy(a.path);
    try {
      const qs = new URLSearchParams({path: a.path}).toString();
      const res = await fetch(`/api/admin/authoring/article?${qs}`, {
        method: 'DELETE',
        credentials: 'same-origin',
      });
      if (!res.ok) {
        const data = await res.json();
        notify.error(data.error || 'Delete failed');
      } else {
        const data = await res.json().catch(() => ({}));
        const imgNote = data.imagesRemoved > 0
          ? ` Also removed ${data.imagesRemoved} associated image${data.imagesRemoved === 1 ? '' : 's'}.`
          : '';
        if (data.queuedForDeploy) {
          notify.success(`Deleted "${a.title}".${imgNote} Queued for deploy - production drops it on the next deploy.`);
        } else {
          notify.success(`Deleted "${a.title}".${imgNote}`);
        }
        await refresh();
      }
    } finally {
      setBusy(null);
    }
  }

  // Reverse a publish: re-draft the article (draft:true). The server cancels a
  // still-queued publish outright, or queues the re-draft if it's already live
  // (production hides draft:true on the next deploy). Moves the row to the
  // Drafts tab, so we just refresh the published list afterward.
  async function unpublish(a: Article) {
    const parsed = parsePath(a.path);
    if (!parsed) { notify.error('Could not parse path'); return; }
    const ok = await notify.confirm({
      title: `Unpublish "${a.title}"?`,
      message: `This re-drafts the article (sets draft: true). If the publish hasn't deployed yet, it's canceled and nothing ships. If it's already live, production hides it on the next deploy. You can re-publish it any time from the Drafts tab.`,
      confirmLabel: 'Unpublish',
      cancelLabel: 'Keep published',
      danger: true,
    });
    if (!ok) return;
    setBusy(a.path);
    try {
      const res = await fetch('/api/admin/authoring/unpublish', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        credentials: 'same-origin',
        body: JSON.stringify(parsed),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        notify.error(data.error || 'Unpublish failed');
      } else if (data.canceledPendingPublish) {
        notify.success(`Unpublished "${a.title}". Pending publish canceled - nothing will deploy.`);
        await refresh();
      } else {
        notify.success(`Unpublished "${a.title}". Queued for deploy - production hides it on the next deploy.`);
        await refresh();
      }
    } catch (err) {
      notify.error((err as Error).message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      <div className={styles.tabToolbar}>
        <div className={styles.selectorRow}>
          <label className={styles.inlineLabel}>
            Module
            <select
              value={moduleSlug}
              disabled={modulesLoading}
              onChange={(e) => setModuleSlug(e.target.value)}>
              <option value="">{modulesLoading ? 'Loading…' : '- pick a module -'}</option>
              {modules.map((m) => <option key={m.slug} value={m.slug}>{m.label}</option>)}
            </select>
          </label>
          <label className={styles.inlineLabel}>
            Sub-folder
            <select value={subFolder} onChange={(e) => setSubFolder(e.target.value)}>
              <option value="">- pick a sub-folder -</option>
              {SUB_FOLDERS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </label>
        </div>
        <button
          type="button"
          className={styles.btnGhost}
          onClick={refresh}
          disabled={loading || !moduleSlug || !subFolder}>
          Refresh
        </button>
      </div>

      {(!moduleSlug || !subFolder) && (
        <p className={styles.hint}>Pick a module and sub-folder to list published articles.</p>
      )}
      {moduleSlug && subFolder && loading && <p className={styles.hint}>Loading…</p>}
      {moduleSlug && subFolder && !loading && articles.length === 0 && (
        <p className={styles.hint}>No published articles in this folder.</p>
      )}
      {!loading && articles.length > 0 && (
        <table className={styles.draftTable}>
          <thead>
            <tr>
              <th>Title</th>
              <th>Path</th>
              <th>Last update</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {articles.map((a) => (
              <tr key={a.path}>
                <td><strong>{a.title}</strong></td>
                <td><code className={styles.smallCode}>{a.path}</code></td>
                <td className={styles.tabular}>{a.lastUpdate ?? '-'}</td>
                <td className={styles.rowActions}>
                  {(() => {
                    const parsed = parsePath(a.path);
                    if (!parsed) return null;
                    const qs = new URLSearchParams(parsed).toString();
                    return (
                      <Link
                        to={`/admin/authoring/?${qs}`}
                        className={styles.btnGhost}
                        title="Open in the wizard for an LLM-driven refine. Saving will re-draft the article; the live deployed copy stays in place until you Publish again.">
                        Refine
                      </Link>
                    );
                  })()}
                  <Link
                    to={`/admin/authoring/edit?${new URLSearchParams({path: a.path}).toString()}`}
                    className={styles.btnGhost}>
                    Edit raw
                  </Link>
                  <button
                    type="button"
                    className={styles.btnGhost}
                    disabled={busy === a.path}
                    onClick={() => unpublish(a)}
                    title="Re-draft this article (draft: true). Cancels a pending publish, or hides it from production on the next deploy.">
                    Unpublish
                  </button>
                  <button
                    type="button"
                    className={styles.btnGhost}
                    disabled={busy === a.path}
                    onClick={() => remove(a)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Page shell
// ─────────────────────────────────────────────────────────────────────────

function QueuePage(): ReactNode {
  const user = useCurrentUser();
  const notify = useNotify();
  const [tab, setTab] = useState<'drafts' | 'published'>('drafts');

  if (!(user.roles || []).includes('superadmin')) {
    return (
      <div className={styles.wrap}>
        <h1>Authoring queue</h1>
        <p>You don't have access to this page.</p>
        <p><Link to="/">← Back to the homepage</Link></p>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <div>
          <h1>Authoring queue</h1>
          <p className={styles.subhead}>
            Manage drafts and edit published articles.{' '}
            <Link to="/admin/authoring" onClick={clearWizardState}>New article →</Link>{' · '}
            <Link to="/admin/authoring/modules">Manage modules →</Link>
          </p>
        </div>
      </header>

      <div className={styles.tabBar} role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'drafts'}
          className={tab === 'drafts' ? styles.tabActive : styles.tabInactive}
          onClick={() => setTab('drafts')}>
          Drafts
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'published'}
          className={tab === 'published' ? styles.tabActive : styles.tabInactive}
          onClick={() => setTab('published')}>
          Published
        </button>
      </div>

      {tab === 'drafts' ? <DraftsTab notify={notify} /> : <PublishedTab notify={notify} />}

      {notify.host}
    </div>
  );
}

export default function DraftsPage(): ReactNode {
  return (
    <Layout title="Authoring queue - Admin" description="Drafts and published articles.">
      <BrowserOnly fallback={<div className={styles.wrap}><p>Loading…</p></div>}>
        {() => <QueuePage />}
      </BrowserOnly>
    </Layout>
  );
}
