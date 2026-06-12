/**
 * CommonJS mirror of src/access-policy.ts so server.js + Docusaurus plugins
 * (which run under Node, not the browser bundle) share one gate implementation.
 *
 * KEEP IN SYNC with src/access-policy.ts. A future build step could codegen one
 * from the other; for now we maintain the duplicate by hand and the small
 * surface area makes drift easy to spot in code review.
 */

const ALL_ROLES = [
  'user', 'manager', 'editor', 'admin', 'orgadmin', 'lamadmin', 'superadmin',
];

const ROLE_TIER = {
  user: 1,
  manager: 2,
  editor: 3,
  admin: 4,
  lamadmin: 5,
  orgadmin: 5,
  superadmin: 6,
};

const PRIVILEGE_BYPASS_ROLES = ['superadmin'];

// Match the flag in src/access-policy.ts. Flip together.
const PRIVILEGE_GATING_ENABLED = true;

const UNAUTH_USER = {
  email: '',
  displayName: null,
  roles: ['user'],
  region: null,
  orgId: null,
  orgName: null,
  privileges: [],
};

function hasMinTier(user, min) {
  const u = user || UNAUTH_USER;
  return (u.roles || []).some((r) => (ROLE_TIER[r] || 0) >= min);
}

function isAllowed(gate, user) {
  if (!gate) return true;
  const u = user || UNAUTH_USER;

  if (Array.isArray(gate.roles) && gate.roles.length > 0) {
    const hasRole = gate.roles.some((r) => (u.roles || []).includes(r));
    if (!hasRole) return false;
  }

  if (!PRIVILEGE_GATING_ENABLED) return true;

  const bypassesPrivilege = (u.roles || []).some((r) => PRIVILEGE_BYPASS_ROLES.includes(r));
  if (bypassesPrivilege) return true;

  if (gate.privilege) {
    if (!(u.privileges || []).includes(gate.privilege)) return false;
  }

  if (Array.isArray(gate.allPrivileges) && gate.allPrivileges.length > 0) {
    const hasAll = gate.allPrivileges.every((p) => (u.privileges || []).includes(p));
    if (!hasAll) return false;
  }

  if (Array.isArray(gate.anyPrivilege) && gate.anyPrivilege.length > 0) {
    const hasAny = gate.anyPrivilege.some((p) => (u.privileges || []).includes(p));
    if (!hasAny) return false;
  }

  return true;
}

module.exports = {
  ALL_ROLES,
  ROLE_TIER,
  PRIVILEGE_BYPASS_ROLES,
  PRIVILEGE_GATING_ENABLED,
  UNAUTH_USER,
  hasMinTier,
  isAllowed,
};
