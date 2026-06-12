import React, {type ReactNode} from 'react';
import {PageMetadata} from '@docusaurus/theme-common';
import {useCurrentSidebarCategory} from '@docusaurus/plugin-content-docs/client';
import useBaseUrl from '@docusaurus/useBaseUrl';
import DocCardList from '@theme/DocCardList';
import DocPaginator from '@theme/DocPaginator';
import DocVersionBanner from '@theme/DocVersionBanner';
import DocVersionBadge from '@theme/DocVersionBadge';
import DocBreadcrumbs from '@theme/DocBreadcrumbs';
import Heading from '@theme/Heading';
import type {Props} from '@theme/DocCategoryGeneratedIndexPage';

/**
 * Re-implementation of the stock category-landing page that wraps content
 * in the same `.row > .col > .sw-doc-item-wrap` chain Docusaurus uses for
 * articles (plan §18). Without this layer, articles render inside
 * `.container > .row > .col > .docItemContainer_*` while generated-index
 * pages render straight into `.container > .generatedIndexPage_*` - same
 * `.container`, different inner padding, so the 72ch column centers at
 * slightly different x positions.
 *
 * Class name `generatedIndexPage` (no hash) keeps the existing CSS in
 * `src/css/custom.css` ([class*="generatedIndexPage_"] selectors) matching
 * via the partial attribute selector.
 */

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

function Content({categoryGeneratedIndex}: Props): JSX.Element {
  const category = useCurrentSidebarCategory();
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
        <DocCardList items={category.items} />
      </article>
      <footer className="margin-top--md">
        <DocPaginator
          previous={categoryGeneratedIndex.navigation.previous}
          next={categoryGeneratedIndex.navigation.next}
        />
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
