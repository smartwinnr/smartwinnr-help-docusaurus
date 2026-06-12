import React from 'react';
import {UNAUTH_USER} from '@site/src/access-policy';
import {useCurrentUser, useUserState} from '@site/src/contexts/UserContext';
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
 * Option C — Persona-led "door" landing. The PersonaDoors hero replaces the
 * older Hero + PersonaGrid combo: a 5-door grid (Learner / Manager / Author
 * / Admin / Help) takes over the visual entry, then the rest of the
 * landing (recommended modules, what's new, recently viewed, help footer)
 * sits below as a browse surface for users who don't want to pick a door.
 */

function Inner(): JSX.Element {
  const user = useCurrentUser();
  const {loading} = useUserState();
  return (
    <div className={styles.wrap}>
      <PersonaDoors user={user} loading={loading} />
      <RecommendedModules user={user} />
      <WhatsNew user={user} />
      <RecentlyViewed />
      <HelpFooter />
    </div>
  );
}

function Fallback(): JSX.Element {
  return (
    <div className={styles.wrap}>
      <PersonaDoors user={UNAUTH_USER} loading={true} />
      <HelpFooter />
    </div>
  );
}

export default function Landing(): JSX.Element {
  return (
    <BrowserOnly fallback={<Fallback />}>
      {() => <Inner />}
    </BrowserOnly>
  );
}
