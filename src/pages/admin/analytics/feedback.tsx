import React, {useEffect, useMemo, useState} from 'react';
import Layout from '@theme/Layout';
import BrowserOnly from '@docusaurus/BrowserOnly';
import Link from '@docusaurus/Link';
import {useCurrentUser} from '@site/src/contexts/UserContext';
import styles from './feedback.module.css';

/**
 * Article feedback dashboard. Superadmin-only.
 *
 * Reads:
 *   GET /api/admin/feedback-summary?days=30
 *   GET /api/admin/feedback?slug=...
 *
 * Shows: rollup tiles, lowest-rated and highest-engaged tables, click-to-
 * drill-down panel with each article's "No" free-text comments. Inline SVG
 * sparkline per row (no charting library).
 */

type PerArticle = {
  slug: string;
  votes: number;
  up: number;
  down: number;
  helpfulPct: number;
};
type Summary = {
  ok: boolean;
  windowDays: number;
  totals: {total: number; up: number; down: number; articles: number};
  perArticle: PerArticle[];
};

type Comment = {
  id: number;
  ts: string;
  vote: 'up' | 'down';
  viewer_email: string | null;
  comment: string | null;
  user_agent: string | null;
};

const WINDOW_OPTIONS = [
  {label: '24 hours', days: 1},
  {label: '7 days', days: 7},
  {label: '30 days', days: 30},
  {label: '90 days', days: 90},
];

function Sparkline({values}: {values: number[]}): JSX.Element {
  // Render the helpfulPct trend across a fixed window. For now, render a
  // single bar - the summary endpoint doesn't yet emit a time series. The
  // UI is ready for it when we add it.
  if (!values.length) {
    return <span aria-hidden="true">-</span>;
  }
  const max = Math.max(...values, 100);
  const w = 60;
  const h = 16;
  const step = w / values.length;
  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      role="img"
      aria-label="trend">
      {values.map((v, i) => {
        const barH = Math.max(1, Math.round((v / max) * (h - 1)));
        return (
          <rect
            key={i}
            x={i * step}
            y={h - barH}
            width={Math.max(1, step - 1)}
            height={barH}
            fill="var(--ifm-color-primary)"
            opacity={0.55 + (v / max) * 0.45}
          />
        );
      })}
    </svg>
  );
}

