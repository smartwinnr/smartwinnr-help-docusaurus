/**
 * LocalStorage-backed ring buffer of the last N articles the viewer opened.
 * Read by `src/components/Landing/RecentlyViewed.tsx`; written by the
 * swizzled `src/theme/DocItem/Layout/index.tsx` on every doc-page mount.
 *
 * Shape kept intentionally small so the storage cost stays trivial.
 */

export type RecentEntry = {
  url: string;
  title: string;
  /** Module-level breadcrumb shown under the title (e.g. "Quiz · Create & Manage"). */
  crumb?: string;
  /** Milliseconds since epoch — only used for ordering and the relative label. */
  viewedAt: number;
};

const KEY = 'sw.recently-viewed';
const MAX_KEEP = 10;

/** Custom event other components listen for to know the buffer changed. */
export const RECENTS_CHANGED_EVENT = 'smartwinnr:recents-changed';

function safeStorage(): Storage | null {
  try {
    if (typeof window === 'undefined') return null;
    return window.localStorage;
  } catch {
    return null;
  }
}

export function readRecents(): RecentEntry[] {
  const store = safeStorage();
  if (!store) return [];
  try {
    const raw = store.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (e): e is RecentEntry =>
        e &&
        typeof e.url === 'string' &&
        typeof e.title === 'string' &&
        typeof e.viewedAt === 'number',
    );
  } catch {
    return [];
  }
}

export function pushRecent(entry: Omit<RecentEntry, 'viewedAt'>): void {
  const store = safeStorage();
  if (!store) return;
  const now = Date.now();
  const next: RecentEntry = {...entry, viewedAt: now};
  const existing = readRecents().filter((e) => e.url !== next.url);
  const updated = [next, ...existing].slice(0, MAX_KEEP);
  try {
    store.setItem(KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(RECENTS_CHANGED_EVENT));
  } catch {
    /* quota or serialization — silently drop */
  }
}

export function clearRecents(): void {
  const store = safeStorage();
  if (!store) return;
  try {
    store.removeItem(KEY);
    window.dispatchEvent(new CustomEvent(RECENTS_CHANGED_EVENT));
  } catch {
    /* ignore */
  }
}

/** Derive a short "Module · Sub-section" breadcrumb from a docs URL. */
export function crumbFromUrl(url: string): string | undefined {
  // Accept "/modules/quiz/create-and-manage/how-to-..." and produce
  // "Quiz · Create & Manage". Best-effort; returns undefined for non-module
  // URLs so the UI doesn't render a misleading breadcrumb.
  const m = /^\/modules\/([^/]+)(?:\/([^/]+))?/.exec(url);
  if (!m) return undefined;
  const titleize = (s: string) =>
    s.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  const mod = titleize(m[1]);
  if (!m[2] || m[2].endsWith('.html')) return mod;
  // Skip per-article URLs that aren't in a sub-folder
  const sub = titleize(m[2]).replace(/ And /g, ' & ');
  return `${mod} · ${sub}`;
}
