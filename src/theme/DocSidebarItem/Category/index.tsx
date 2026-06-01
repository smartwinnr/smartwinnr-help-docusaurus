import React, {type ReactNode} from 'react';
import Category from '@theme-original/DocSidebarItem/Category';
import type CategoryType from '@theme/DocSidebarItem/Category';
import type {WrapperProps} from '@docusaurus/types';
import {useCurrentUser} from '@site/src/contexts/UserContext';
import {isAllowed, type AccessGate} from '@site/src/access-policy';

type Props = WrapperProps<typeof CategoryType>;

export default function CategoryWrapper(props: Props): ReactNode {
  const user = useCurrentUser();
  const gate = (props.item?.customProps ?? undefined) as AccessGate | undefined;

  if (!isAllowed(gate, user)) {
    return null;
  }

  return <Category {...props} />;
}
