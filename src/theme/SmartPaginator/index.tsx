import React, {type ReactNode} from 'react';
import Link from '@docusaurus/Link';
import Translate from '@docusaurus/Translate';
import styles from './styles.module.css';

/**
 * Two-column Prev/Next paginator with support for a disabled placeholder
 * card on either side. Used in place of @theme/DocPaginator wherever a
 * gate-driven reroute may produce one missing side.
 *
 * Visual structure matches stock Infima `.pagination-nav` exactly so the
 * card frame, spacing, and dark-mode rules apply automatically. Disabled
 * cards drop the <a>, dim to 55% opacity, and announce as aria-disabled.
 *
 * Pass `previous` / `next` as:
 *   {title, permalink}  -> real card with the rerouted target
 *   undefined           -> disabled "End of help center" placeholder
 *
 * If BOTH sides are undefined the component renders null so the
 * pagination footer disappears entirely (still preferable to a single
 * empty card grid).
 */

type NavLink = {title: string; permalink: string};

type Props = {
  previous?: NavLink;
  next?: NavLink;
};

const END_LABEL = 'End of help center';

function ActiveCard({
  side,
  link,
}: {
  side: 'prev' | 'next';
  link: NavLink;
}): JSX.Element {
  const itemClass =
    side === 'next'
      ? 'pagination-nav__item pagination-nav__item--next'
      : 'pagination-nav__item';
  return (
    <div className={itemClass}>
      <Link className="pagination-nav__link" to={link.permalink}>
        <div className="pagination-nav__sublabel">
          {side === 'prev' ? (
            <Translate id="theme.docs.paginator.previous">Previous</Translate>
          ) : (
            <Translate id="theme.docs.paginator.next">Next</Translate>
          )}
        </div>
        <div className="pagination-nav__label">
          {side === 'prev' ? '« ' : ''}
          {link.title}
          {side === 'next' ? ' »' : ''}
        </div>
      </Link>
    </div>
  );
}

function DisabledCard({side}: {side: 'prev' | 'next'}): JSX.Element {
  const itemClass =
    side === 'next'
      ? 'pagination-nav__item pagination-nav__item--next'
      : 'pagination-nav__item';
  return (
    <div className={itemClass} aria-disabled="true">
      <div className={styles.disabledItem} role="presentation">
        <div className={styles.sublabel}>
          {side === 'prev' ? 'Previous' : 'Next'}
        </div>
        <div className={styles.label}>{END_LABEL}</div>
      </div>
    </div>
  );
}

export default function SmartPaginator({previous, next}: Props): ReactNode {
  if (!previous && !next) return null;
  return (
    <nav
      className="pagination-nav docusaurus-mt-lg"
      aria-label="Docs pages navigation">
      {previous ? (
        <ActiveCard side="prev" link={previous} />
      ) : (
        <DisabledCard side="prev" />
      )}
      {next ? (
        <ActiveCard side="next" link={next} />
      ) : (
        <DisabledCard side="next" />
      )}
    </nav>
  );
}
