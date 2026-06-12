import React, {useEffect, useState, type ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import BrowserOnly from '@docusaurus/BrowserOnly';
import {
  PageMetadata,
  HtmlClassNameProvider,
  ThemeClassNames,
} from '@docusaurus/theme-common';
import Translate, {translate} from '@docusaurus/Translate';
import SearchMetadata from '@theme/SearchMetadata';
import Unlisted from '@theme/ContentVisibility/Unlisted';
import Heading from '@theme/Heading';
import type {Props} from '@theme/DocTagDocListPage';
import {useCurrentUser, useUserState} from '@site/src/contexts/UserContext';
import {loadDocGates, isUrlAllowed, type DocGates} from '@site/src/lib/doc-gates';

/**
 * Swizzled tag-page renderer. Identical to the stock implementation, but
 * filters `tag.items` against the same `doc-gates.json` the server uses for
 * URL guarding - so a learner clicking the `admin` tag chip doesn't see
 * editor-only articles in the list.
 *
 * The original `tag.items` is still exposed to the page metadata (no SEO
 * regression vs. the server-rendered output). The filtered list shows only
 * URLs the viewer would actually be allowed to open.
 */

function usePageTitle(props: Props, showUnfilteredCount: boolean): string {
  // The unfiltered total is meaningful to superadmins (operational view)
  // but misleading to everyone else, because the article list is filtered
  // client-side by role + privilege.
  if (showUnfilteredCount) {
    return translate(
      {
        id: 'theme.docs.tagDocListPageTitle.admin',
        message: '{count} docs tagged with "{tagName}"',
      },
      {count: String(props.tag.count), tagName: props.tag.label},
    );
  }
  return translate(
    {
      id: 'theme.docs.tagDocListPageTitle',
      message: 'Articles tagged "{tagName}"',
    },
    {tagName: props.tag.label},
  );
}

type DocItem = {id: string; title: string; description?: string; permalink: string};

function DocItemView({doc}: {doc: DocItem}): JSX.Element {
  return (
    <article className="margin-vert--lg">
      <Link to={doc.permalink}>
        <Heading as="h2">{doc.title}</Heading>
      </Link>
      {doc.description && <p>{doc.description}</p>}
    </article>
  );
}

function DocTagDocListPageMetadata({title, tag}: Props & {title: string}): JSX.Element {
  return (
    <>
      <PageMetadata title={title} description={tag.description} />
      <SearchMetadata tag="doc_tag_doc_list" />
    </>
  );
}

function FilteredContent({tag}: Props): JSX.Element {
  const user = useCurrentUser();
  const {loading} = useUserState();
  const [gates, setGates] = useState<DocGates | null>(null);

  useEffect(() => {
    loadDocGates().then((g) => setGates(g));
  }, []);

  const isSuperadmin = (user.roles || []).includes('superadmin');
  const title = usePageTitle({tag} as Props, isSuperadmin);

  // While auth or gates are loading, render an empty list - server-side fall-
  // open + this client-side gate ensures we never leak content past hydration.
  const items = (tag.items as DocItem[]).filter((doc) =>
    !loading && gates ? isUrlAllowed(gates, user, doc.permalink) : false,
  );

  return (
    <HtmlClassNameProvider
      className={clsx(ThemeClassNames.page.docsTagDocListPage)}>
      <div className="container margin-vert--lg">
        <div className="row">
          <main className="col col--8 col--offset-2">
            {tag.unlisted && <Unlisted />}
            <header className="margin-bottom--xl">
              <Heading as="h1">{title}</Heading>
              {tag.description && <p>{tag.description}</p>}
              <Link href={tag.allTagsPath}>
                <Translate id="theme.tags.tagsPageLink">View all tags</Translate>
              </Link>
            </header>
            <section className="margin-vert--lg">
              {(loading || !gates) ? (
                <p style={{color: 'var(--ifm-color-content-secondary)'}}>Checking access…</p>
              ) : items.length === 0 ? (
                <p style={{color: 'var(--ifm-color-content-secondary)'}}>
                  No articles with this tag are available to your role.
                </p>
              ) : (
                items.map((doc) => <DocItemView key={doc.id} doc={doc} />)
              )}
            </section>
          </main>
        </div>
      </div>
    </HtmlClassNameProvider>
  );
}

export default function DocTagDocListPage(props: Props): ReactNode {
  // Default (non-admin) title for SSR + page metadata. The superadmin
  // variant is swapped in client-side once the user context resolves.
  const defaultTitle = usePageTitle(props, false);
  return (
    <>
      <DocTagDocListPageMetadata {...props} title={defaultTitle} />
      <BrowserOnly fallback={
        <div className="container margin-vert--lg">
          <main className="col col--8 col--offset-2">
            <Heading as="h1">{defaultTitle}</Heading>
            <p>Loading…</p>
          </main>
        </div>
      }>
        {() => <FilteredContent {...props} />}
      </BrowserOnly>
    </>
  );
}
