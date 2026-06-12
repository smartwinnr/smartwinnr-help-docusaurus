import React from 'react';
import type {CurrentUser, SmartWinnrRole} from '@site/src/access-policy';
import {ROLE_TIER} from '@site/src/access-policy';
import styles from './styles.module.css';

const TIER_LABEL: Record<number, string> = {
  1: 'learner',
  2: 'manager',
  3: 'editor',
  4: 'admin',
  5: 'orgadmin',
  6: 'superadmin',
};

function primaryTierLabel(roles: SmartWinnrRole[]): string {
  if (!roles || roles.length === 0) return 'learner';
  const highest = roles.reduce(
    (max, r) => Math.max(max, ROLE_TIER[r] ?? 0),
    0,
  );
  return TIER_LABEL[highest] ?? 'learner';
}

function openChatbot(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('smartwinnr:open-chatbot'));
}

function greeting(user: CurrentUser, loading: boolean): string {
  if (loading) return 'Welcome to SmartWinnr Help';
  // Prefer the display name from the User collection; fall back to the
  // first word of the email local-part for legacy tokens that don't carry it.
  const first = displayFirstName(user);
  if (!first) return 'Welcome — what would you like to do today?';
  return `Hi ${first} — what would you like to do today?`;
}

function displayFirstName(user: CurrentUser): string {
  const display = (user.displayName || '').trim();
  if (display) return display.split(/\s+/)[0];
  const local = (user.email || '').split('@')[0];
  return local
    .replace(/[._-].*$/, '')
    .replace(/^\w/, (c) => c.toUpperCase());
}

type Props = {
  user: CurrentUser;
  loading: boolean;
};

export default function Hero({user, loading}: Props): JSX.Element {
  const label = primaryTierLabel(user.roles);
  return (
    <section className={styles.hero}>
      <div className={styles.meta}>
        <span className={styles.rolePill}>{label}</span>
      </div>
      <h1>{greeting(user, loading)}</h1>
      <div className={styles.ctaRow}>
        <button
          type="button"
          className={`${styles.cta} ${styles.ctaPrimary}`}
          onClick={openChatbot}>
          💬 Open the help bot
        </button>
        <a className={styles.cta} href="/modules/">
          📚 Browse modules
        </a>
      </div>
    </section>
  );
}
