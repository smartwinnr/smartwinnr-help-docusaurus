import React, {type ReactNode} from 'react';
import {UserProvider} from '@site/src/contexts/UserContext';
import ImageLightbox from '@site/src/components/ImageLightbox';

/**
 * Docusaurus auto-uses src/theme/Root.tsx as the top-level wrapper around every page.
 * We mount UserProvider here so the swizzled sidebar items can read the current
 * user's role + org privileges via useCurrentUser().
 *
 * ImageLightbox mounts once here so click-to-zoom works on every article's
 * images (it attaches a single delegated listener; renders nothing until used).
 */
export default function Root({children}: {children: ReactNode}): ReactNode {
  return (
    <UserProvider>
      {children}
      <ImageLightbox />
    </UserProvider>
  );
}
