import React from 'react';
import Link from '@docusaurus/Link';
import type {CurrentUser} from '@site/src/access-policy';
import {hasMinTier, ROLE_TIER} from '@site/src/access-policy';
import {PERSONAS, type Persona} from './PathContent';
import styles from './styles.module.css';

function primaryTier(user: CurrentUser): number {
  if (!user.roles || user.roles.length === 0) return 1;
  return user.roles.reduce((max, r) => Math.max(max, ROLE_TIER[r] ?? 0), 0);
}

function rank(persona: Persona, viewerTier: number): number {
  // Lower rank = appears first. Spotlight at the viewer's tier wins.
  if (persona.spotlightAtTier === viewerTier) return 0;
  // Cards aligned with the viewer's tier come next.
  if (persona.tier === viewerTier) return 1;
  // Cards the viewer can use (tier <= viewer) come next, in descending tier order.
  if (persona.tier <= viewerTier) return 100 - persona.tier;
  // Cards beyond the viewer's tier come last (only shown if we choose to hint).
  return 200 + persona.tier;
}

type Props = {
  user: CurrentUser;
  /** When true, also render persona cards above the viewer's tier as disabled
   *  cards with an "ask your admin" hint. Defaults to true for orgs that want
   *  the discoverability; flip off for the cleanest learner view. */
  hintLockedCards?: boolean;
};

export default function PersonaGrid({
  user,
  hintLockedCards = true,
}: Props): JSX.Element {
  const viewerTier = primaryTier(user);
  const visible = PERSONAS.filter((p) => hasMinTier(user, p.tier));
  const locked = hintLockedCards
    ? PERSONAS.filter((p) => !hasMinTier(user, p.tier))
    : [];
  const ordered = [
    ...visible.slice().sort((a, b) => rank(a, viewerTier) - rank(b, viewerTier)),
    ...locked,
  ];

  return (
    <section className={styles.section}>
      <h2>Pick a path</h2>
      <div className={styles.personaGrid}>
        {ordered.map((p) => {
          const isLocked = !hasMinTier(user, p.tier);
          const isSpotlight = p.spotlightAtTier === viewerTier;
          const className = [
            styles.pcard,
            isLocked && styles.disabled,
            isSpotlight && styles.spotlight,
          ]
            .filter(Boolean)
            .join(' ');
          return (
            <Link
              key={p.slug}
              to={`/path/${p.slug}/`}
              className={className}
              aria-disabled={isLocked}>
              <span className={styles.pico} aria-hidden="true">
                <p.icon size={32} strokeWidth={2} />
              </span>
              <div>
                <h3>{p.label}</h3>
                <p>{isLocked ? `Requires ${tierName(p.tier)}+. Ask your admin to unlock.` : p.blurb}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

const TIER_NAMES = ['user', 'user', 'manager', 'editor', 'admin', 'orgadmin', 'superadmin'];
function tierName(t: number): string {
  return TIER_NAMES[t] ?? 'user';
}
