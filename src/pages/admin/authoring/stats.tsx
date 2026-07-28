import React, {useEffect, useState, type ReactNode} from 'react';
import Layout from '@theme/Layout';
import BrowserOnly from '@docusaurus/BrowserOnly';
import Link from '@docusaurus/Link';
import {useCurrentUser} from '@site/src/contexts/UserContext';
import PersistenceStatus from '@site/src/components/admin/authoring/PersistenceStatus';
import styles from './styles.module.css';

/**
 * Authoring stats - `/admin/authoring/stats`.
 *
 * Activity dashboard for author managers: how many articles were created,
 * updated, and shipped in the last N days, by whom and where. Numbers come
 * from GET /api/admin/authoring/stats (publish-branch history + docs tree).
 * Superadmin only, same shell as the other authoring pages.
 */

type StatsPayload = {
  days: number;
  generatedAt: string;
  github: boolean;
  githubError: string | null;
  totals: {articles: number; published: number; drafts: number};
  window: {
    created: number;
    updated: number;
    deleted: number;
    imagesAdded: number;
    deploys: number;
    perDay: Array<{date: string; created: number; updated: number}>;
    perAuthor: Array<{author: string; created: number; updated: number}>;
    perSection: Array<{section: string; created: number; updated: number}>;
    createdArticles: Array<{path: string; title: string; author: string | null; section: string; date: string}>;
    draftsInProgress: Array<{path: string; title: string; author: string | null; date: string}>;
    deployBatches: Array<{sha: string; date: string; created: number; updated: number; deleted: number; images: number}>;
  };
  queue: {size: number; lastDeployTs: number};
};

const RANGES = [7, 30, 90];

function Tile({value, label}: {value: number | string; label: string}): ReactNode {
  return (
    <div className={styles.statTile}>
      <div className={styles.statNum}>{value}</div>
      <div className={styles.statLabel}>{label}</div>
    </div>
  );
}

/** Per-day stacked bars: New (series 1) + Updated (series 2). Pure HTML/CSS
 *  columns - each day is a flex column whose two segments scale against the
 *  window's max daily total. Hover shows the exact numbers. */
