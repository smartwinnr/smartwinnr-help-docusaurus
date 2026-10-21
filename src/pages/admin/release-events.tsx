import React, {useEffect, useState, type ReactNode} from 'react';
import Layout from '@theme/Layout';
import BrowserOnly from '@docusaurus/BrowserOnly';
import Link from '@docusaurus/Link';
import {useCurrentUser} from '@site/src/contexts/UserContext';
import styles from '@site/src/pages/admin/authoring/styles.module.css';
import tileStyles from './analytics/analytics.module.css';

/**
 * Release-pipeline observability - /admin/release-events. Superadmin only.
 *
 * Renders the release_events audit trail (db/release-events.js): every
 * POST /api/release-drafts dispatch and every per-change decision - what
 * was created, updated, skipped as not customer-relevant, rate-limited, or
 * errored, with the matcher's and relevance classifier's reasoning. The
 * anomaly banners are the "something drifted" early warning the pipeline
 * otherwise lacks (its deploy-time stdout vanishes with the terminal).
 *
 * GET /api/admin/release-events/summary?days=N
 */

type ReleaseEvent = {
  id: number;
  created_at: string;
  dispatch_id: string;
  kind: 'dispatch' | 'change';
  tag: string | null;
  deployer: string | null;
  issue_id: string | null;
  issue_url: string | null;
  change_type: string | null;
  subject: string | null;
  status: string;
  module: string | null;
  article_path: string | null;
  match_method: string | null;
  relevance_json: string | null;
  duration_ms: number | null;
  error: string | null;
  meta_json: string | null;
};

type Summary = {
  days: number;
  dispatchCount: number;
  changeCounts: Record<string, number>;
  lastDispatch: ReleaseEvent | null;
  errorStreak: number;
  rejectionsByModule: {module: string; n: number}[];
};

const STATUS_FILTERS = ['all', 'created', 'updated', 'skipped-not-relevant', 'rate-limited', 'error'] as const;

function relTime(iso: string | null | undefined): string {
  if (!iso) return '-';
  const ms = Date.now() - new Date(iso).getTime();
  if (!Number.isFinite(ms)) return '-';
  const mins = Math.round(ms / 60000);
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 48) return `${hours} h ago`;
  return `${Math.round(hours / 24)} d ago`;
}

function parseRelevance(json: string | null): {verdict?: string; confidence?: string; reason?: string} | null {
  if (!json) return null;
  try { return JSON.parse(json); } catch { return null; }
}

