import React, {useEffect, useState} from 'react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import type {CurrentUser, SmartWinnrRole} from '@site/src/access-policy';
import styles from './styles.module.css';

type Entry = {
  title: string;
  blurb?: string;
  href: string;
  date: string;
  audience: SmartWinnrRole[];
};

type Feed = {version: number; entries: Entry[]};

function relative(date: string): string {
  // Calendar-day relative formatter. We avoid Date.now() at module-load time
  // so the same server-rendered shell can hydrate without mismatch.
  const then = Date.parse(date);
  const now = Date.now();
  if (Number.isNaN(then)) return date;
  const days = Math.floor((now - then) / (1000 * 60 * 60 * 24));
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} week${days < 14 ? '' : 's'} ago`;
  if (days < 365) return `${Math.floor(days / 30)} month${days < 60 ? '' : 's'} ago`;
  return `${Math.floor(days / 365)} year${days < 730 ? '' : 's'} ago`;
}

type Props = {
  user: CurrentUser;
  /** Max items to render. Default 5. */
  limit?: number;
};

export default function WhatsNew({user, limit = 5}: Props): JSX.Element | null {
  const url = useBaseUrl('/whats-new.json');
  const [feed, setFeed] = useState<Feed | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(url, {credentials: 'same-origin'})
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (!cancelled) setFeed(data);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [url]);

  if (failed || !feed) return null;

  const userRoles = new Set(user.roles || []);
  const visible = (feed.entries || [])
    .filter((e) =>
      Array.isArray(e.audience) && e.audience.some((r) => userRoles.has(r as SmartWinnrRole)),
    )
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, limit);

  if (visible.length === 0) return null;

  return (
    <section className={styles.section}>
      <h2>
        What's new for you
        <Link className={styles.seeAll} to="/release-notes/">All release notes →</Link>
      </h2>
      <ul className={styles.entries}>
        {visible.map((e) => (
          <li key={e.date + e.title}>
            <div style={{flex: 1}}>
              <Link to={e.href}>
                <strong>{e.title}</strong>
              </Link>
              {e.blurb && <span className={styles.blurb}>{e.blurb}</span>}
            </div>
            <span style={{
              color: 'var(--ifm-color-content-secondary)',
              fontSize: 'var(--text-caption)',
              fontVariantNumeric: 'tabular-nums',
              whiteSpace: 'nowrap',
            }}>
              {relative(e.date)}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
