/**
 * Flat sidebar walk + "next accessible doc" helper.
 *
 * Docusaurus's stock pagination is computed at BUILD time from the resolved
 * sidebar order. It cannot know which docs the current viewer can access,
 * so we walk the same resolved sidebar at RUNTIME via useDocsSidebar() and
 * use this to reroute Prev/Next past gated docs.
 *
 * - flattenSidebar(items)  -> depth-first, declaration-order list of every
 *                              destination in the sidebar (URL + label),
 *                              deduped on URL.
 * - nextAllowedUrl(...)    -> from a given URL, walks the flat list forward
 *                              (or backward) and returns the first entry
 *                              where the supplied predicate returns true.
 */

export type DocOrderItem = {url: string; title: string};

type SidebarItem = {
  type: string;
  href?: string;
  label?: string;
  items?: SidebarItem[];
  [key: string]: unknown;
};

function stripTrail(u: string): string {
  if (u.length > 1 && u.endsWith('/')) return u.slice(0, -1);
  return u;
}

export function flattenSidebar(
  sidebar: ReadonlyArray<SidebarItem>,
): DocOrderItem[] {
  const out: DocOrderItem[] = [];
  const seen = new Set<string>();
  function push(url: string, title: string) {
    const norm = stripTrail(url);
    if (seen.has(norm)) return;
    seen.add(norm);
    out.push({url: norm, title});
  }
  function visit(items: ReadonlyArray<SidebarItem>) {
    for (const it of items) {
      if (it.type === 'link' && typeof it.href === 'string') {
        push(it.href, it.label || '');
      } else if (it.type === 'category') {
        if (typeof it.href === 'string') push(it.href, it.label || '');
        if (Array.isArray(it.items)) visit(it.items as SidebarItem[]);
      }
      // 'html', 'ref', etc. - no destination of their own.
    }
  }
  visit(sidebar);
  return out;
}

export type NavLink = {title: string; permalink: string};

/**
 * Walk `order` in `direction` starting from the entry that matches
 * `fromUrl`, returning the first entry where `isAllowed(url)` is true.
 * Returns null if `fromUrl` isn't in the order or no accessible neighbor
 * exists in that direction (reader is at start/end of the help center).
 */
export function nextAllowedUrl(
  order: ReadonlyArray<DocOrderItem>,
  fromUrl: string,
  direction: 'prev' | 'next',
  isAllowed: (url: string) => boolean,
): NavLink | null {
  if (!order || order.length === 0) return null;
  const cleanFrom = stripTrail(fromUrl || '');
  const idx = order.findIndex((it) => it.url === cleanFrom);
  if (idx === -1) return null;
  const step = direction === 'next' ? 1 : -1;
  for (let i = idx + step; i >= 0 && i < order.length; i += step) {
    if (isAllowed(order[i].url)) {
      return {title: order[i].title, permalink: order[i].url};
    }
  }
  return null;
}
