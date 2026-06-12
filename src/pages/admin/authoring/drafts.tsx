import React, {useEffect, useState, type ReactNode} from 'react';
import Layout from '@theme/Layout';
import BrowserOnly from '@docusaurus/BrowserOnly';
import Link from '@docusaurus/Link';
import {useCurrentUser} from '@site/src/contexts/UserContext';
import styles from './styles.module.css';

/**
 * Drafts queue - lists every article with `draft: true` in frontmatter,
 * with **Publish** + **Delete** actions. Superadmin only. See plan §19.5.
 *
 * GET    /api/admin/authoring/drafts
 * POST   /api/admin/authoring/publish
 * DELETE /api/admin/authoring/draft
 */

type Draft = {
  path: string;
  slug: string;
  title: string;
  lastUpdate: string | null;
};

type DeployState = {
  queue: Array<{path: string; slug: string; title: string}>;
  lastDeployTs: number;
  nextAutoDeployAt: number | null;
  canDeployNow: boolean;
  minIntervalMs: number;
  debounceMs: number;
  gitPushEnabled: boolean;
  configOk: boolean;
};

function parsePath(p: string): {module: string; subFolder: string; slug: string} | null {
  const m = /^docs\/modules\/([^/]+)\/([^/]+)\/([^/]+)\.(md|mdx)$/.exec(p.replace(/\\/g, '/'));
  return m ? {module: m[1], subFolder: m[2], slug: m[3]} : null;
}

function DraftsList(): ReactNode {
  const user = useCurrentUser();
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deployState, setDeployState] = useState<DeployState | null>(null);
  const [deploying, setDeploying] = useState(false);
  const [deployMessage, setDeployMessage] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/authoring/drafts', {credentials: 'same-origin'});
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const data = await res.json();
      setDrafts(data.drafts || []);
    } catch (err) {
      setError((err as Error).message);
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
    setDeployMessage(null);
    try {
      const res = await fetch('/api/admin/authoring/deploy', {
        method: 'POST',
        credentials: 'same-origin',
      });
      const data = await res.json();
      if (!res.ok) {
        setDeployMessage(`⚠ ${data.message || data.error || 'Deploy failed'}`);
      } else {
        setDeployMessage(
          data.mode === 'noop'
            ? 'Queue cleared (AUTHORING_GIT_PUSH is off — no commit made).'
            : `Deployed ${data.committed} article(s) — Railway will redeploy in ~2-5 min.`,
        );
        await refresh();
      }
    } catch (err) {
      setDeployMessage(`⚠ ${(err as Error).message}`);
    } finally {
      setDeploying(false);
      await refreshDeployState();
    }
  }

  useEffect(() => {
    if (!(user.roles || []).includes('superadmin')) return;
    refresh();
    refreshDeployState();
    // Poll deploy state every 30 s so the "next available in M min" countdown
    // stays current while the page sits open.
    const id = window.setInterval(refreshDeployState, 30_000);
    return () => window.clearInterval(id);
  }, [user]);

  async function publishDraft(d: Draft) {
    await publish(d);
    await refreshDeployState();  // pick up the new queue size
  }

  async function publish(d: Draft) {
    const parsed = parsePath(d.path);
    if (!parsed) { setError('Could not parse path'); return; }
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
        setError(`${data.error}${summary ? ' - ' + summary : ''}`);
      } else {
        await refresh();
      }
    } finally {
      setBusy(null);
    }
  }

  async function remove(d: Draft) {
    if (!confirm(`Delete draft "${d.title}"? This removes the file from docs/.`)) return;
    const parsed = parsePath(d.path);
    if (!parsed) { setError('Could not parse path'); return; }
    setBusy(d.path);
    try {
      const q = new URLSearchParams(parsed).toString();
      const res = await fetch(`/api/admin/authoring/draft?${q}`, {
        method: 'DELETE',
        credentials: 'same-origin',
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Delete failed');
      } else {
        await refresh();
      }
    } finally {
      setBusy(null);
    }
  }

  if (!(user.roles || []).includes('superadmin')) {
    return (
      <div className={styles.wrap}>
        <h1>Drafts</h1>
        <p>This page is restricted to <strong>superadmin</strong>.</p>
        <p><Link to="/">← Back to the homepage</Link></p>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <div>
          <h1>Drafts queue</h1>
          <p className={styles.subhead}>
            Articles flagged <code>draft: true</code>. Hidden in production builds.{' '}
            <Link to="/admin/authoring">New article →</Link>
          </p>
          {deployState && deployState.queue.length > 0 && (
            <div className={styles.deployStrip}>
              <div>
                <strong>{deployState.queue.length}</strong> article(s) published, waiting to deploy.
                {!deployState.canDeployNow && (
                  <span className={styles.hint}>
                    {' '}Next deploy available in ~{Math.max(1, Math.ceil((deployState.minIntervalMs - (Date.now() - deployState.lastDeployTs)) / 60000))} min.
                  </span>
                )}
                {!deployState.configOk && deployState.queue.length > 0 && (
                  <span className={styles.warn}>
                    {' '}⚠ Deploy is set to no-op (AUTHORING_GIT_PUSH / GIT_PUSH_TOKEN / GITLAB_PROJECT_ID not all set).
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
          )}
          {deployMessage && (
            <div className={deployMessage.startsWith('⚠') ? styles.error : styles.savedNote}>
              {deployMessage}
            </div>
          )}
        </div>
        <button type="button" className={styles.btnGhost} onClick={refresh} disabled={loading}>
          Refresh
        </button>
      </header>

      {error && <div className={styles.error}>⚠ {error}</div>}
      {loading && <p className={styles.hint}>Loading…</p>}
      {!loading && drafts.length === 0 && (
        <p className={styles.hint}>No drafts. Start one from the <Link to="/admin/authoring">authoring wizard</Link>.</p>
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
    </div>
  );
}

export default function DraftsPage(): ReactNode {
  return (
    <Layout title="Drafts - Admin" description="Draft articles waiting to be published.">
      <BrowserOnly fallback={<div className={styles.wrap}><p>Loading…</p></div>}>
        {() => <DraftsList />}
      </BrowserOnly>
    </Layout>
  );
}