function ReleaseEventsAdmin(): ReactNode {
  const user = useCurrentUser();
  const [days, setDays] = useState(30);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [events, setEvents] = useState<ReleaseEvent[]>([]);
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_FILTERS)[number]>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!(user.roles || []).includes('superadmin')) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const res = await fetch(`/api/admin/release-events/summary?days=${days}`, {credentials: 'same-origin'});
        if (!res.ok) throw new Error(`${res.status}`);
        const data = await res.json();
        if (cancelled) return;
        setSummary(data.summary || null);
        setEvents(data.recent || []);
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user, days]);

  if (!(user.roles || []).includes('superadmin')) {
    return (
      <div className={styles.wrap}>
        <h1>Release events</h1>
        <p>You don't have access to this page.</p>
        <p><Link to="/home">← Back to the homepage</Link></p>
      </div>
    );
  }

  const counts = summary?.changeCounts || {};
  const totalChanges = Object.values(counts).reduce((a, b) => a + b, 0);
  const skipped = counts['skipped-not-relevant'] || 0;
  const anomalies: string[] = [];
  if (summary) {
    if (summary.errorStreak >= 2) {
      anomalies.push(`The last ${summary.errorStreak} dispatches each carried errors - the pipeline may be broken, not just unlucky.`);
    }
    if (totalChanges >= 5 && (counts.created || 0) > 0 && !(counts.updated || 0)) {
      anomalies.push('Every change in this window created a NEW article and none updated an existing one - the article matcher may be degraded (check its LLM and the module routing).');
    }
    if (totalChanges >= 5 && skipped / totalChanges > 0.3) {
      anomalies.push(`${skipped} of ${totalChanges} changes were rejected as not customer-relevant - either developers are over-tagging Audience: client, or the classifier is too aggressive.`);
    }
    for (const r of summary.rejectionsByModule) {
      if (r.n >= 3) {
        anomalies.push(`"${r.module}" has ${r.n} relevance rejections - consider adding its source directory to no-client-article-modules.js in smartwinnr_9543 so these commits stop dispatching at all.`);
      }
    }
  }

  const visible = events.filter((e) => statusFilter === 'all' || e.status === statusFilter);

  return (
    <div className={styles.wrap}>
      <h1>Release pipeline events</h1>
      <p className={styles.hint}>
        Audit trail of automated article creation from `smartwinnr_9543` deploys. Review the resulting
        drafts in the <Link to="/admin/authoring/drafts">drafts queue</Link>.
      </p>

      <div className={styles.tabToolbar}>
        <div className={styles.filterGroup} role="group" aria-label="Window">
          {[7, 30, 90, 365].map((d) => (
            <button key={d} type="button"
              className={days === d ? styles.btnPrimary : styles.btnGhost}
              onClick={() => setDays(d)}>
              {d} days
            </button>
          ))}
        </div>
      </div>

      {loading && <p className={styles.hint}>Loading…</p>}
      {error && <p role="alert" className={tileStyles.error}>Error: {error}</p>}

      {!loading && summary && (
        <>
          {anomalies.map((a) => (
            <p key={a} role="alert" className={tileStyles.error}>⚠ {a}</p>
          ))}

          <div className={tileStyles.tiles}>
            <div className={tileStyles.tile}>
              <span className={tileStyles.tileLabel}>Dispatches</span>
              <span className={tileStyles.tileValue}>{summary.dispatchCount}</span>
            </div>
            <div className={tileStyles.tile}>
              <span className={tileStyles.tileLabel}>Created</span>
              <span className={tileStyles.tileValue}>{counts.created || 0}</span>
            </div>
            <div className={tileStyles.tile}>
              <span className={tileStyles.tileLabel}>Updated</span>
              <span className={tileStyles.tileValue}>{counts.updated || 0}</span>
            </div>
            <div className={tileStyles.tile}>
              <span className={tileStyles.tileLabel}>Skipped (not relevant)</span>
              <span className={tileStyles.tileValue}>{skipped}</span>
            </div>
            <div className={tileStyles.tile}>
              <span className={tileStyles.tileLabel}>Rate-limited</span>
              <span className={tileStyles.tileValue}>{counts['rate-limited'] || 0}</span>
            </div>
            <div className={tileStyles.tile}>
              <span className={tileStyles.tileLabel}>Errors</span>
              <span className={tileStyles.tileValue}>{counts.error || 0}</span>
            </div>
            <div className={tileStyles.tile}>
              <span className={tileStyles.tileLabel}>Last dispatch</span>
              <span className={tileStyles.tileValue}>{summary.lastDispatch ? relTime(summary.lastDispatch.created_at) : '-'}</span>
              <span className={`${tileStyles.tileLabel} ${tileStyles.tileCaption}`}>
                {summary.lastDispatch ? `${summary.lastDispatch.tag || 'untagged'} · ${summary.lastDispatch.deployer || 'unknown'}` : 'none recorded'}
              </span>
            </div>
          </div>

          <div className={styles.tabToolbar}>
            <div className={styles.filterGroup} role="group" aria-label="Filter by status">
              {STATUS_FILTERS.map((f) => (
                <button key={f} type="button"
                  className={statusFilter === f ? styles.btnPrimary : styles.btnGhost}
                  onClick={() => setStatusFilter(f)}>
                  {f === 'all' ? `All (${events.length})` : `${f} (${events.filter((e) => e.status === f).length})`}
                </button>
              ))}
            </div>
          </div>

          {visible.length === 0 ? (
            <p className={styles.hint}>No events match this filter in the window.</p>
          ) : (
            <table className={styles.draftTable}>
              <thead>
                <tr>
                  <th>When</th>
                  <th>Tag</th>
                  <th>Issue</th>
                  <th>Subject</th>
                  <th>Status</th>
                  <th>Module</th>
                  <th>Match</th>
                  <th>Relevance</th>
                  <th>Detail</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((e) => {
                  const rel = parseRelevance(e.relevance_json);
                  return (
                    <tr key={e.id}>
                      <td className={styles.tabular} title={e.created_at}>{relTime(e.created_at)}</td>
                      <td>{e.tag || '-'}</td>
                      <td>
                        {e.kind === 'dispatch' ? <em>dispatch</em>
                          : e.issue_url ? <a href={e.issue_url} target="_blank" rel="noreferrer">#{e.issue_id}</a>
                          : (e.issue_id ? `#${e.issue_id}` : '-')}
                      </td>
                      <td>{e.subject || (e.kind === 'dispatch' ? `${e.deployer || 'unknown deployer'}` : '-')}</td>
                      <td><code className={styles.smallCode}>{e.status}</code></td>
                      <td>{e.module || '-'}</td>
                      <td>{e.match_method && e.match_method !== 'none' ? e.match_method : '-'}</td>
                      <td title={rel?.reason || ''}>
                        {rel?.verdict ? `${rel.verdict} (${rel.confidence})` : '-'}
                      </td>
                      <td>
                        {e.error ? <span title={e.error}>{e.error.slice(0, 80)}{e.error.length > 80 ? '…' : ''}</span>
                          : e.article_path ? <code className={styles.smallCode}>{e.article_path}</code>
                          : e.meta_json ? <code className={styles.smallCode}>{e.meta_json.slice(0, 80)}</code>
                          : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
}

export default function ReleaseEventsPage(): ReactNode {
  return (
    <Layout title="Release events - Admin" description="Audit trail of automated release-draft article creation.">
      <BrowserOnly fallback={<div><p>Loading…</p></div>}>
        {() => <ReleaseEventsAdmin />}
      </BrowserOnly>
    </Layout>
  );
}
