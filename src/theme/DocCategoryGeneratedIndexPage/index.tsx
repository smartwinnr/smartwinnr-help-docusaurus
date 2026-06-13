import React, {useEffect, useMemo, useState, type ReactNode} from 'react';
import {PageMetadata} from '@docusaurus/theme-common';
import {
  useCurrentSidebarCategory,
  useDocsSidebar,
} from '@docusaurus/plugin-content-docs/client';
import useBaseUrl from '@docusaurus/useBaseUrl';
import DocCardList from '@theme/DocCardList';
import DocVersionBanner from '@theme/DocVersionBanner';
import DocVersionBadge from '@theme/DocVersionBadge';
import DocBreadcrumbs from '@theme/DocBreadcrumbs';
import Heading from '@theme/Heading';
import type {Props} from '@theme/DocCategoryGeneratedIndexPage';
import {useCurrentUser, useIsUserReady} from '@site/src/contexts/UserContext';
import {loadDocGates, isUrlAllowed, type DocGates} from '@site/src/lib/doc-gates';
import {
  flattenSidebar,
  nextAllowedUrl,
  type DocOrderItem,
} from '@site/src/lib/doc-order';
import SmartPaginator from '@site/src/theme/SmartPaginator';
import type {CurrentUser} from '@site/src/access-policy';

/**
 * Re-implementation of the stock category-landing page that wraps content
 * in the same `.row > .col > .sw-doc-item-wrap` chain Docusaurus uses for
 * articles (plan §18). Without this layer, articles render inside
 * `.container > .row > .col > .docItemContainer_*` while generated-index
 * pages render straight into `.container > .generatedIndexPage_*` - same
 * `.container`, different inner padding, so the 72ch column centers at
 * slightly different x positions.
 *
 * Adds two access-gate filters the stock theme does NOT do:
 *   1. `category.items` is filtered recursively against doc-gates.json so
 *      a learner browsing `/modules/quiz/` no longer sees a "For Managers"
 *      card linking into manager-only content.
 *   2. `navigation.previous` / `navigation.next` get the same filter so
 *      the bottom paginator cannot offer a jump into a gated category.
 *
 * Class name `generatedIndexPage` (no hash) keeps the existing CSS in
 * `src/css/custom.css` ([class*="generatedIndexPage_"] selectors) matching
 * via the partial attribute selector.
 */

type SidebarItem = {
  type: string;
  href?: string;
  label?: string;
  items?: SidebarItem[];
  [key: string]: unknown;
};

type NavLink = {title: string; permalink: string} | undefined;

function filterItems(
  items: SidebarItem[],
  gates: DocGates,
  user: CurrentUser,
): SidebarItem[] {
  const out: SidebarItem[] = [];
  for (const it of items) {
    if (it.type === 'category') {
      const ownHrefOk = !it.href || isUrlAllowed(gates, user, it.href);
      const filteredChildren = filterItems(it.items || [], gates, user);
      // Keep the category if its own landing is allowed AND it still has
      // at least one accessible child (or had none to begin with).
      const empty = (it.items || []).length === 0;
      if (ownHrefOk && (filteredChildren.length > 0 || empty)) {
        out.push({...it, items: filteredChildren});
      }
    } else if (it.type === 'link') {
      if (it.href && isUrlAllowed(gates, user, it.href)) out.push(it);
    } else {
      // 'html', 'ref', etc. - no URL of our own to gate; pass through.
      out.push(it);
    }
  }
  return out;
}

function Metadata({categoryGeneratedIndex}: Props): JSX.Element {
  return (
    <PageMetadata
      title={categoryGeneratedIndex.title}
      description={categoryGeneratedIndex.description}
      keywords={categoryGeneratedIndex.keywords}
      image={useBaseUrl(categoryGeneratedIndex.image)}
    />
  );
}

function CardGridSkeleton(): JSX.Element {
  const placeholderStyle: React.CSSProperties = {
    minHeight: 120,
    borderRadius: 10,
    background: 'var(--ifm-color-emphasis-100)',
    border: '1px solid var(--ifm-color-emphasis-200)',
  };
  return (
    <div
      aria-hidden="true"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 12,
      }}>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div key={i} style={placeholderStyle} />
      ))}
    </div>
  );
}

function Content({categoryGeneratedIndex}: Props): JSX.Element {
  const category = useCurrentSidebarCategory();
  const sidebar = useDocsSidebar();
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

  const gateActive = ready && !!gates;
  const filteredItems = gateActive
    ? filterItems(category.items as SidebarItem[], gates!, user)
    : (category.items as SidebarItem[]);

  // Reroute Prev/Next past gated docs. The generated-index page's own URL
  // is the category landing (e.g. /modules); we anchor the walk there.
  const currentUrl = categoryGeneratedIndex.slug || '';
  const checkAllowed = (url: string) =>
    isUrlAllowed(gates as DocGates, user, url);
  const stockPrev = categoryGeneratedIndex.navigation.previous;
  const stockNext = categoryGeneratedIndex.navigation.next;

  const resolvedPrev = gateActive
    ? stockPrev && checkAllowed(stockPrev.permalink)
      ? stockPrev
      : nextAllowedUrl(order, currentUrl, 'prev', checkAllowed) ?? undefined
    : undefined;

  const resolvedNext = gateActive
    ? stockNext && checkAllowed(stockNext.permalink)
      ? stockNext
      : nextAllowedUrl(order, currentUrl, 'next', checkAllowed) ?? undefined
    : undefined;

  return (
    <div className="generatedIndexPage_sw">
      <DocVersionBanner />
      <DocBreadcrumbs />
      <DocVersionBadge />
      <header>
        <Heading as="h1">{categoryGeneratedIndex.title}</Heading>
        {categoryGeneratedIndex.description && (
          <p>{categoryGeneratedIndex.description}</p>
        )}
      </header>
      <article className="margin-top--lg">
        {gateActive ? (
          <DocCardList items={filteredItems as never} />
        ) : (
          <CardGridSkeleton />
        )}
      </article>
      <footer className="margin-top--md">
        {gateActive && (
          <SmartPaginator previous={resolvedPrev} next={resolvedNext} />
        )}
      </footer>
    </div>
  );
}

export default function DocCategoryGeneratedIndexPage(props: Props): ReactNode {
  return (
    <>
      <Metadata {...props} />
      {/* Mirror the article-page chain so the 72ch column sits on the
        * same x position. Articles use plain `.col` too (the TOC
        * right-rail constraint is overridden site-wide in custom.css
        * - see plan §18, the `.col[class*="docItemCol_"]` rule). */}
      <div className="row">
        <div className="col">
          <div className="sw-doc-item-wrap">
            <Content {...props} />
          </div>
        </div>
      </div>
    </>
  );
}
