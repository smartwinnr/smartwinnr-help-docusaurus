import React, {useEffect, useState} from 'react';
import Link from '@docusaurus/Link';
import {
  RECENTS_CHANGED_EVENT,
  clearRecents,
  readRecents,
  type RecentEntry,
} from '@site/src/lib/recently-viewed';
import styles from './styles.module.css';

const RENDER_COUNT = 5;

function relative(ms: number): string {
  const diff = Date.now() - ms;
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} week${days < 14 ? '' : 's'} ago`;
  return `${Math.floor(days / 30)} month${days < 60 ? '' : 's'} ago`;
}

export default function RecentlyViewed(): JSX.Element | null {
  const [entries, setEntries] = useState<RecentEntry[]>([]);

  useEffect(() => {
    const refresh = () => setEntries(readRecents());
    refresh();
    window.addEventListener(RECENTS_CHANGED_EVENT, refresh);
    // Also re-read when the tab regains focus, in case another tab updated it.
    window.addEventListener('focus', refresh);
    return () => {
      window.removeEventListener(RECENTS_CHANGED_EVENT, refresh);
      window.removeEventListener('focus', refresh);
    };
  }, []);

  if (entries.length === 0) return null;

  const visible = entries.slice(0, RENDER_COUNT);
  return (
    <section className={styles.section}>
      <h2>
        Pick up where you left off
        <button
          type="button"
          className={styles.seeAll}
          onClick={clearRecents}
          style={{background: 'none', border: 'none', cursor: 'pointer', font: 'inherit'}}>
          Forget recents
        </button>
      </h2>
      <ul className={styles.entries}>
        {visible.map((e) => (
          <li key={e.url}>
            <div style={{flex: 1}}>
              <Link to={e.url}>
                <strong>{e.title}</strong>
              </Link>
              {e.crumb && <span className={styles.blurb}>{e.crumb}</span>}
            </div>
            <span style={{color: 'var(--ifm-color-emphasis-700)', fontSize: 11, whiteSpace: 'nowrap'}}>
              {relative(e.viewedAt)}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