function ActivityChart({perDay}: {perDay: StatsPayload['window']['perDay']}): ReactNode {
  const max = Math.max(1, ...perDay.map((d) => d.created + d.updated));
  const H = 140;
  // 90 days of x labels won't fit - label first, last, and ~every 7th/15th.
  const labelEvery = perDay.length > 31 ? 15 : perDay.length > 10 ? 7 : 1;
  return (
    <div>
      <div className={styles.chartLegend}>
        <span><i className={`${styles.legendSwatch} ${styles.swatchCreated}`} /> New articles</span>
        <span><i className={`${styles.legendSwatch} ${styles.swatchUpdated}`} /> Updated articles</span>
      </div>
      <div className={styles.chart} style={{height: H}} role="img"
        aria-label={`Articles published per day over the last ${perDay.length} days`}>
        {perDay.map((d, i) => {
          const ch = Math.round((d.created / max) * (H - 16));
          const uh = Math.round((d.updated / max) * (H - 16));
          const total = d.created + d.updated;
          return (
            <div key={d.date} className={styles.chartCol}
              title={`${d.date}: ${d.created} new, ${d.updated} updated`}
              aria-label={`${d.date}: ${d.created} new, ${d.updated} updated`}>
              <div className={styles.chartBar}>
                {uh > 0 && <div className={styles.barUpdated} style={{height: uh}} />}
                {ch > 0 && <div className={styles.barCreated} style={{height: ch}} />}
                {total === 0 && <div className={styles.barEmpty} />}
              </div>
              <div className={styles.chartTick}>
                {(i === 0 || i === perDay.length - 1 || i % labelEvery === 0) ? d.date.slice(5) : ' '}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatsPage(): ReactNode {
  const user = useCurrentUser();
  const [days, setDays] = useState(7);
  const [data, setData] = useState<StatsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`/api/admin/authoring/stats?days=${days}`, {credentials: 'same-origin'})
      .then(async (res) => {
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        return res.json();
      })
      .then((d) => { if (!cancelled) setData(d); })
      .catch((err) => { if (!cancelled) setError((err as Error).message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [days]);

  if (!(user.roles || []).includes('superadmin')) {
    return (
      <div className={styles.wrap}>
        <h1>Authoring stats</h1>
        <p>You don't have access to this page.</p>
        <p><Link to="/">← Back to the homepage</Link></p>
      </div>
    );
  }

  const w = data?.window;
  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <div>
          <h1>Authoring stats <PersistenceStatus /></h1>
          <p className={styles.subhead}>
            What authors created and shipped, at a glance.{' '}
            <Link to="/admin/authoring/drafts">Authoring queue →</Link>{' · '}
            <Link to="/admin/authoring">New article →</Link>
          </p>
        </div>
      </header>

      <div className={styles.rangeRow}>
        {RANGES.map((r) => (
          <button key={r} type="button"
            className={days === r ? styles.rangeOn : styles.rangeOff}
            onClick={() => setDays(r)}>
            Last {r} days
          </button>
        ))}
        {data && (
          <span className={styles.hint}>
            {data.github
              ? `Updated ${new Date(data.generatedAt).toLocaleTimeString()} - refreshes every 10 minutes.`
              : `Live publish history is unavailable right now (${data.githubError ?? 'GitHub unreachable'}) - showing current-state numbers only.`}
          </span>
        )}
      </div>

      {loading && <p>Loading stats…</p>}
      {error && <p className={styles.warn}>Failed to load stats: {error}</p>}

      {data && w && (
        <>
          <div className={styles.statTiles}>
            <Tile value={w.created} label={`New articles published (last ${data.days} days)`} />
            <Tile value={w.updated} label="Existing articles updated" />
            <Tile value={w.imagesAdded} label="Screenshots added" />
            <Tile value={w.deploys} label="Site updates shipped" />
            <Tile value={data.totals.drafts} label="Drafts in progress (now)" />
            <Tile value={data.totals.published} label="Live articles (total)" />
          </div>

          {data.github && (
            <div className={styles.preview}>
              <h2>Daily activity</h2>
              <ActivityChart perDay={w.perDay} />
            </div>
          )}

          <div className={styles.statColumns}>
            {w.perAuthor.length > 0 && (
              <div className={styles.preview}>
                <h2>By author</h2>
                <table>
                  <thead><tr><th>Author</th><th>New</th><th>Updated</th></tr></thead>
                  <tbody>
                    {w.perAuthor.map((a) => (
                      <tr key={a.author}><td>{a.author}</td><td>{a.created}</td><td>{a.updated}</td></tr>
                    ))}
                  </tbody>
                </table>
                <p className={styles.hint}>
                  Attribution uses each article's current "last updated by" - an
                  article edited by a second author counts under the newer name.
                </p>
              </div>
            )}
            {w.perSection.length > 0 && (
              <div className={styles.preview}>
                <h2>By section</h2>
                <table>
                  <thead><tr><th>Section</th><th>New</th><th>Updated</th></tr></thead>
                  <tbody>
                    {w.perSection.map((s) => (
                      <tr key={s.section}><td>{s.section}</td><td>{s.created}</td><td>{s.updated}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {w.createdArticles.length > 0 && (
            <div className={styles.preview}>
              <h2>New articles in this period</h2>
              <table>
                <thead><tr><th>Title</th><th>Section</th><th>Author</th><th>Published</th></tr></thead>
                <tbody>
                  {w.createdArticles.map((a) => (
                    <tr key={a.path}>
                      <td><Link to={`/admin/authoring/edit?path=${encodeURIComponent(a.path)}`}>{a.title}</Link></td>
                      <td>{a.section}</td>
                      <td>{a.author ?? '-'}</td>
                      <td>{a.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {w.draftsInProgress.length > 0 && (
            <div className={styles.preview}>
              <h2>Drafts being worked on</h2>
              <table>
                <thead><tr><th>Title</th><th>Author</th><th>Last saved</th></tr></thead>
                <tbody>
                  {w.draftsInProgress.map((a) => (
                    <tr key={a.path}>
                      <td><Link to={`/admin/authoring/edit?path=${encodeURIComponent(a.path)}`}>{a.title}</Link></td>
                      <td>{a.author ?? '-'}</td>
                      <td>{a.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {data.github && w.deployBatches.length > 0 && (
            <div className={styles.preview}>
              <h2>Site updates in this period</h2>
              <table>
                <thead><tr><th>Date</th><th>New</th><th>Updated</th><th>Deleted</th><th>Images</th></tr></thead>
                <tbody>
                  {w.deployBatches.map((b) => (
                    <tr key={b.sha}>
                      <td>{b.date}</td><td>{b.created}</td><td>{b.updated}</td><td>{b.deleted}</td><td>{b.images}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function AuthoringStatsPage(): ReactNode {
  return (
    <Layout title="Authoring stats - Admin" description="Authoring activity dashboard: articles created, updated, and shipped.">
      <BrowserOnly fallback={<div className={styles.wrap}><p>Loading…</p></div>}>
        {() => <StatsPage />}
      </BrowserOnly>
    </Layout>
  );
}
