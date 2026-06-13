import React, {createContext, useContext, useEffect, useState, type ReactNode} from 'react';
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';
import type {CurrentUser} from '@site/src/access-policy';
import {UNAUTH_USER} from '@site/src/access-policy';

type UserContextValue = {
  user: CurrentUser;
  loading: boolean;
  /** True once /api/me has resolved (success or failure). */
  resolved: boolean;
};

const UserContext = createContext<UserContextValue>({
  user: UNAUTH_USER,
  loading: true,
  resolved: false,
});

export function UserProvider({children}: {children: ReactNode}) {
  const [user, setUser] = useState<CurrentUser>(UNAUTH_USER);
  const [loading, setLoading] = useState(true);
  const [resolved, setResolved] = useState(false);

  useEffect(() => {
    if (!ExecutionEnvironment.canUseDOM) {
      return;
    }
    let cancelled = false;

    fetch('/api/me', {credentials: 'same-origin', headers: {Accept: 'application/json'}})
      .then(async (res) => {
        if (res.status === 401) {
          // Cookie missing/expired - bounce to login, preserving where we were.
          const redirect = encodeURIComponent(window.location.pathname + window.location.search);
          window.location.href = `/auth/login?redirect=${redirect}`;
          return null;
        }
        if (!res.ok) return null;
        return res.json();
      })
      .then((data) => {
        if (cancelled || !data) {
          if (!cancelled) {
            setLoading(false);
            setResolved(true);
          }
          return;
        }
        setUser({
          email: data.email ?? '',
          displayName: data.displayName ?? null,
          roles: Array.isArray(data.roles) ? data.roles : [],
          region: data.region ?? null,
          orgId: data.orgId ?? null,
          orgName: data.orgName ?? null,
          privileges: Array.isArray(data.privileges) ? data.privileges : [],
        });
        setLoading(false);
        setResolved(true);
      })
      .catch(() => {
        if (!cancelled) {
          setLoading(false);
          setResolved(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <UserContext.Provider value={{user, loading, resolved}}>{children}</UserContext.Provider>
  );
}

export function useCurrentUser(): CurrentUser {
  return useContext(UserContext).user;
}

export function useUserState(): UserContextValue {
  return useContext(UserContext);
}

/**
 * True once /api/me has resolved (success or failure) AND we are no longer
 * loading - i.e. role/privilege branches are safe to evaluate against the
 * REAL user instead of the UNAUTH_USER learner-default. Use this to gate
 * role-conditional renders so SSG and the initial hydration both show a
 * neutral skeleton, then snap to the personalized view exactly once.
 */
export function useIsUserReady(): boolean {
  const {loading, resolved} = useContext(UserContext);
  return !loading && resolved;
}
