import React, {useEffect, useMemo, useState} from 'react';
import Layout from '@theme/Layout';
import BrowserOnly from '@docusaurus/BrowserOnly';
import Link from '@docusaurus/Link';
import {useCurrentUser} from '@site/src/contexts/UserContext';
import styles from './feedback.module.css';

/**
 * Wynnie chat analytics dashboard. Superadmin-only.
 *
 * Reads:
 *   GET /api/admin/chat-logs/dashboard?days=30
 *
 * Two questions for content owners:
 *   - "What should I write?" -> Top Unanswered Queries table
 *   - "What should I fix?"   -> Article Performance table
 *
 * The Article Performance table is the join between citations (from
 * chat_exchanges.citations_json) and user_rating on those exchanges -
 * surfaces which articles the bot keeps citing AND whether users say
 * those answers helped.
 */

type Stats = {
  total_exchanges: number;
  total_conversations: number;
  avg_confidence: number | null;
  avg_relevance_score: number | null;
  avg_response_time_ms: number | null;
  fallback_count: number;
  refusal_count: number;
  total_prompt_tokens: number;
  total_completion_tokens: number;
  thumbs_up: number;
  thumbs_down: number;
  duplicate_count: number;
};

type QueryTypeRow = {query_type: string; count: number};

type TopUnansweredRow = {
  normalizedQuery: string;
  exampleQuery: string;
  count: number;
  distinctUsers: number;
  lastAskedAt: string;
  avgRelevance: number | null;
};

type ArticleRow = {
  url: string;
  title: string | null;
  citationCount: number;
  clickCount: number;
  ctrPct: number | null;
  avgConfidence: number | null;
  thumbsUp: number;
  thumbsDown: number;
  helpfulPct: number | null;
};

type Abandonment = {
  totalConversations: number;
  abandoned: number;
  abandonedPct: number | null;
};

type Health = {
  db_size_mb: number;
  wal_size_bytes: number;
  total_conversations: number;
  total_exchanges: number;
  oldest_record: string | null;
  circuit_breaker_status: 'open' | 'closed';
  consecutive_failures: number;
  logging_enabled: boolean;
};

type Dashboard = {
  ok: boolean;
  windowDays: number;
  stats: Stats;
  queryTypes: QueryTypeRow[];
  topUnanswered: TopUnansweredRow[];
  articlePerformance: ArticleRow[];
  abandonment: Abandonment;
  health: Health;
};

const WINDOW_OPTIONS = [
  {label: '24 hours', days: 1},
  {label: '7 days', days: 7},
  {label: '30 days', days: 30},
  {label: '90 days', days: 90},
];

const QUERY_TYPE_LABEL: Record<string, string> = {
  'how-to': 'How-to',
  'troubleshooting': 'Troubleshooting',
  'definition': 'Definition',
  'commercial': 'Commercial',
  'greeting': 'Greeting',
  'general': 'General',
};

type SortKey = 'citationCount' | 'helpfulPct' | 'avgConfidence' | 'thumbsDown' | 'ctrPct';
type SortDir = 'asc' | 'desc';

function fmtDateShort(iso: string | null): string {
  if (!iso) return '-';
  return iso.slice(0, 10);
}

function fmtPct(n: number | null): string {
  return n === null || Number.isNaN(n) ? '-' : `${n}%`;
}

function fmtNum(n: number | null | undefined, digits = 0): string {
  if (n === null || n === undefined || Number.isNaN(n)) return '-';
  return digits === 0 ? String(Math.round(n)) : n.toFixed(digits);
}

function fmtBytesToMb(b: number): string {
  return (b / (1024 * 1024)).toFixed(2) + ' MB';
}

function authoringHref(q: TopUnansweredRow): string {
  const title = encodeURIComponent(q.exampleQuery.slice(0, 120));
  return `/admin/authoring/?title=${title}`;
}

