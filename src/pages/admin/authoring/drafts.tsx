import React, {useEffect, useRef, useState, type ReactNode} from 'react';
import Layout from '@theme/Layout';
import BrowserOnly from '@docusaurus/BrowserOnly';
import Link from '@docusaurus/Link';
import {useCurrentUser} from '@site/src/contexts/UserContext';
import {useNotify, type Notify} from '@site/src/components/admin/authoring/Notify';
import PersistenceStatus from '@site/src/components/admin/authoring/PersistenceStatus';
import {parsePath, parseDocPath, WIZARD_STORAGE_KEY} from '@site/src/lib/authoring';
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

type Article = Draft & { draft: boolean; position?: number | null };

/** One pickable location from GET /sections: a docs section or a module,
 *  with its sub-folders. `allowRoot` = the location itself holds articles. */
type SectionEntry = {
  dir: string;
  label: string;
  kind: 'section' | 'module';
  allowRoot: boolean;
  subs: Array<{dir: string; label: string}>;
};

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
  /** Articles the last deploy refused to ship. They stay queued until fixed;
   *  without this the batch looked like a clean success and the article
   *  silently never went live. */
  heldBack?: Array<{path: string; missingImages: string[]; errors: string[]; ts: number}>;
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
        // A partially successful deploy is still a partial FAILURE for the
        // articles it held back - saying "publishing N update(s)" and nothing
        // else is how an article could silently never reach readers.
        const held = data.held?.length ?? 0;
        if (held > 0) {
          notify.error(
            `Publishing ${data.committed} update(s), but ${held} article(s) were held back and did NOT go live - see the list below.`,
          );
        } else {
          notify.success(`Publishing ${data.committed} update(s) now. The site rebuilds for a few minutes - readers see the changes when it finishes.`);
        }
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
    const parsed = parseDocPath(item.path);
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
        body: JSON.stringify({path: item.path}),
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
    if (!parseDocPath(d.path)) { notify.error('This article cannot be published from here.'); return; }
    const wizardKey = parsePath(d.path);
    setBusy(d.path);
    try {
      const res = await fetch('/api/admin/authoring/publish', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        credentials: 'same-origin',
        body: JSON.stringify({path: d.path}),
      });
      const data = await res.json();
      if (!res.ok) {
        const blockers: Array<{label: string; detail?: string}> = (data.audit && data.audit.findings || [])
          .filter((f: {blocking: boolean}) => f.blocking);
        const summary = blockers.map((f) => f.label + (f.detail ? ` (${f.detail})` : '')).join('; ');
        notify.error(`${data.error}${summary ? ' - ' + summary : ''}`);
      } else {
        if (wizardKey) clearWizardStateIfTargets(wizardKey);
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

    if (!parseDocPath(d.path)) { notify.error('This article cannot be deleted from here.'); return; }
    const wizardKey = parsePath(d.path);
    setBusy(d.path);
    try {
      const q = new URLSearchParams({path: d.path}).toString();
      const res = await fetch(`/api/admin/authoring/draft?${q}`, {
        method: 'DELETE',
        credentials: 'same-origin',
      });
      if (!res.ok) {
        const data = await res.json();
        notify.error(data.error || 'Delete failed');
      } else {
        if (wizardKey) clearWizardStateIfTargets(wizardKey);
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
            const canCancel = !isDelete && !!parseDocPath(item.path);
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

      {/*
        Articles the deploy refused to ship. The batch around them may well
        have succeeded, so nothing else on this page says anything is wrong -
        these used to fail silently into a console log on the server.
      */}
      {!!deployState?.heldBack?.length && (
        <div className={styles.warn} role="alert">
          <strong>⚠ {deployState.heldBack.length} article(s) did not go live</strong> - they stay
          queued until the problem is fixed:
          <ul>
            {deployState.heldBack.map((h) => (
              <li key={h.path}>
                <code>{h.path}</code>
                {h.missingImages?.length > 0 && (
                  <> — missing image(s): {h.missingImages.join(', ')}</>
                )}
                {h.errors?.length > 0 && <> — {h.errors.join('; ')}</>}
              </li>
            ))}
          </ul>
          Fix each one (re-upload the screenshot, or open the article and correct the
          flagged issue), then press Deploy now.
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
                <td className={styles.tabular}>{(d.lastUpdate ?? '-').slice(0, 10)}</td>
                <td className={styles.actionsCell}>
                  <div className={styles.rowActions}>
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
                  </div>
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
  const [locations, setLocations] = useState<SectionEntry[]>([]);
  const [locationsLoading, setLocationsLoading] = useState<boolean>(true);
  const [locationDir, setLocationDir] = useState<string>('');
  const [dir, setDir] = useState<string>('');
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [normalizedNote, setNormalizedNote] = useState<boolean>(false);
  const reorderTimer = useRef<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/authoring/sections', {credentials: 'same-origin'});
        if (!res.ok) { setLocationsLoading(false); return; }
        const data = await res.json();
        setLocations(data.sections || []);
      } catch {/* fail soft */}
      finally { setLocationsLoading(false); }
    })();
  }, []);

  const location = locations.find((l) => l.dir === locationDir) || null;

  // Picking a location with no sub-folders (or only root articles) lands
  // straight on the location itself; otherwise the author picks a folder.
  function pickLocation(nextDir: string) {
    setLocationDir(nextDir);
    setNormalizedNote(false);
    const loc = locations.find((l) => l.dir === nextDir);
    if (loc && loc.subs.length === 0 && loc.allowRoot) setDir(loc.dir);
    else setDir('');
  }

  async function refresh() {
    if (!dir) { setArticles([]); return; }
    setLoading(true);
    try {
      const qs = new URLSearchParams({dir, filter: 'published'});
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

  useEffect(() => {
    if (reorderTimer.current) { window.clearTimeout(reorderTimer.current); reorderTimer.current = null; }
    setNormalizedNote(false);
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dir]);
  useEffect(() => () => { if (reorderTimer.current) window.clearTimeout(reorderTimer.current); }, []);

  /** Swap a row with its neighbor, then debounce-save the whole order.
   *  Each click gives instant visual feedback; the save batches. */
  function moveRow(index: number, delta: -1 | 1) {
    const next = articles.slice();
    const j = index + delta;
    if (j < 0 || j >= next.length) return;
    [next[index], next[j]] = [next[j], next[index]];
    setArticles(next);
    if (reorderTimer.current) window.clearTimeout(reorderTimer.current);
    reorderTimer.current = window.setTimeout(async () => {
      reorderTimer.current = null;
      try {
        const res = await fetch('/api/admin/authoring/reorder', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          credentials: 'same-origin',
          body: JSON.stringify({dir, orderedPaths: next.map((a) => a.path)}),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          notify.error(data.error || 'Could not save the new order');
          await refresh();
          return;
        }
        if (data.queuedForDeploy) {
          notify.success('Order saved - it goes live with the next site update.');
        }
        if (data.changed > 2) setNormalizedNote(true);
      } catch (err) {
        notify.error((err as Error).message);
        await refresh();
      }
    }, 1500);
  }

  async function remove(a: Article) {
    const ok = await notify.confirm({
      title: `Delete "${a.title}"?`,
      message: `Removes "${a.title}" from the live help site with the next site update. Its web address will redirect readers to a related page. An admin can recover the content from the trash for up to 30 days.`,
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
    if (!parseDocPath(a.path)) { notify.error('This article cannot be unpublished from here.'); return; }
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
        body: JSON.stringify({path: a.path}),
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
            Section
            <select
              value={locationDir}
              disabled={locationsLoading}
              onChange={(e) => pickLocation(e.target.value)}>
              <option value="">{locationsLoading ? 'Loading…' : '- pick a section -'}</option>
              <optgroup label="Sections">
                {locations.filter((l) => l.kind === 'section').map((l) => (
                  <option key={l.dir} value={l.dir}>{l.label}</option>
                ))}
              </optgroup>
              <optgroup label="Modules">
                {locations.filter((l) => l.kind === 'module').map((l) => (
                  <option key={l.dir} value={l.dir}>{l.label}</option>
                ))}
              </optgroup>
            </select>
          </label>
          <label className={styles.inlineLabel}>
            Folder
            <select
              value={dir}
              disabled={!location || (location.subs.length === 0 && location.allowRoot)}
              onChange={(e) => { setDir(e.target.value); }}>
              <option value="">- pick a folder -</option>
              {location?.allowRoot && (
                <option value={location.dir}>(section root)</option>
              )}
              {location?.subs.map((s) => <option key={s.dir} value={s.dir}>{s.label}</option>)}
            </select>
          </label>
        </div>
        <div className={styles.rowActions}>
          {dir && (
            <Link
              to={`/admin/authoring?${new URLSearchParams({dir}).toString()}`}
              onClick={clearWizardState}
              className={styles.btnPrimary}
              title="Start a new article in this folder - the destination is pre-selected.">
              New article here
            </Link>
          )}
          <button
            type="button"
            className={styles.btnGhost}
            onClick={refresh}
            disabled={loading || !dir}>
            Refresh
          </button>
        </div>
      </div>

      {!dir && (
        <p className={styles.hint}>Pick a section and folder to list published articles.</p>
      )}
      {dir && loading && <p className={styles.hint}>Loading…</p>}
      {dir && !loading && articles.length === 0 && (
        <p className={styles.hint}>No published articles in this folder.</p>
      )}
      {normalizedNote && (
        <p className={styles.hint}>
          This folder's order was normalized - all its articles ship with the next update.
        </p>
      )}
      {!loading && articles.length > 0 && (
        <table className={styles.draftTable}>
          <thead>
            <tr>
              <th>Order</th>
              <th>Title</th>
              <th>Path</th>
              <th>Last update</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {articles.map((a, i) => (
              <tr key={a.path}>
                <td className={styles.tabular}>
                  <span className={styles.orderCell}>
                    {i + 1}
                    <button
                      type="button"
                      className={`${styles.btnGhost} ${styles.orderBtn}`}
                      disabled={i === 0 || !!busy || loading}
                      onClick={() => moveRow(i, -1)}
                      title="Move this article up in the sidebar order.">
                      ▲
                    </button>
                    <button
                      type="button"
                      className={`${styles.btnGhost} ${styles.orderBtn}`}
                      disabled={i === articles.length - 1 || !!busy || loading}
                      onClick={() => moveRow(i, 1)}
                      title="Move this article down in the sidebar order.">
                      ▼
                    </button>
                  </span>
                </td>
                <td><strong>{a.title}</strong></td>
                <td><code className={styles.smallCode}>{a.path}</code></td>
                <td className={styles.tabular}>{(a.lastUpdate ?? '-').slice(0, 10)}</td>
                <td className={styles.actionsCell}>
                  <div className={styles.rowActions}>
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
                  </div>
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
            <Link to="/admin/authoring/stats">Stats →</Link>{' · '}
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
