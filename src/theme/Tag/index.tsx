import React, {type ReactNode} from 'react';
import OriginalTag from '@theme-original/Tag';
import type {Props} from '@theme/Tag';
import {useCurrentUser} from '@site/src/contexts/UserContext';

/**
 * Swizzle wrapper: strip the `count` prop when the viewer isn't a
 * superadmin. The DocTagDocListPage swizzle filters articles client-side
 * by role + privilege, so a learner seeing "quiz · 46" but only 4
 * actually-accessible articles below would be misleading. Stock styling
 * automatically flips from `.tagWithCount` to `.tagRegular` when `count`
 * is undefined.
 */
export default function Tag(props: Props): ReactNode {
  const user = useCurrentUser();
  const isSuperadmin = (user.roles || []).includes('superadmin');
  if (isSuperadmin) {
    return <OriginalTag {...props} />;
  }
  const {count: _count, ...rest} = props;
  return <OriginalTag {...rest} />;
}
