import React, {useEffect, useState} from 'react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import BrowserOnly from '@docusaurus/BrowserOnly';
import {useCurrentUser} from '@site/src/contexts/UserContext';
import {hasMinTier, PRIVILEGE_GATING_ENABLED} from '@site/src/access-policy';
import type {CurrentUser} from '@site/src/access-policy';
import styles from './styles.module.css';

/**
 * Universal per-module landing. Mounted from `docs/modules/<m>/index.md`.
 *
 *  - Renders the module's name, tagline, description, and audience — ALWAYS.
 *  - If the viewer's org has the privilege, shows "Get started" cards linking
 *    into sub-sections appropriate to the viewer's role (audience leaves +
 *    authoring leaves for editor+).
 *  - If the viewer's org lacks the privilege, shows an upsell block with key
 *    features and a "Talk to your admin" CTA.
 */

type ModuleMeta = {
  label: string;
  tagline: string;
  description: string;
  keyFeatures: string[];
  who: string;
  privilege?: string;
  anyPrivilege?: string[];
  ctaEmail?: string;
};

type Manifest = {version: number; modules: Record<string, ModuleMeta>};

type Props = {
  slug: string;
};

const CARD_ICONS: Record<string, string> = {
  'for-learners': '🎓',
  'for-managers': '📋',
  'create-and-manage': '🛠',
  'assign-and-schedule': '📤',
  'features': '🧩',
  'reports-and-analytics': '📊',
  'settings-and-permissions': '⚙️',
  'best-practices': '💡',
  'faqs-and-troubleshooting': '🛟',
  'overview': '📘',
  'quickstart': '🚀',
};

const CARD_TITLES: Record<string, string> = {
  'for-learners': 'For Learners',
  'for-managers': 'For Managers',
  'create-and-manage': 'Create & Manage',
  'assign-and-schedule': 'Assign & Schedule',
  'features': 'Features',
  'reports-and-analytics': 'Reports & Analytics',
  'settings-and-permissions': 'Settings & Permissions',
  'best-practices': 'Best Practices',
  'faqs-and-troubleshooting': 'FAQs & Troubleshooting',
  'overview': 'Overview',
  'quickstart': 'Quickstart',
};

const CARD_BLURBS: Record<string, string> = {
  'for-learners': 'How to use this module day-to-day.',
  'for-managers': 'Review reportees and read team analytics.',
  'create-and-manage': 'Authoring CRUD — create, edit, duplicate, archive.',
  'assign-and-schedule': 'Distribute to users, groups, and metatags.',
  'features': 'Feature-by-feature reference.',
  'reports-and-analytics': 'Admin-level reports and dashboards.',
  'settings-and-permissions': 'Configuration and access controls.',
  'best-practices': 'What good looks like.',
  'faqs-and-troubleshooting': 'Common questions and error codes.',
};

/* What sub-sections to surface as cards based on viewer's tier + privileges.
 * Ordered left-to-right, top-to-bottom. `for-managers` requires both manager
 * tier AND the `managerView` privilege (mirrors the dual gate baked into the
 * sub-folder's _category_.json — see plan §13.8). */
function cardsForViewer(tier: number, hasManagerView: boolean): string[] {
  const managerCard = hasManagerView ? ['for-managers'] : [];
  if (tier >= 3) {
    // editor and above
    return [
      'for-learners',
      ...managerCard,
      'create-and-manage',
      'assign-and-schedule',
      'features',
      'reports-and-analytics',
      'settings-and-permissions',
      'faqs-and-troubleshooting',
    ];
  }
  if (tier >= 2) {
    // manager
    return ['for-learners', ...managerCard, 'faqs-and-troubleshooting'];
  }
  // user
  return ['for-learners', 'faqs-and-troubleshooting'];
}

/* Does the viewer hold the `managerView` privilege? Superadmin bypasses, and
 * when privilege gating is off we treat everyone as having it (so the card
 * stays visible while the global gate is disabled). */
function hasManagerView(user: CurrentUser): boolean {
  if (!PRIVILEGE_GATING_ENABLED) return true;
  if ((user.roles || []).includes('superadmin')) return true;
  return (user.privileges || []).includes('managerView');
}

