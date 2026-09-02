import React, {useEffect, useMemo, useState} from 'react';
import Layout from '@theme/Layout';
import BrowserOnly from '@docusaurus/BrowserOnly';
import Link from '@docusaurus/Link';
import {useCurrentUser, useIsUserReady} from '@site/src/contexts/UserContext';
import styles from './analytics.module.css';

/**
 * Ally chat analytics dashboard. Superadmin-only.
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
  error_count: number;
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
  module: string | null;
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
  dropped_writes: number;
  logging_enabled: boolean;
};

type OrgRow = {orgId: string; orgName: string | null; conversationCount: number};

type Dashboard = {
  ok: boolean;
  windowDays: number;
  filter: {role: string | null; orgId: string | null};
  stats: Stats;
  queryTypes: QueryTypeRow[];
  topUnanswered: TopUnansweredRow[];
  articlePerformance: ArticleRow[];
  abandonment: Abandonment;
  availableOrgs: OrgRow[];
  health: Health;
};

// Role filter options - only the user-facing role taxonomy. lamadmin and
// superadmin are deliberately omitted to keep their existence out of the UI;
// their conversations still count toward the "All roles" totals.
const ROLE_OPTIONS: Array<{value: string; label: string}> = [
  {value: 'user',     label: 'Learner'},
  {value: 'manager',  label: 'Manager'},
  {value: 'editor',   label: 'Author / Editor'},
  {value: 'admin',    label: 'Admin'},
  {value: 'orgadmin', label: 'Org admin'},
];

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

// Friendly labels for module slugs surfaced on the dashboard. Slugs that
// aren't mapped fall through to their raw slug; null/empty stays as "-".
const MODULE_LABEL: Record<string, string> = {
  'quiz':                  'Quiz',
  'smartpath':             'SmartPath',
  'smartfeed':             'SmartFeed',
  'video-coaching':        'Video Coaching',
  'ai-coaching':           'AI Coaching',
  'field-coaching':        'Field Coaching',
  'survey':                'Survey',
  'knowledge-hub':         'Knowledge Hub',
  'forms':                 'Forms',
  'kpi-gamification':      'KPI & Gamification',
  'notifications':         'Notifications',
  'cross-module-features': 'Cross-module',
  // Synthetic slugs returned by the chat-logger tagger when the query
  // is genuinely ambiguous and page_url can't disambiguate.
  'coaching-group':        'Coaching',
  'multiple':              'Multiple',
};

function fmtModule(slug: string | null): string {
  if (!slug) return '-';
  return MODULE_LABEL[slug] || slug;
}

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
  // Array.from splits on code points, so the cut can't split a surrogate
  // pair (a bare String.slice on an emoji query produced a lone surrogate).
  const title = encodeURIComponent(Array.from(q.exampleQuery).slice(0, 120).join(''));
  return `/admin/authoring/?title=${title}`;
}

function Dashboard(): JSX.Element {
  const user = useCurrentUser();
  const userReady = useIsUserReady();
  const [days, setDays] = useState(30);
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [orgFilter, setOrgFilter] = useState<string>('');
  const [data, setData] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('citationCount');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const isSuperadmin = (user.roles || []).includes('superadmin');

  useEffect(() => {
    if (!isSuperadmin) return;
    // Cancellation flag (same pattern as UserContext): without it, rapid
    // filter switches can land responses out of order and leave stale data.
    let cancelled = false;
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({days: String(days)});
    if (roleFilter) params.set('role', roleFilter);
    if (orgFilter) params.set('orgId', orgFilter);
    fetch(`/api/admin/chat-logs/dashboard?${params.toString()}`, {credentials: 'same-origin'})
      .then((r) =>
        r.ok
          ? r.json()
          : Promise.reject(new Error(`HTTP ${r.status}${r.statusText ? ` ${r.statusText}` : ''}`)),
      )
      .then((d: Dashboard) => {
        if (cancelled) return;
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
  }, [days, roleFilter, orgFilter, isSuperadmin]);

  // null = no data in the window; rendered as '-' so an empty window is not
  // conflated with a genuine 0% (matches helpfulRate below).
  const refusalRate = useMemo(() => {
    if (!data || !data.stats.total_exchanges) return null;
    return Math.round((data.stats.refusal_count / data.stats.total_exchanges) * 100);
  }, [data]);
  const fallbackRate = useMemo(() => {
    if (!data || !data.stats.total_exchanges) return null;
    return Math.round((data.stats.fallback_count / data.stats.total_exchanges) * 100);
  }, [data]);

  const helpfulRate = useMemo(() => {
    if (!data) return null;
    const total = data.stats.thumbs_up + data.stats.thumbs_down;
    if (!total) return null;
    return Math.round((data.stats.thumbs_up / total) * 100);
  }, [data]);

  const queryTypeTotal = useMemo(
    () => (data ? data.queryTypes.reduce((a, b) => a + b.count, 0) : 0),
    [data],
  );

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

  // Sortable column header: a real <button> (keyboard-operable) inside a
  // <th> carrying aria-sort. `srLabel` supplies a text alternative when the
  // visible label is an emoji.
  function sortableTh(key: SortKey, label: string, srLabel?: string): JSX.Element {
    const active = key === sortKey;
    return (
      <th
        scope="col"
        className={styles.numCol}
        aria-sort={active ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined}>
        <button type="button" className={styles.sortBtn} onClick={() => toggleSort(key)}>
          {srLabel ? (
            <>
              <span aria-hidden="true">{label}</span>
              <span className={styles.srOnly}>{srLabel}</span>
            </>
          ) : (
            label
          )}
          <span aria-hidden="true">{sortIndicator(key)}</span>
        </button>
      </th>
    );
  }

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
        <h1>Chat analytics</h1>
        <p>You don't have access to this dashboard.</p>
        <p><Link to="/home">← Back to the homepage</Link></p>
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
        <label>
          Role:
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="">All roles</option>
            {ROLE_OPTIONS.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </label>
        <label>
          Organization:
          <select value={orgFilter} onChange={(e) => setOrgFilter(e.target.value)}>
            <option value="">All orgs</option>
            {(data?.availableOrgs || []).map((o) => (
              <option key={o.orgId} value={o.orgId}>
                {(o.orgName || o.orgId)} ({o.conversationCount})
              </option>
            ))}
          </select>
        </label>
        {(roleFilter || orgFilter) && (
          <button
            type="button"
            className={styles.clearBtn}
            onClick={() => { setRoleFilter(''); setOrgFilter(''); }}>
            Clear filters
          </button>
        )}
      </div>

      {loading && <p role="status">Loading…</p>}
      {error && <p role="alert" className={styles.error}>Error: {error}</p>}

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
              <span className={styles.tileValue}>{fmtPct(refusalRate)}</span>
              <span className={`${styles.tileLabel} ${styles.tileCaption}`}>
                bot had no good citation
              </span>
            </div>
            <div className={styles.tile}>
              <span className={styles.tileLabel}>
                <span aria-hidden="true">👍</span>
                <span className={styles.srOnly}>Thumbs-up</span> rate
              </span>
              <span className={styles.tileValue}>{fmtPct(helpfulRate)}</span>
            </div>
            <div className={styles.tile}>
              <span className={styles.tileLabel}>Avg response</span>
              <span className={styles.tileValue}>
                {data.stats.avg_response_time_ms ? `${Math.round(data.stats.avg_response_time_ms)} ms` : '-'}
              </span>
            </div>
          </div>

          {/* Top Unanswered Queries */}
          <h2>Top Unanswered Queries - what to write</h2>
          <p className={styles.subhead}>
            Questions the bot couldn't answer from the docs (fallback fired, or top
            doc distance was too high). Clustered by normalised text.
          </p>
          {data.topUnanswered.length === 0 ? (
            <p className={styles.empty}>No unanswered queries in this window. Either the docs are great or no one's asked yet.</p>
          ) : (
            <table className={styles.table}>
              <caption className={styles.srOnly}>
                Top unanswered queries, clustered by normalised text
              </caption>
              <thead>
                <tr>
                  <th scope="col">Sample query</th>
                  <th scope="col">Module</th>
                  <th scope="col" className={styles.numCol}>Count</th>
                  <th scope="col" className={styles.numCol}>Distinct users</th>
                  <th scope="col">Last asked (UTC)</th>
                  <th scope="col" className={styles.numCol}>Avg score</th>
                  <th scope="col"><span className={styles.srOnly}>Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {data.topUnanswered.map((q) => (
                  <tr key={`${q.module ?? ''}|${q.normalizedQuery}`}>
                    <td>{q.exampleQuery}</td>
                    <td>{fmtModule(q.module)}</td>
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
          <h2>Article Performance - what to fix</h2>
          <p className={styles.subhead}>
            Articles the bot has cited at least 3 times. Sort by 👎 or low confidence
            to find articles the bot reaches for but can't get good answers from.
            {sortedArticles.length >= 50 && (
              <> Showing the top 50 articles by citation count; sorting reorders
              within that slice.</>
            )}
          </p>
          {sortedArticles.length === 0 ? (
            <p className={styles.empty}>No articles have been cited ≥3 times in this window yet.</p>
          ) : (
            <table className={styles.table}>
              <caption className={styles.srOnly}>
                Article performance: citations, click-through, and ratings per cited article
              </caption>
              <thead>
                <tr>
                  <th scope="col">Article</th>
                  {sortableTh('citationCount', 'Citations')}
                  {sortableTh('ctrPct', 'CTR')}
                  {sortableTh('avgConfidence', 'Avg confidence')}
                  <th scope="col" className={styles.numCol}>
                    <span aria-hidden="true">👍</span>
                    <span className={styles.srOnly}>Thumbs up</span>
                  </th>
                  {sortableTh('thumbsDown', '👎', 'Thumbs down')}
                  {sortableTh('helpfulPct', 'Helpful %')}
                </tr>
              </thead>
              <tbody>
                {sortedArticles.map((a) => (
                  <tr key={a.url}>
                    <td>
                      {/* Citation URLs come from stored JSON - only link
                          root-relative paths, never render an absolute or
                          javascript: href. */}
                      {a.url.startsWith('/') ? (
                        <Link to={a.url}>{a.title || a.url}</Link>
                      ) : (
                        a.title || a.url
                      )}
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
              <caption className={styles.srOnly}>
                Exchanges by query type with share of total
              </caption>
              <thead>
                <tr>
                  <th scope="col">Type</th>
                  <th scope="col" className={styles.numCol}>Count</th>
                  <th scope="col">Share</th>
                </tr>
              </thead>
              <tbody>
                {data.queryTypes.map((q) => {
                  const pct = queryTypeTotal > 0 ? Math.round((q.count / queryTypeTotal) * 100) : 0;
                  return (
                    <tr key={q.query_type}>
                      <td>{QUERY_TYPE_LABEL[q.query_type] || q.query_type}</td>
                      <td className={styles.numCol}>{q.count}</td>
                      <td>
                        <span className={styles.shareCell}>
                          {/* Fixed-width track so bar lengths are comparable
                              across rows; the adjacent text carries the value
                              for assistive tech. */}
                          <span className={styles.shareTrack} aria-hidden="true">
                            <span className={styles.shareFill} style={{width: `${pct}%`}} />
                          </span>
                          <span className={styles.sharePct}>{pct}%</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {/* Operational footer */}
          <section className={styles.opsFooter}>
            <h2>Operational health</h2>
            <ul>
              <li>
                Conversation abandonment: <strong>{fmtPct(data.abandonment.abandonedPct)}</strong>
                {' '}({data.abandonment.abandoned} of {data.abandonment.totalConversations} conversations were single-turn with no 👍)
              </li>
              <li>API failure rate: <strong>{fmtPct(fallbackRate)}</strong> (OpenAI errored; bot served the fallback message)</li>
              <li>Errored exchanges: <strong>{data.stats.error_count ?? 0}</strong> (index outage or handler error - the user got no answer)</li>
              <li>DB size: {data.health.db_size_mb} MB · WAL: {fmtBytesToMb(data.health.wal_size_bytes)}</li>
              <li>Tokens this window: {data.stats.total_prompt_tokens?.toLocaleString() ?? 0} prompt · {data.stats.total_completion_tokens?.toLocaleString() ?? 0} completion</li>
              <li>Total logged: {data.health.total_exchanges} exchanges · {data.health.total_conversations} conversations · oldest: {fmtDateShort(data.health.oldest_record)} (UTC)</li>
              <li>
                Circuit breaker: <strong>{data.health.circuit_breaker_status}</strong>
                {' '}({data.health.consecutive_failures} consecutive failures
                {data.health.dropped_writes ? `, ${data.health.dropped_writes} writes dropped since boot` : ''})
                {' '}· logging {data.health.logging_enabled ? 'enabled' : 'disabled'}
              </li>
            </ul>
          </section>
        </>
      )}
    </div>
  );
}

export default function ChatAnalyticsDashboard(): JSX.Element {
  return (
    <Layout title="Chat analytics - Admin" description="Ally chat-log rollups and article-performance signals">
      <BrowserOnly fallback={<div className={styles.wrap}><p>Loading…</p></div>}>
        {() => <Dashboard />}
      </BrowserOnly>
    </Layout>
  );
}
