/**
 * Client-side gate lookup — fetches `/doc-gates.json` (emitted by
 * plugins/access-gate-emit.js at build time) and exposes a function that
 * decides, for any docs URL, whether the current user can access it.
 *
 * Mirrors the AND-of-all-matching-gates semantics used by server.js's
 * URL guard so client-side filtering of tag pages, search results, etc.
 * stays consistent with what the server would actually serve.
 */

import {isAllowed, type AccessGate, type CurrentUser} from '@site/src/access-policy';

export type DocGates = {
  version: number;
  prefixes: Array<{prefix: string; gate: AccessGate}>;
  exact: Record<string, AccessGate>;
};

/** All gates that apply to `url`: the exact match (if present) plus every
 *  ancestor-prefix match. Directory-permission semantics — user must satisfy
 *  every gate in the chain. */
function lookupGates(gates: DocGates, url: string): AccessGate[] {
  if (!gates) return [];
  const matched: AccessGate[] = [];
  if (gates.exact && gates.exact[url]) matched.push(gates.exact[url]);
  // `prefixes` is sorted longest-first by the emitter. Walk the list and
  // collect every prefix that's an ancestor of `url`.
  for (const {prefix, gate} of gates.prefixes) {
    if (url === prefix || url.startsWith(prefix + '/')) {
      matched.push(gate);
    }
  }
  return matched;
}

export function isUrlAllowed(
  gates: DocGates | null,
  user: CurrentUser | null,
  url: string,
): boolean {
  if (!gates) return true; // gates not loaded yet — fail open during hydration
  const chain = lookupGates(gates, url);
  for (const g of chain) {
    if (!isAllowed(g, user)) return false;
  }
  return true;
}

let cachedGates: DocGates | null = null;
let inflight: Promise<DocGates | null> | null = null;

/** Lazy-load `/doc-gates.json` once per page session. */
export async function loadDocGates(): Promise<DocGates | null> {
  if (cachedGates) return cachedGates;
  if (inflight) return inflight;
  inflight = fetch('/doc-gates.json', {credentials: 'same-origin'})
    .then((r) => (r.ok ? r.json() : null))
    .then((data: DocGates | null) => {
      cachedGates = data;
      inflight = null;
      return data;
    })
    .catch(() => {
      inflight = null;
      return null;
    });
  return inflight;
}