function hasPrivilege(meta: ModuleMeta, privileges: string[]): boolean {
  if (!meta.privilege && (!meta.anyPrivilege || meta.anyPrivilege.length === 0)) {
    return true; // no privilege required (e.g. cross-module)
  }
  if (meta.privilege && privileges.includes(meta.privilege)) return true;
  if (meta.anyPrivilege && meta.anyPrivilege.some((p) => privileges.includes(p))) return true;
  return false;
}

function primaryTier(roles: string[]): number {
  const TIER: Record<string, number> = {
    user: 1, manager: 2, editor: 3, admin: 4, lamadmin: 5, orgadmin: 5, superadmin: 6,
  };
  if (!roles || roles.length === 0) return 1;
  return roles.reduce((max, r) => Math.max(max, TIER[r] ?? 0), 0);
}

function UpsellBlock({slug, meta}: {slug: string; meta: ModuleMeta}) {
  const email = meta.ctaEmail || 'admin@your-org.com';
  const subject = encodeURIComponent(`Please enable "${meta.label}" in SmartWinnr`);
  const body = encodeURIComponent(
    `Hi,\n\nI was reading about ${meta.label} in our SmartWinnr help center ` +
      `and would like to use it. Could you enable it for our organization?\n\n` +
      `What it does:\n${meta.tagline}\n\nThanks!`,
  );
  return (
    <div className={styles.upsell}>
      <span className={styles.badge}>Not yet enabled for your organization</span>
      <h2>What you'd get with {meta.label}</h2>
      <p className={styles.lede}>{meta.description}</p>
      <ul className={styles.featureList}>
        {meta.keyFeatures.map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>
      <div className={styles.ctaRow}>
        <a className={styles.cta} href={`mailto:${email}?subject=${subject}&body=${body}`}>
          ✉️ Talk to your admin
        </a>
        <Link className={styles.ctaSecondary} to="/modules/">
          Browse other modules
        </Link>
      </div>
    </div>
  );
}

function GetStartedCards({
  slug,
  tier,
  managerViewOk,
}: {
  slug: string;
  tier: number;
  managerViewOk: boolean;
}) {
  const baseUrl = useBaseUrl(`/modules/${slug}/`);
  return (
    <section className={styles.section}>
      <h2>Get started</h2>
      <div className={styles.cardGrid}>
        {cardsForViewer(tier, managerViewOk).map((sub) => (
          <Link key={sub} to={`${baseUrl}${sub}/`} className={styles.card}>
            <span className={styles.ico}>{CARD_ICONS[sub] ?? '📄'}</span>
            <h3>{CARD_TITLES[sub] ?? sub}</h3>
            <p>{CARD_BLURBS[sub] ?? ''}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

function Body({slug}: Props): JSX.Element | null {
  const url = useBaseUrl('/module-overviews.json');
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [failed, setFailed] = useState(false);
  const user = useCurrentUser();

  useEffect(() => {
    let cancelled = false;
    fetch(url, {credentials: 'same-origin'})
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
  }, [url]);

  if (failed) return <p>This module overview is unavailable. Please refresh.</p>;
  if (!manifest) return null;

  const meta = manifest.modules?.[slug];
  if (!meta) {
    return (
      <div className={styles.wrap}>
        <div className={styles.hero}>
          <h1>Module not found</h1>
          <p className={styles.tagline}>No metadata for module "{slug}".</p>
        </div>
      </div>
    );
  }

  const tier = primaryTier(user.roles || []);
  const orgHasIt = hasPrivilege(meta, user.privileges || []);
  const managerViewOk = hasManagerView(user);

  return (
    <div className={styles.wrap}>
      <div className={styles.hero}>
        <h1>{meta.label}</h1>
        <p className={styles.tagline}>{meta.tagline}</p>
      </div>
      <p className={styles.description}>{meta.description}</p>
      <span className={styles.audience}>{meta.who}</span>
      {orgHasIt ? (
        <GetStartedCards slug={slug} tier={tier} managerViewOk={managerViewOk} />
      ) : (
        <UpsellBlock slug={slug} meta={meta} />
      )}
    </div>
  );
}

export default function ModuleOverview({slug}: Props): JSX.Element {
  return (
    <BrowserOnly fallback={<Body slug={slug} />}>
      {() => <Body slug={slug} />}
    </BrowserOnly>
  );
}
