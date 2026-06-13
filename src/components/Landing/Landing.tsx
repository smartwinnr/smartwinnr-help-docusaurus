import React from 'react';
import {useCurrentUser, useIsUserReady} from '@site/src/contexts/UserContext';
import BrowserOnly from '@docusaurus/BrowserOnly';
import PersonaDoors from './PersonaDoors';
import RecommendedModules from './RecommendedModules';
import WhatsNew from './WhatsNew';
import RecentlyViewed from './RecentlyViewed';
import HelpFooter from './HelpFooter';
import styles from './styles.module.css';

/**
 * Presenter for the personalized homepage. Embedded inside docs/index.mdx
 * so MDX provides the docs layout chrome around it.
 *
 * Option C - Persona-led "door" landing. The PersonaDoors hero replaces the
 * older Hero + PersonaGrid combo: a 5-door grid (Learner / Manager / Author
 * / Admin / Help) takes over the visual entry, then the rest of the
 * landing (recommended modules, what's new, recently viewed, help footer)
 * sits below as a browse surface for users who don't want to pick a door.
 *
 * Both SSG and the initial client render before /api/me resolves show the
 * same Skeleton - role-conditional content only renders once the real user
 * is in hand. Prevents the "learner lens flashes then snaps to superadmin"
 * flicker.
 */

function Skeleton(): JSX.Element {
  return (
    <div className={styles.wrap}>
      <div className={styles.skelHero} aria-hidden="true" />
      <div className={styles.skelDoorsGrid} aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className={styles.skelDoor} />
        ))}
      </div>
      <HelpFooter />
    </div>
  );
}

function Inner(): JSX.Element {
  const ready = useIsUserReady();
  const user = useCurrentUser();
  if (!ready) return <Skeleton />;
  return (
    <div className={styles.wrap}>
      <PersonaDoors user={user} loading={false} />
      <RecommendedModules user={user} />
      <WhatsNew user={user} />
      <RecentlyViewed />
      <HelpFooter />
    </div>
  );
}

export default function Landing(): JSX.Element {
  return (
    <BrowserOnly fallback={<Skeleton />}>
      {() => <Inner />}
    </BrowserOnly>
  );
}
