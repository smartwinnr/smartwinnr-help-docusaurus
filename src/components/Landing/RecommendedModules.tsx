import React, {useEffect, useState} from 'react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import type {CurrentUser} from '@site/src/access-policy';
import {ROLE_TIER} from '@site/src/access-policy';
import styles from './styles.module.css';

type ModuleEntry = {
  slug: string;
  label: string;
  privilege: string | null;
  anyPrivilege: string[] | null;
  hasLearner: boolean;
  hasManager: boolean;
  hasEditor: boolean;
  hasFaqs: boolean;
  url: string;
};

type Manifest = {version: number; modules: ModuleEntry[]};

const ICON_BY_SLUG: Record<string, string> = {
  quiz: '📝', smartpath: '🛤', smartfeed: '📺',
  'video-coaching': '🎥', 'ai-coaching': '🤖', 'field-coaching': '🚗',
  survey: '📋', 'knowledge-hub': '📚', forms: '🧾',
  'kpi-gamification': '🏆', notifications: '🔔',
  'cross-module': '🧩',
};

function hasOrgPrivilege(user: CurrentUser, m: ModuleEntry): boolean {
  const privs = user.privileges || [];
  if (m.privilege) return privs.includes(m.privilege);
  if (m.anyPrivilege && m.anyPrivilege.length > 0) {
    return m.anyPrivilege.some((p) => privs.includes(p));
  }
  return true; // no privilege required
}

function primaryTier(user: CurrentUser): number {
  if (!user.roles || user.roles.length === 0) return 1;
  return user.roles.reduce((max, r) => Math.max(max, ROLE_TIER[r] ?? 0), 0);
}

/** Returns true if the viewer's role can see at least one sub-folder of this module. */
function moduleHasContentForRole(user: CurrentUser, m: ModuleEntry): boolean {
  const tier = primaryTier(user);
  if (tier >= 3) return true; // editor+ sees everything regardless
  if (tier >= 2) return m.hasLearner || m.hasManager || m.hasFaqs;
  return m.hasLearner || m.hasFaqs;
}

type Props = {
  user: CurrentUser;
};

export default function RecommendedModules({user}: Props): JSX.Element | null {
  const manifestUrl = useBaseUrl('/landing-modules.json');
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(manifestUrl, {credentials: 'same-origin'})
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (!cancelled) setManifest(data);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [manifestUrl]);

  if (failed || !manifest) return null;

  const visible: Array<ModuleEntry & {locked: boolean}> = [];
  for (const m of manifest.modules) {
    if (!moduleHasContentForRole(user, m)) continue;
    visible.push({...m, locked: !hasOrgPrivilege(user, m)});
  }

  if (visible.length === 0) return null;

  return (
    <section className={styles.section}>
      <h2>
        Recommended modules
        <Link className={styles.seeAll} to="/modules/">All modules →</Link>
      </h2>
      <div className={moduleGridStyle}>
        {visible.map((m) => (
          <Link
            key={m.slug}
            // Locked tiles now route to the module's universal index page,
            // which renders the privilege-aware upsell from ModuleOverview.
            to={m.url}
            className={`${moduleTileStyle} ${m.locked ? moduleTileLockedStyle : ''}`}
            title={m.locked
              ? `Your org has not enabled ${m.privilege || 'this module'} — click to learn more.`
              : m.label}>
            <span className="sw-module-ico">{ICON_BY_SLUG[m.slug] ?? '📦'}</span>
            <div>
              <strong className={m.locked ? 'sw-module-title sw-module-title-locked' : 'sw-module-title'}>
                {m.label}
              </strong>
              <span className="sw-module-desc">
                {m.locked ? 'Ask your admin to enable' : describeRole(user, m)}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function describeRole(user: CurrentUser, m: ModuleEntry): string {
  const tier = primaryTier(user);
  if (tier >= 3) return 'Full authoring + reports';
  if (tier >= 2) {
    if (m.hasManager) return 'Team view + consume';
    return 'Consume + FAQs';
  }
  return m.hasLearner ? 'How to use' : 'FAQs';
}

// Inline styles so this component doesn't need a separate CSS module — keeps the
// landing surface contained while we iterate.
const moduleGridStyle: string = 'sw-module-grid';
const moduleTileStyle: string = 'sw-module-tile';
const moduleTileLockedStyle: string = 'sw-module-tile-locked';

if (typeof document !== 'undefined' && !document.getElementById('sw-module-strip-style')) {
  const s = document.createElement('style');
  s.id = 'sw-module-strip-style';
  // All sizes / colors via tokens — see plan §14.
  s.textContent = `
    .sw-module-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: var(--space-2);
    }
    .sw-module-tile {
      background: var(--ifm-color-emphasis-100);
      border: 1px solid var(--ifm-color-emphasis-200);
      border-radius: 8px;
      padding: var(--space-3) var(--space-3);
      text-decoration: none;
      color: inherit;
      display: flex;
      gap: var(--space-2);
      align-items: flex-start;
      transition: border-color 0.15s ease, background-color 0.15s ease;
    }
    .sw-module-tile:hover {
      border-color: var(--ifm-color-primary);
      background: var(--ifm-background-color);
      text-decoration: none;
      color: inherit;
    }
    .sw-module-tile-locked {
      background: var(--ifm-color-emphasis-100);
      border-style: dashed;
      cursor: help;
    }
    .sw-module-tile-locked:hover {
      background: var(--ifm-color-emphasis-100);
      border-color: var(--ifm-color-emphasis-300);
    }
    .sw-module-ico { font-size: 20px; line-height: 1; }
    .sw-module-title {
      display: block;
      color: var(--ifm-heading-color);
      font-size: var(--text-body-sm);
      line-height: var(--lh-body-sm);
      font-weight: var(--fw-semibold);
    }
    .sw-module-title-locked { color: var(--ifm-color-content-secondary); }
    .sw-module-desc {
      font-size: var(--text-caption);
      line-height: var(--lh-caption);
      color: var(--ifm-color-content-secondary);
    }
  `;
  document.head.appendChild(s);
}
