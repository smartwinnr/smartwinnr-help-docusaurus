/**
 * Single source of truth for role + org-privilege gating.
 *
 * Used by:
 * - src/theme/DocSidebarItem/Category & Link (frontend sidebar filtering)
 * - sidebars.ts (declares customProps that reference these role/privilege keys)
 * - server.js URL guard (planned, Phase D2) — keeps frontend and backend in sync
 */

export type SmartWinnrRole =
  | 'user'
  | 'manager'
  | 'editor'
  | 'admin'
  | 'orgadmin'
  | 'lamadmin'
  | 'superadmin';

/**
 * Org privilege keys must match
 * smartwinnr_prd/modules/organizations/server/models/organizations.server.model.js
 * (the `privileges` enum). Add new keys here as new modules are documented.
 */
export type OrgPrivilege = string;

export type AccessGate = {
  /** If set, viewer must hold at least one of these roles. Omitted = no role gate. */
  roles?: SmartWinnrRole[];
  /** If set, viewer's org must have this privilege enabled. Omitted = no privilege gate. */
  privilege?: OrgPrivilege;
  /** If set, viewer's org must have at least one of these privileges enabled. */
  anyPrivilege?: OrgPrivilege[];
};

export type CurrentUser = {
  email: string;
  roles: SmartWinnrRole[];
  region: string | null;
  orgId: string | null;
  privileges: OrgPrivilege[];
};

/**
 * Pre-hydration default — assume the smallest menu (regular user, no privileges).
 * Prevents an admin-flash → snap-shrink when /api/me resolves.
 */
export const UNAUTH_USER: CurrentUser = {
  email: '',
  roles: ['user'],
  region: null,
  orgId: null,
  privileges: [],
};

/**
 * Roles that bypass org-privilege gating. Useful for internal admin walkthroughs
 * of every module regardless of which orgs have what enabled.
 */
const PRIVILEGE_BYPASS_ROLES: SmartWinnrRole[] = ['superadmin'];

export function isAllowed(gate: AccessGate | undefined, user: CurrentUser | null): boolean {
  if (!gate) return true;
  const u = user ?? UNAUTH_USER;

  if (gate.roles && gate.roles.length > 0) {
    const hasRole = gate.roles.some((r) => u.roles.includes(r));
    if (!hasRole) return false;
  }

  const bypassesPrivilege = u.roles.some((r) => PRIVILEGE_BYPASS_ROLES.includes(r));
  if (bypassesPrivilege) return true;

  if (gate.privilege) {
    if (!u.privileges.includes(gate.privilege)) return false;
  }

  if (gate.anyPrivilege && gate.anyPrivilege.length > 0) {
    const hasAny = gate.anyPrivilege.some((p) => u.privileges.includes(p));
    if (!hasAny) return false;
  }

  return true;
}
