import React from 'react';
import Link from '@docusaurus/Link';
import {Lock} from 'lucide-react';
import type {CurrentUser} from '@site/src/access-policy';
import {ROLE_TIER, hasMinTier} from '@site/src/access-policy';
import {PERSONAS, canEnterPersona, type Persona} from './PathContent';
import styles from './styles.module.css';

/**
 * Option C - the persona-led "door" landing hero. Replaces the older
 * <Hero /> + <PersonaGrid /> combo on the homepage.
 *
 * Five doors render (Learner / Manager / Author / Admin / Help) - sourced
 * from PERSONAS, filtered by `hiddenFromDoors`. Doors a viewer's role
 * can't enter render as locked. The door matching the viewer's primary
 * tier is spotlighted with a "Your primary lens" badge.
 */

type Props = {
  user: CurrentUser;
  loading: boolean;
};

function greeting(user: CurrentUser, loading: boolean): string {
  if (loading) return 'Welcome to SmartWinnr Help';
  const display = (user.displayName || '').trim().split(/\s+/)[0];
  if (display) return `Hi ${display} - pick the lens you want to use today`;
  const local = (user.email || '').split('@')[0];
  const first = local
    .replace(/[._-].*$/, '')
    .replace(/^\w/, (c) => c.toUpperCase());
  if (first) return `Hi ${first} - pick the lens you want to use today`;
  return 'Welcome - pick the lens you want to use today';
}

function primaryTier(user: CurrentUser): number {
  if (!user.roles || user.roles.length === 0) return 1;
  return user.roles.reduce((max, r) => Math.max(max, ROLE_TIER[r] ?? 0), 0);
}

const TIER_NAMES = ['user', 'user', 'manager', 'editor', 'admin', 'orgadmin', 'superadmin'];
function tierName(t: number): string {
  return TIER_NAMES[t] ?? 'user';
}

function rank(persona: Persona, viewerTier: number): number {
  // Lower rank = appears first. Spotlight at the viewer's tier wins.
  if (persona.spotlightAtTier === viewerTier) return 0;
  if (persona.tier === viewerTier) return 1;
  if (persona.tier <= viewerTier) return 100 - persona.tier;
  return 200 + persona.tier;
}

export default function PersonaDoors({user, loading}: Props): JSX.Element {
  const visibleDoors = PERSONAS.filter((p) => !p.hiddenFromDoors);
  // Spotlight matches `p.spotlightAtTier === viewerTier`. Roles above the
  // highest visible spotlight (today: admin = 4; superadmin sits at 6 and
  // would otherwise match no door) inherit the top visible persona's
  // spotlight. Computed dynamically so persona reshuffles (e.g. promoting
  // integrations back to a visible door at 5) don't regress this.
  const maxVisibleSpotlight = visibleDoors.reduce(
    (m, p) => Math.max(m, p.spotlightAtTier ?? 0),
    0,
  );
  const viewerTier = Math.min(primaryTier(user), maxVisibleSpotlight || 1);
  const ordered = [...visibleDoors].sort(
    (a, b) => rank(a, viewerTier) - rank(b, viewerTier),
  );

  return (
    <section className={styles.doorsHero}>
      <div className={styles.eyebrow}>Welcome</div>
      <h1>{greeting(user, loading)}</h1>
      <p className={styles.doorsSub}>
        Each door surfaces the docs that matter for that lens. Doors are pure
        navigation - pick freely, switch any time.
      </p>

      <div className={styles.doorGrid}>
        {ordered.map((p) => {
          const accessible = canEnterPersona(user, p);
          const spotlight = p.spotlightAtTier === viewerTier;
          const className = [
            styles.door,
            spotlight && styles.doorSpotlight,
            !accessible && styles.doorLocked,
          ]
            .filter(Boolean)
            .join(' ');

          if (!accessible) {
            // Distinguish role-tier lockout from privilege lockout: a manager
            // who lacks `managerView` should be told it's a privilege issue,
            // not a "need a higher role" issue.
            const lockedByPrivilege = hasMinTier(user, p.tier) && !!p.privilege;
            const reason = lockedByPrivilege
              ? `Needs the ${p.privilege} privilege. Ask your admin to enable it.`
              : `Requires ${tierName(p.tier)}+. Ask your admin to unlock.`;
            return (
              <div key={p.slug} className={className} aria-disabled="true">
                <span className={styles.doorIco} aria-hidden="true">
                  <p.icon size={32} strokeWidth={2} />
                </span>
                <h3>{p.label}</h3>
                <p>{reason}</p>
                <span className={styles.doorEnter}>
                  Locked
                  <Lock size={12} strokeWidth={2} style={{marginLeft: 4}} aria-hidden="true" />
                </span>
              </div>
            );
          }

          return (
            <Link key={p.slug} to={`/path/${p.slug}/`} className={className}>
              <span className={styles.doorIco} aria-hidden="true">
                <p.icon size={32} strokeWidth={2} />
              </span>
              <h3>{p.label}</h3>
              <p>{p.blurb}</p>
              <span className={styles.doorEnter}>Enter {p.slug}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