function Dashboard(): JSX.Element {
  const user = useCurrentUser();
  const [days, setDays] = useState(30);
  const [data, setData] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[] | null>(null);
  const [folderFilter, setFolderFilter] = useState<string>('');

  const isSuperadmin = (user.roles || []).includes('superadmin');

  useEffect(() => {
    if (!isSuperadmin) return;
    setLoading(true);
    setError(null);
    fetch(`/api/admin/feedback-summary?days=${days}`, {credentials: 'same-origin'})
      .then((r) => (r.ok ? r.json() : Promise.reject(r.statusText)))
      .then(setData)
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [days, isSuperadmin]);

  useEffect(() => {
    if (!selected) {
      setComments(null);
      return;
    }
    fetch(`/api/admin/feedback?slug=${encodeURIComponent(selected)}&limit=200`, {credentials: 'same-origin'})
      .then((r) => (r.ok ? r.json() : Promise.reject(r.statusText)))
      .then((d) => setComments(d.rows || []))
      .catch(() => setComments([]));
  }, [selected]);

  const folders = useMemo(() => {
    if (!data) return [];
    const set = new Set<string>();
    for (const r of data.perArticle) {
      const folder = r.slug.split('/').slice(0, -1).join('/') || '/';
      set.add(folder);
    }
    return Array.from(set).sort();
  }, [data]);

  const filtered = useMemo(() => {
    if (!data) return [];
    if (!folderFilter) return data.perArticle;
    return data.perArticle.filter((r) =>
      r.slug.startsWith(folderFilter === '/' ? '/' : folderFilter + '/'),
    );
  }, [data, folderFilter]);

  const lowestRated = useMemo(
    () =>
      [...filtered]
        .filter((r) => r.votes >= 3)
        .sort((a, b) => a.helpfulPct - b.helpfulPct)
        .slice(0, 15),
    [filtered],
  );
  const mostEngaged = useMemo(
    () => [...filtered].sort((a, b) => b.votes - a.votes).slice(0, 15),
    [filtered],
  );

  if (!isSuperadmin) {
    return (
      <div className={styles.wrap}>
        <h1>Article feedback</h1>
        <p>You don't have access to this dashboard.</p>
        <p><Link to="/">← Back to the homepage</Link></p>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <h1>Article feedback</h1>
      <p className={styles.subhead}>
        Vote rollup from <code>/api/feedback</code>. Lowest-rated articles are
        rewrite candidates; most-engaged tell us what's working.{' '}
        <Link to="/admin/analytics/chat/">Chat analytics dashboard →</Link>
      </p>

      <div className={styles.controls}>
        <label>
          Window:
          <select value={days} onChange={(e) => setDays(parseInt(e.target.value, 10))}>
            {WINDOW_OPTIONS.map((w) => (
              <option key={w.days} value={w.days}>{w.label}</option>
            ))}
          </select>
        </label>
        <label>
          Folder:
          <select value={folderFilter} onChange={(e) => setFolderFilter(e.target.value)}>
            <option value="">All folders</option>
            {folders.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </label>
      </div>

      {loading && <p>Loading…</p>}
      {error && <p className={styles.error}>Error: {error}</p>}

      {data && (
        <>
          <div className={styles.tiles}>
            <div className={styles.tile}>
              <span className={styles.tileLabel}>Total votes</span>
              <span className={styles.tileValue}>{data.totals.total ?? 0}</span>
            </div>
            <div className={styles.tile}>
              <span className={styles.tileLabel}>Helpful %</span>
              <span className={styles.tileValue}>
                {data.totals.total ? Math.round(((data.totals.up || 0) / data.totals.total) * 100) : 0}%
              </span>
            </div>
            <div className={styles.tile}>
              <span className={styles.tileLabel}>Articles voted on</span>
              <span className={styles.tileValue}>{data.totals.articles ?? 0}</span>
            </div>
            <div className={styles.tile}>
              <span className={styles.tileLabel}>Window</span>
              <span className={styles.tileValue}>{data.windowDays}d</span>
            </div>
          </div>

          <h2>Lowest-rated (≥3 votes) - rewrite candidates</h2>
          {lowestRated.length === 0 ? (
            <p className={styles.empty}>No articles cross the 3-vote threshold yet.</p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Article</th>
                  <th className={styles.numCol}>Helpful %</th>
                  <th className={styles.numCol}>Votes</th>
                  <th>Trend</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {lowestRated.map((r) => (
                  <tr key={r.slug} className={r.slug === selected ? styles.rowActive : undefined}>
                    <td><Link to={r.slug}>{r.slug}</Link></td>
                    <td className={styles.numCol}>{r.helpfulPct}%</td>
                    <td className={styles.numCol}>{r.votes}</td>
                    <td><Sparkline values={[r.helpfulPct]} /></td>
                    <td>
                      <button
                        className={styles.drillBtn}
                        onClick={() => setSelected(r.slug === selected ? null : r.slug)}>
                        {r.slug === selected ? 'Close' : 'Comments'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <h2>Most-engaged</h2>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Article</th>
                <th className={styles.numCol}>Votes</th>
                <th className={styles.numCol}>Helpful %</th>
                <th>Trend</th>
              </tr>
            </thead>
            <tbody>
              {mostEngaged.map((r) => (
                <tr key={r.slug}>
                  <td><Link to={r.slug}>{r.slug}</Link></td>
                  <td className={styles.numCol}>{r.votes}</td>
                  <td className={styles.numCol}>{r.helpfulPct}%</td>
                  <td><Sparkline values={[r.helpfulPct]} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {selected && comments && (
        <section className={styles.drawer}>
          <h2>Comments - {selected}</h2>
          {comments.length === 0 ? (
            <p className={styles.empty}>No free-text comments yet.</p>
          ) : (
            <ul className={styles.comments}>
              {comments.filter((c) => c.comment).map((c) => (
                <li key={c.id}>
                  <span className={styles.commentMeta}>
                    {c.vote === 'down' ? '👎' : '👍'} {c.ts.slice(0, 10)}
                    {c.viewer_email ? ` · ${c.viewer_email}` : ''}
                  </span>
                  <p>{c.comment}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}

export default function FeedbackDashboard(): JSX.Element {
  return (
    <Layout title="Article feedback - Admin" description="Article-level feedback rollups">
      <BrowserOnly fallback={<div className={styles.wrap}><p>Loading…</p></div>}>
        {() => <Dashboard />}
      </BrowserOnly>
    </Layout>
  );
}
