/**
 * Single source of truth for the role arrays used to gate documentation surface.
 * Imported by sidebars.ts, the swizzled Navbar, src/pages/index.tsx, etc. — keep
 * this in one place so a role-tier change cannot drift between menu definition
 * and runtime gate evaluation.
 *
 * The 6-tier model (T1 → T6) is documented in plans/help-menu-redesign.md.
 * `lamadmin` is treated as orgadmin-equivalent (T5).
 */

import type {SmartWinnrRole} from './access-policy';

export const ALL_ROLES: SmartWinnrRole[] = [
  'user', 'manager', 'editor', 'admin', 'orgadmin', 'lamadmin', 'superadmin',
];

export const MANAGER_PLUS_ROLES: SmartWinnrRole[] = [
  'manager', 'editor', 'admin', 'orgadmin', 'lamadmin', 'superadmin',
];

export const EDITOR_PLUS_ROLES: SmartWinnrRole[] = [
  'editor', 'admin', 'orgadmin', 'lamadmin', 'superadmin',
];

/** Alias of EDITOR_PLUS_ROLES kept for legacy sidebar entries. */
export const STAFF_ROLES = EDITOR_PLUS_ROLES;

export const ADMIN_PLUS_ROLES: SmartWinnrRole[] = [
  'admin', 'orgadmin', 'lamadmin', 'superadmin',
];

/** Alias of ADMIN_PLUS_ROLES kept for legacy sidebar entries. */
export const ADMIN_ONLY_ROLES = ADMIN_PLUS_ROLES;

export const ORGADMIN_PLUS_ROLES: SmartWinnrRole[] = [
  'orgadmin', 'lamadmin', 'superadmin',
];

export const SUPERADMIN_ROLES: SmartWinnrRole[] = ['superadmin'];
