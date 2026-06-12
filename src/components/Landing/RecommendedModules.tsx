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
            <span style={{fontSize: 20, lineHeight: 1}}>{ICON_BY_SLUG[m.slug] ?? '📦'}</span>
            <div>
              <strong style={{display: 'block', color: m.locked ? '#9ca3af' : '#1f3d80', fontSize: 13.5}}>
                {m.label}
              </strong>
              <span style={{fontSize: 11.5, color: '#6b7280'}}>
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
  s.textContent = `
    .sw-module-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; }
    .sw-module-tile {
      background: #f7f9fc; border: 1px solid #e4e8ee; border-radius: 8px;
      padding: 12px 14px; text-decoration: none; color: inherit;
      display: flex; gap: 10px; align-items: flex-start; transition: all 0.15s ease;
    }
    .sw-module-tile:hover { border-color: #2e5cb8; background: white; text-decoration: none; color: inherit; }
    .sw-module-tile-locked { background: #f9fafb; border-style: dashed; cursor: help; }
    .sw-module-tile-locked:hover { background: #f9fafb; border-color: #d1d5db; }
  `;
  document.head.appendChild(s);
}
