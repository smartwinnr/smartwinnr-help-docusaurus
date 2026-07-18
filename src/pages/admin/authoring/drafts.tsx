import React, {useEffect, useState, type ReactNode} from 'react';
import Layout from '@theme/Layout';
import BrowserOnly from '@docusaurus/BrowserOnly';
import Link from '@docusaurus/Link';
import {useCurrentUser} from '@site/src/contexts/UserContext';
import {useNotify, type Notify} from '@site/src/components/admin/authoring/Notify';
import PersistenceStatus from '@site/src/components/admin/authoring/PersistenceStatus';
import {parsePath, SUB_FOLDERS, WIZARD_STORAGE_KEY} from '@site/src/lib/authoring';
import styles from './styles.module.css';

/**
 * Authoring queue. Two tabs:
 *
 *   Drafts    - articles with `draft: true`. Edit (unified editor), Publish, Delete.
 *   Published - all published articles in a chosen module + sub-folder.
 *               Edit (unified editor), Unpublish (re-draft), Delete.
 *
 * The unified editor (/admin/authoring/edit?path=) does AI refine + raw text +
 * image upload + metadata in one screen; the wizard (/admin/authoring) is now
 * only for creating NEW articles.
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
  lastValidationError?: {ts: number; errors: Array<{check: string; message: string}>} | null;
  journal?: {
    enabled: boolean;
    branch: string;
    lastCommitTs: number;
    lastCommitSha: string | null;
    pendingCount: number;
    lastError: {ts: number; message: string} | null;
    bootRestored: number;
    conflicts: string[];
  } | null;
};

// Modules are fetched from GET /api/admin/authoring/modules on Published-tab
// mount (sourced from data/modules.json). Adding a module via
// /admin/authoring/modules makes it appear here on next render.
type ModuleEntry = {slug: string; label: string};


/**
 * Shared with the wizard via src/lib/authoring.ts (a hardcoded copy here
 * once drifted a version behind, silently disabling these clears). Used to
 * invalidate the wizard's persisted state when the draft it references is
 * deleted / published - otherwise a new Authoring visit would restore a
 * wizard pointing at a now-stale file path.
 */

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
        notify.info("Queue cleared - this server isn't connected to the live site (test mode).");
        await refresh();
      } else {
        notify.success(`Publishing ${data.committed} update(s) now. The site rebuilds for a few minutes - readers see the changes when it finishes.`);
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
      message: `Takes "${label}" out of the next site update and turns it back into a draft. Nothing changes for readers. You can publish it again any time.`,
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
          ? `Removed "${label}" from the update queue.`
          : `"${label}" is a draft again - it won't go live.`);
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
        notify.success(`Published "${d.title}" - it goes live with the next site update (see the banner above).`);
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
      message: `Deletes the draft "${d.title}". Readers never saw it. An admin can recover it from the trash for up to 30 days.`,
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
        notify.success(`Deleted "${d.title}". (Recoverable by an admin for 30 days.)`);
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
            <strong>{deployState.queue.length}</strong> update{deployState.queue.length === 1 ? '' : 's'} ready to go live ({parts.join(', ')}).
            {deployState.canDeployNow ? (
              <span className={styles.hint}>
                {' '}They publish together automatically ~30 min after your last change, or press Deploy now.
              </span>
            ) : (
              <span className={styles.hint}>
                {' '}They publish together automatically; Deploy now unlocks in ~{Math.max(1, Math.ceil((deployState.minIntervalMs - (Date.now() - deployState.lastDeployTs)) / 60000))} min.
              </span>
            )}
            {!deployState.configOk && deployState.queue.length > 0 && (
              <span
                className={styles.warn}
                title="AUTHORING_GIT_PUSH / GIT_PUSH_TOKEN / GITHUB_REPO are not all set on this server.">
                {' '}⚠ Publishing to the live site isn't set up on this server - tell an admin.
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
                    title="Take this article out of the next site update and turn it back into a draft.">
                    Cancel
                  </button>
                ) : (
                  <span className={styles.hint}>{isDelete ? 'Removed on next update' : '—'}</span>
                )}
              </li>
            );
          })}
        </ul>
        </>
        );
      })()}

      {deployState?.lastValidationError && (
        <div className={styles.warn} role="alert">
          <strong>⚠ The last update was blocked</strong> - it would have broken the live site:
          <ul>
            {deployState.lastValidationError.errors.slice(0, 5).map((e, i) => (
              <li key={i}>{e.message}</li>
            ))}
            {deployState.lastValidationError.errors.length > 5 && (
              <li>…and {deployState.lastValidationError.errors.length - 5} more</li>
            )}
          </ul>
          Fix the issue(s), then press Deploy now again. Nothing was published, and nothing was lost.
        </div>
      )}

      {deployState?.journal?.enabled && deployState.journal.lastError && (
        <div className={styles.warn} role="alert">
          <strong>⚠ Backup is failing</strong> — recent changes exist on this server only and
          could be lost if it restarts. Tell an admin now: {deployState.journal.lastError.message}
        </div>
      )}

      {deployState?.journal?.conflicts && deployState.journal.conflicts.length > 0 && (
        <div className={styles.warn} role="alert">
          <strong>⚠ Heads up</strong> — these articles were changed in two places at once.
          The version saved through this tool was kept; review them:
          <ul>
            {deployState.journal.conflicts.slice(0, 5).map((p) => (<li key={p}><code>{p}</code></li>))}
            {deployState.journal.conflicts.length > 5 && (
              <li>…and {deployState.journal.conflicts.length - 5} more</li>
            )}
          </ul>
        </div>
      )}

      <div className={styles.tabToolbar}>
        <span className={styles.hint}>
          Drafts are only visible here - readers never see them until you publish.
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
                  <Link
                    to={`/admin/authoring/edit?${new URLSearchParams({path: d.path}).toString()}`}
                    className={styles.btnGhost}
                    title="Open the editor: AI refine, hand-edit text, upload images, edit metadata.">
                    Edit
                  </Link>
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
      message: `Removes "${a.title}" from the live help site with the next site update. Its web address will redirect readers to the module page. An admin can recover the content from the trash for up to 30 days.`,
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
          ? ` Its ${data.imagesRemoved} screenshot${data.imagesRemoved === 1 ? '' : 's'} ${data.imagesRemoved === 1 ? 'was' : 'were'} removed too.`
          : '';
        if (data.queuedForDeploy) {
          notify.success(`Deleted "${a.title}".${imgNote} It disappears from the site with the next update.`);
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
      message: `Hides "${a.title}" from readers. If it hasn't gone live yet, it simply won't ship. If it's already live, it disappears with the next site update. You can publish it again any time.`,
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
        notify.success(`"${a.title}" is a draft again - the pending publish was canceled.`);
        await refresh();
      } else {
        notify.success(`"${a.title}" will be hidden from readers on the next site update.`);
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
                  <Link
                    to={`/admin/authoring/edit?${new URLSearchParams({path: a.path}).toString()}`}
                    className={styles.btnGhost}
                    title="Open the editor: AI refine, hand-edit text, upload images, edit metadata. Saved changes go live with the next site update.">
                    Edit
                  </Link>
                  <button
                    type="button"
                    className={styles.btnGhost}
                    disabled={busy === a.path}
                    onClick={() => unpublish(a)}
                    title="Turn this article back into a draft - readers stop seeing it on the next site update.">
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
          <h1>Authoring queue <PersistenceStatus /></h1>
          <p className={styles.subhead}>
            Manage drafts and edit published articles.{' '}
            <Link to="/admin/authoring" onClick={clearWizardState}>New article →</Link>{' · '}
            <Link to="/admin/authoring/modules">Manage modules →</Link>{' · '}
            <Link to="/admin/authoring/guide">Guide →</Link>
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
