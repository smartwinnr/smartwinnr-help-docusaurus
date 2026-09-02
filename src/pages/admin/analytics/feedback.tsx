import React, {useEffect, useMemo, useRef, useState} from 'react';
import Layout from '@theme/Layout';
import BrowserOnly from '@docusaurus/BrowserOnly';
import Link from '@docusaurus/Link';
import {useCurrentUser, useIsUserReady} from '@site/src/contexts/UserContext';
import styles from './analytics.module.css';

/**
 * Article feedback dashboard. Superadmin-only.
 *
 * Reads:
 *   GET /api/admin/feedback-summary?days=30
 *   GET /api/admin/feedback?slug=...&days=30
 *
 * Shows: rollup tiles, lowest-rated and highest-engaged tables, click-to-
 * drill-down panel with each article's "No" free-text comments.
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

function Dashboard(): JSX.Element {
  const user = useCurrentUser();
  const userReady = useIsUserReady();
  const [days, setDays] = useState(30);
  const [data, setData] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[] | null>(null);
  const [commentsError, setCommentsError] = useState<string | null>(null);
  const [folderFilter, setFolderFilter] = useState<string>('');
  const drawerRef = useRef<HTMLElement | null>(null);

  const isSuperadmin = (user.roles || []).includes('superadmin');

  useEffect(() => {
    if (!isSuperadmin) return;
    // Cancellation flag (same pattern as UserContext) so rapid window
    // switches can't land out of order and leave stale data on screen.
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`/api/admin/feedback-summary?days=${days}`, {credentials: 'same-origin'})
      .then((r) =>
        r.ok
          ? r.json()
          : Promise.reject(new Error(`HTTP ${r.status}${r.statusText ? ` ${r.statusText}` : ''}`)),
      )
      .then((d: Summary) => {
        if (cancelled) return;
        // The logger returns HTTP-200 {ok:false} bodies (disabled /
        // read-failed); storing one unchecked crashed at data.totals.total.
        if (d && d.ok) setData(d);
        else throw new Error('Bad response shape');
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [days, isSuperadmin]);

  useEffect(() => {
    if (!selected) {
      setComments(null);
      setCommentsError(null);
      return;
    }
    let cancelled = false;
    setCommentsError(null);
    fetch(
      `/api/admin/feedback?slug=${encodeURIComponent(selected)}&limit=200&days=${days}`,
      {credentials: 'same-origin'},
    )
      .then((r) =>
        r.ok
          ? r.json()
          : Promise.reject(new Error(`HTTP ${r.status}${r.statusText ? ` ${r.statusText}` : ''}`)),
      )
      .then((d) => {
        if (!cancelled) setComments(d.rows || []);
      })
      .catch((e) => {
        // Surface the failure - it used to render as "No comments yet".
        if (!cancelled) {
          setComments([]);
          setCommentsError(e instanceof Error ? e.message : String(e));
        }
      });
    return () => {
      cancelled = true;
    };
  }, [selected, days]);

  // Move focus into the drawer when it opens so keyboard and screen-reader
  // users land on the content they just requested.
  useEffect(() => {
    if (selected && comments && drawerRef.current) {
      drawerRef.current.focus();
    }
  }, [selected, comments]);

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
    // '/' means root-level articles only. startsWith('/') matched every slug,
    // making the root option a silent no-op filter.
    if (folderFilter === '/') {
      return data.perArticle.filter((r) => r.slug.lastIndexOf('/') <= 0);
    }
    return data.perArticle.filter((r) => r.slug.startsWith(folderFilter + '/'));
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

  // Wait for /api/me before evaluating roles - the bare user starts as the
  // unauthenticated default, which flashed "You don't have access" at every
  // superadmin for a moment on load.
  if (!userReady) {
    return (
      <div className={styles.wrap}>
        <p role="status">Loading…</p>
      </div>
    );
  }

  if (!isSuperadmin) {
    return (
      <div className={styles.wrap}>
        <h1>Article feedback</h1>
        <p>You don't have access to this dashboard.</p>
        <p><Link to="/home">← Back to the homepage</Link></p>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <h1>Article feedback</h1>
      <p className={styles.subhead}>
        Reader feedback rollup. Lowest-rated articles are rewrite candidates;
        most-engaged tell us what's working.{' '}
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

      {loading && <p role="status">Loading…</p>}
      {error && <p role="alert" className={styles.error}>Error: {error}</p>}

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
                {/* '-' distinguishes "no votes" from a real 0%; one decimal
                    matches the per-row precision below. */}
                {data.totals.total
                  ? `${(((data.totals.up || 0) / data.totals.total) * 100).toFixed(1)}%`
                  : '-'}
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
              <caption className={styles.srOnly}>
                Lowest-rated articles with at least three votes
              </caption>
              <thead>
                <tr>
                  <th scope="col">Article</th>
                  <th scope="col" className={styles.numCol}>Helpful %</th>
                  <th scope="col" className={styles.numCol}>Votes</th>
                  <th scope="col"><span className={styles.srOnly}>Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {lowestRated.map((r) => (
                  <tr key={r.slug} className={r.slug === selected ? styles.rowActive : undefined}>
                    <td><Link to={r.slug}>{r.slug}</Link></td>
                    <td className={styles.numCol}>{r.helpfulPct}%</td>
                    <td className={styles.numCol}>{r.votes}</td>
                    <td>
                      <button
                        className={styles.drillBtn}
                        aria-expanded={r.slug === selected}
                        aria-controls="feedback-comments-drawer"
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
          {mostEngaged.length === 0 ? (
            <p className={styles.empty}>No votes recorded in this window yet.</p>
          ) : (
            <table className={styles.table}>
              <caption className={styles.srOnly}>
                Articles with the most feedback votes
              </caption>
              <thead>
                <tr>
                  <th scope="col">Article</th>
                  <th scope="col" className={styles.numCol}>Votes</th>
                  <th scope="col" className={styles.numCol}>Helpful %</th>
                </tr>
              </thead>
              <tbody>
                {mostEngaged.map((r) => (
                  <tr key={r.slug}>
                    <td><Link to={r.slug}>{r.slug}</Link></td>
                    <td className={styles.numCol}>{r.votes}</td>
                    <td className={styles.numCol}>{r.helpfulPct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}

      {selected && comments && (
        <section
          id="feedback-comments-drawer"
          className={styles.drawer}
          ref={drawerRef}
          tabIndex={-1}>
          <h2>Comments - {selected}</h2>
          {commentsError ? (
            <p role="alert" className={styles.error}>
              Couldn't load comments: {commentsError}
            </p>
          ) : comments.filter((c) => c.comment).length === 0 ? (
            <p className={styles.empty}>No free-text comments in this window.</p>
          ) : (
            <ul className={styles.comments}>
              {comments.filter((c) => c.comment).map((c) => (
                <li key={c.id}>
                  <span className={styles.commentMeta}>
                    <span aria-hidden="true">{c.vote === 'down' ? '👎' : '👍'}</span>
                    <span className={styles.srOnly}>
                      {c.vote === 'down' ? 'Not helpful vote' : 'Helpful vote'}
                    </span>
                    {' '}{c.ts.slice(0, 10)}
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
