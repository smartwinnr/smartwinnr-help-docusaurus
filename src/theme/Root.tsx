import React, {type ReactNode} from 'react';
import {UserProvider} from '@site/src/contexts/UserContext';

/**
 * Docusaurus auto-uses src/theme/Root.tsx as the top-level wrapper around every page.
 * We mount UserProvider here so the swizzled sidebar items can read the current
 * user's role + org privileges via useCurrentUser().
 */
export default function Root({children}: {children: ReactNode}): ReactNode {
  return <UserProvider>{children}</UserProvider>;
}