function Dashboard(): JSX.Element {
  const user = useCurrentUser();
  const [days, setDays] = useState(30);
  const [data, setData] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('citationCount');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const isSuperadmin = (user.roles || []).includes('superadmin');

  useEffect(() => {
    if (!isSuperadmin) return;
    setLoading(true);
    setError(null);
    fetch(`/api/admin/chat-logs/dashboard?days=${days}`, {credentials: 'same-origin'})
      .then((r) => (r.ok ? r.json() : Promise.reject(r.statusText)))
      .then((d: Dashboard) => {
        if (d && d.ok) setData(d);
        else throw new Error('Bad response shape');
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [days, isSuperadmin]);

  const refusalRate = useMemo(() => {
    if (!data || !data.stats.total_exchanges) return 0;
    return Math.round((data.stats.refusal_count / data.stats.total_exchanges) * 100);
  }, [data]);
  const fallbackRate = useMemo(() => {
    if (!data || !data.stats.total_exchanges) return 0;
    return Math.round((data.stats.fallback_count / data.stats.total_exchanges) * 100);
  }, [data]);

  const helpfulRate = useMemo(() => {
    if (!data) return null;
    const total = data.stats.thumbs_up + data.stats.thumbs_down;
    if (!total) return null;
    return Math.round((data.stats.thumbs_up / total) * 100);
  }, [data]);

  const sortedArticles = useMemo<ArticleRow[]>(() => {
    if (!data) return [];
    const rows = [...data.articlePerformance];
    rows.sort((a, b) => {
      const va = a[sortKey] ?? -Infinity;
      const vb = b[sortKey] ?? -Infinity;
      if (va === vb) return 0;
      const cmp = (va as number) < (vb as number) ? -1 : 1;
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return rows;
  }, [data, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  }

  function sortIndicator(key: SortKey): string {
    if (key !== sortKey) return '';
    return sortDir === 'asc' ? ' ↑' : ' ↓';
  }

  if (!isSuperadmin) {
    return (
      <div className={styles.wrap}>
        <h1>Chat analytics</h1>
        <p>You don't have access to this dashboard.</p>
        <p><Link to="/">← Back to the homepage</Link></p>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <h1>Chat analytics</h1>
      <p className={styles.subhead}>
        Insights from chatbot conversations. Top Unanswered shows what users
        ask that the docs don't cover; Article Performance shows which articles the
        bot cites and whether those answers helped.{' '}
        <Link to="/admin/analytics/feedback/">Article feedback dashboard →</Link>
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
      </div>

      {loading && <p>Loading…</p>}
      {error && <p className={styles.error}>Error: {error}</p>}

      {data && (
        <>
          {/* KPI tiles */}
          <div className={styles.tiles}>
            <div className={styles.tile}>
              <span className={styles.tileLabel}>Total exchanges</span>
              <span className={styles.tileValue}>{data.stats.total_exchanges ?? 0}</span>
            </div>
            <div className={styles.tile}>
              <span className={styles.tileLabel}>No-docs refusal</span>
              <span className={styles.tileValue}>{refusalRate}%</span>
              <span className={styles.tileLabel} style={{fontSize: '0.7em', opacity: 0.7}}>
                bot had no good citation
              </span>
            </div>
            <div className={styles.tile}>
              <span className={styles.tileLabel}>👍 rate</span>
              <span className={styles.tileValue}>
                {helpfulRate === null ? '-' : `${helpfulRate}%`}
              </span>
            </div>
            <div className={styles.tile}>
              <span className={styles.tileLabel}>Avg response</span>
              <span className={styles.tileValue}>
                {data.stats.avg_response_time_ms ? `${Math.round(data.stats.avg_response_time_ms)} ms` : '-'}
              </span>
            </div>
          </div>

          {/* Top Unanswered Queries */}
          <h2>Top Unanswered Queries — what to write</h2>
          <p className={styles.subhead}>
            Questions the bot couldn't answer from the docs (fallback fired, or top
            doc distance was too high). Clustered by normalised text.
          </p>
          {data.topUnanswered.length === 0 ? (
            <p className={styles.empty}>No unanswered queries in this window. Either the docs are great or no one's asked yet.</p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Sample query</th>
                  <th className={styles.numCol}>Count</th>
                  <th className={styles.numCol}>Distinct users</th>
                  <th>Last asked</th>
                  <th className={styles.numCol}>Avg score</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {data.topUnanswered.map((q) => (
                  <tr key={q.normalizedQuery}>
                    <td>{q.exampleQuery}</td>
                    <td className={styles.numCol}>{q.count}</td>
                    <td className={styles.numCol}>{q.distinctUsers}</td>
                    <td>{fmtDateShort(q.lastAskedAt)}</td>
                    <td className={styles.numCol}>{fmtNum(q.avgRelevance, 2)}</td>
                    <td>
                      <Link className={styles.drillBtn} to={authoringHref(q)}>
                        Create article
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Article Performance */}
          <h2>Article Performance — what to fix</h2>
          <p className={styles.subhead}>
            Articles the bot has cited at least 3 times. Sort by 👎 or low confidence
            to find articles the bot reaches for but can't get good answers from.
          </p>
          {sortedArticles.length === 0 ? (
            <p className={styles.empty}>No articles have been cited ≥3 times in this window yet.</p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Article</th>
                  <th
                    className={styles.numCol}
                    style={{cursor: 'pointer'}}
                    onClick={() => toggleSort('citationCount')}>
                    Citations{sortIndicator('citationCount')}
                  </th>
                  <th
                    className={styles.numCol}
                    style={{cursor: 'pointer'}}
                    onClick={() => toggleSort('ctrPct')}>
                    CTR{sortIndicator('ctrPct')}
                  </th>
                  <th
                    className={styles.numCol}
                    style={{cursor: 'pointer'}}
                    onClick={() => toggleSort('avgConfidence')}>
                    Avg confidence{sortIndicator('avgConfidence')}
                  </th>
                  <th className={styles.numCol}>👍</th>
                  <th
                    className={styles.numCol}
                    style={{cursor: 'pointer'}}
                    onClick={() => toggleSort('thumbsDown')}>
                    👎{sortIndicator('thumbsDown')}
                  </th>
                  <th
                    className={styles.numCol}
                    style={{cursor: 'pointer'}}
                    onClick={() => toggleSort('helpfulPct')}>
                    Helpful %{sortIndicator('helpfulPct')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedArticles.map((a) => (
                  <tr key={a.url}>
                    <td>
                      <Link to={a.url}>
                        {a.title || a.url}
                      </Link>
                    </td>
                    <td className={styles.numCol}>{a.citationCount}</td>
                    <td className={styles.numCol}>{fmtPct(a.ctrPct)}</td>
                    <td className={styles.numCol}>{fmtNum(a.avgConfidence, 2)}</td>
                    <td className={styles.numCol}>{a.thumbsUp}</td>
                    <td className={styles.numCol}>{a.thumbsDown}</td>
                    <td className={styles.numCol}>{fmtPct(a.helpfulPct)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Query-type breakdown */}
          <h2>Query-type breakdown</h2>
          {data.queryTypes.length === 0 ? (
            <p className={styles.empty}>No exchanges classified in this window.</p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Type</th>
                  <th className={styles.numCol}>Count</th>
                  <th>Share</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const totalCount = data.queryTypes.reduce((a, b) => a + b.count, 0);
                  return data.queryTypes.map((q) => {
                    const pct = totalCount > 0 ? Math.round((q.count / totalCount) * 100) : 0;
                    return (
                      <tr key={q.query_type}>
                        <td>{QUERY_TYPE_LABEL[q.query_type] || q.query_type}</td>
                        <td className={styles.numCol}>{q.count}</td>
                        <td>
                          <span style={{
                            display: 'inline-block',
                            width: `${pct}%`,
                            maxWidth: '180px',
                            minWidth: '4px',
                            height: '10px',
                            background: 'var(--ifm-color-primary)',
                            opacity: 0.7,
                            borderRadius: '2px',
                            verticalAlign: 'middle',
                          }} /> <span style={{marginLeft: 8, fontSize: '0.85em', color: 'var(--ifm-color-content-secondary)'}}>{pct}%</span>
                        </td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
            </table>
          )}

          {/* Operational footer */}
          <section style={{
            marginTop: 'var(--space-7)',
            padding: 'var(--space-4)',
            background: 'var(--ifm-color-emphasis-100)',
            borderRadius: 8,
            fontSize: '0.9em',
            color: 'var(--ifm-color-content-secondary)',
          }}>
            <strong>Operational health</strong>
            <ul style={{margin: '8px 0 0', paddingLeft: 18, lineHeight: 1.6}}>
              <li>
                Conversation abandonment: <strong>{data.abandonment.abandonedPct ?? 0}%</strong>
                {' '}({data.abandonment.abandoned} of {data.abandonment.totalConversations} conversations were single-turn with no 👍)
              </li>
              <li>API failure rate: <strong>{fallbackRate}%</strong> (OpenAI errored; bot served the fallback message)</li>
              <li>DB size: {data.health.db_size_mb} MB · WAL: {fmtBytesToMb(data.health.wal_size_bytes)}</li>
              <li>Tokens this window: {data.stats.total_prompt_tokens?.toLocaleString() ?? 0} prompt · {data.stats.total_completion_tokens?.toLocaleString() ?? 0} completion</li>
              <li>Total logged: {data.health.total_exchanges} exchanges · {data.health.total_conversations} conversations · oldest: {fmtDateShort(data.health.oldest_record)}</li>
              <li>Circuit breaker: <strong>{data.health.circuit_breaker_status}</strong> ({data.health.consecutive_failures} consecutive failures) · logging {data.health.logging_enabled ? 'enabled' : 'disabled'}</li>
            </ul>
          </section>
        </>
      )}
    </div>
  );
}

export default function ChatAnalyticsDashboard(): JSX.Element {
  return (
    <Layout title="Chat analytics - Admin" description="Wynnie chat-log rollups and article-performance signals">
      <BrowserOnly fallback={<div className={styles.wrap}><p>Loading…</p></div>}>
        {() => <Dashboard />}
      </BrowserOnly>
    </Layout>
  );
}
