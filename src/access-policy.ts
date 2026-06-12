/**
 * Single source of truth for role + org-privilege gating.
 *
 * Used by:
 * - src/theme/DocSidebarItem/Category & Link (frontend sidebar filtering)
 * - sidebars.ts (declares customProps that reference these role/privilege keys)
 * - server.js URL guard (planned, Phase D2) - keeps frontend and backend in sync
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
  /**
   * If set, viewer's org must have ALL of these privileges enabled (AND).
   * Used by `for-managers/` sub-folders to require BOTH `managerView` (in
   * `privilege`) AND the parent module's privilege (e.g. `quiz`) - a single
   * `privilege` field can't AND two values together.
   */
  allPrivileges?: OrgPrivilege[];
  /** If set, viewer's org must have at least one of these privileges enabled. */
  anyPrivilege?: OrgPrivilege[];
};

export type CurrentUser = {
  email: string;
  /** User.displayName from the main app's User collection. May be null for
   *  legacy tokens issued before the field was added. */
  displayName: string | null;
  roles: SmartWinnrRole[];
  region: string | null;
  orgId: string | null;
  /** Organization.name from the main app's Organization collection. */
  orgName: string | null;
  privileges: OrgPrivilege[];
};

/**
 * Pre-hydration default - assume the smallest menu (regular user, no privileges).
 * Prevents an admin-flash → snap-shrink when /api/me resolves.
 */
export const UNAUTH_USER: CurrentUser = {
  email: '',
  displayName: null,
  roles: ['user'],
  region: null,
  orgId: null,
  orgName: null,
  privileges: [],
};

/**
 * Roles that bypass org-privilege gating. Useful for internal admin walkthroughs
 * of every module regardless of which orgs have what enabled.
 */
const PRIVILEGE_BYPASS_ROLES: SmartWinnrRole[] = ['superadmin'];

/**
 * Org-privilege gating is currently disabled - every signed-in user sees every
 * category their role allows, regardless of their org's `privileges` array.
 * Role gating is unaffected (admin-only sections still hide from regular users).
 *
 * `customProps.privilege` / `customProps.anyPrivilege` annotations remain on
 * sidebar items and `_category_.json` files, so re-enabling is a single-line
 * flip back to `true` - no data migration needed.
 */
export const PRIVILEGE_GATING_ENABLED = true;

/**
 * Documentation visibility tiers (T1 → T6). See plans/help-menu-redesign.md.
 * `lamadmin` maps onto the orgadmin tier (T5).
 *
 * Use `hasMinTier(user, n)` in shared utilities (top-nav, landing) where a tier
 * threshold is cleaner than enumerating six roles. The fine-grained
 * `customProps.roles` array on sidebar items continues to be the authoritative
 * gate - `hasMinTier` is a convenience derived from the same data.
 */
export const ROLE_TIER: Record<SmartWinnrRole, number> = {
  user: 1,
  manager: 2,
  editor: 3,
  admin: 4,
  lamadmin: 5,
  orgadmin: 5,
  superadmin: 6,
};

/** Returns true if the user holds at least one role at or above the given tier. */
export function hasMinTier(user: CurrentUser | null, min: number): boolean {
  const u = user ?? UNAUTH_USER;
  return u.roles.some((r) => (ROLE_TIER[r] ?? 0) >= min);
}

export function isAllowed(gate: AccessGate | undefined, user: CurrentUser | null): boolean {
  if (!gate) return true;
  const u = user ?? UNAUTH_USER;

  // Role gating - always on.
  if (gate.roles && gate.roles.length > 0) {
    const hasRole = gate.roles.some((r) => u.roles.includes(r));
    if (!hasRole) return false;
  }

  // Privilege gating - skipped when disabled.
  if (!PRIVILEGE_GATING_ENABLED) return true;

  const bypassesPrivilege = u.roles.some((r) => PRIVILEGE_BYPASS_ROLES.includes(r));
  if (bypassesPrivilege) return true;

  if (gate.privilege) {
    if (!u.privileges.includes(gate.privilege)) return false;
  }

  if (gate.allPrivileges && gate.allPrivileges.length > 0) {
    const hasAll = gate.allPrivileges.every((p) => u.privileges.includes(p));
    if (!hasAll) return false;
  }

  if (gate.anyPrivilege && gate.anyPrivilege.length > 0) {
    const hasAny = gate.anyPrivilege.some((p) => u.privileges.includes(p));
    if (!hasAny) return false;
  }

  return true;
}
