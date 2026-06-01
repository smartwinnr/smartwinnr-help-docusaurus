import React, {type ReactNode} from 'react';
import Link from '@theme-original/DocSidebarItem/Link';
import type LinkType from '@theme/DocSidebarItem/Link';
import type {WrapperProps} from '@docusaurus/types';
import {useCurrentUser} from '@site/src/contexts/UserContext';
import {isAllowed, type AccessGate} from '@site/src/access-policy';

type Props = WrapperProps<typeof LinkType>;

export default function LinkWrapper(props: Props): ReactNode {
  const user = useCurrentUser();
  const gate = (props.item?.customProps ?? undefined) as AccessGate | undefined;

  if (!isAllowed(gate, user)) {
    return null;
  }

  return <Link {...props} />;
}
