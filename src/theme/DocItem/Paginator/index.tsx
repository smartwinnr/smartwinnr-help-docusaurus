import React, {useEffect, useMemo, useState, type ReactNode} from 'react';
import {useDoc, useDocsSidebar} from '@docusaurus/plugin-content-docs/client';
import {useCurrentUser, useIsUserReady} from '@site/src/contexts/UserContext';
import {loadDocGates, isUrlAllowed, type DocGates} from '@site/src/lib/doc-gates';
import {
  flattenSidebar,
  nextAllowedUrl,
  type DocOrderItem,
} from '@site/src/lib/doc-order';
import SmartPaginator from '@site/src/theme/SmartPaginator';

/**
 * Swizzled paginator with two layers:
 *
 *  1. GATE FILTER. Stock Docusaurus renders both prev/next as links
 *     regardless of who is viewing - a learner would see "Next: For
 *     Managers →" pointing at a manager-only article. The server URL guard
 *     would 403 the click but the visual is misleading.
 *
 *  2. REROUTE. When stock prev/next IS blocked, we walk the resolved
 *     sidebar from this page's position in that direction and substitute
 *     the first doc the viewer can actually open. So the learner on
 *     /modules/ would see "Previous: How to update the SmartWinnr App
 *     from Web View" (the nearest accessible doc preceding /modules/ in
 *     sidebar order) instead of an empty/half-collapsed paginator.
 *
 *  Only if BOTH the stock target is blocked AND nothing accessible exists
 *  in that direction (start/end of the help center) does that side render
 *  as a disabled "End of help center" placeholder. The opposite side stays
 *  active. Layout stays symmetric in every state.
 */

export default function DocItemPaginator(): ReactNode {
  const {metadata, frontMatter} = useDoc();
  const sidebar = useDocsSidebar();
  const previous = metadata?.previous;
  const next = metadata?.next;
  const currentUrl = metadata?.permalink ?? '';
  const user = useCurrentUser();
  const ready = useIsUserReady();
  const [gates, setGates] = useState<DocGates | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadDocGates().then((g) => {
      if (!cancelled) setGates(g);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const order: DocOrderItem[] = useMemo(
    () => (sidebar ? flattenSidebar(sidebar.items as never) : []),
    [sidebar],
  );

  if (!ready || !gates) return null;

  const checkAllowed = (url: string) => isUrlAllowed(gates, user, url);

  // Honor explicit pagination_prev: false / pagination_next: false in the
  // article's frontmatter. Stock Docusaurus collapses both "no sibling" and
  // "explicitly disabled" into a single undefined, so we read the raw
  // frontmatter ourselves to keep author intent intact - that side renders
  // the disabled "End of help center" placeholder instead of being rerouted.
  const prevDisabled = (frontMatter as Record<string, unknown> | undefined)
    ?.pagination_prev === false;
  const nextDisabled = (frontMatter as Record<string, unknown> | undefined)
    ?.pagination_next === false;

  const resolvedPrev = prevDisabled
    ? undefined
    : previous && checkAllowed(previous.permalink)
    ? previous
    : nextAllowedUrl(order, currentUrl, 'prev', checkAllowed) ?? undefined;

  const resolvedNext = nextDisabled
    ? undefined
    : next && checkAllowed(next.permalink)
    ? next
    : nextAllowedUrl(order, currentUrl, 'next', checkAllowed) ?? undefined;

  return <SmartPaginator previous={resolvedPrev} next={resolvedNext} />;
}
