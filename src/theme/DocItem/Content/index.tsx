import React, {type ReactNode, useEffect, useRef, useState} from 'react';
import clsx from 'clsx';
import {ThemeClassNames} from '@docusaurus/theme-common';
import {useDoc} from '@docusaurus/plugin-content-docs/client';
import Heading from '@theme/Heading';
import MDXContent from '@theme/MDXContent';
import type {Props} from '@theme/DocItem/Content';
import MetaChip from '@site/src/components/Article/MetaChip';
import FeedbackFooter from '@site/src/components/Article/FeedbackFooter';
import RelatedStrip from '@site/src/components/Article/RelatedStrip';

/**
 * Re-implementation of @theme-original/DocItem/Content with Apple-quality
 * article chrome.
 *
 * Layout decision (plan §16):
 *   • For article pages, all prose lives inside a single
 *     `<div class="sw-prose-column">` (max-width: 72ch, centered). One
 *     ancestor owns the reading column so the title, chip, h2s, paragraphs,
 *     lists, etc. naturally share a left edge — no per-tag constraints,
 *     no specificity fights with Infima's `.anchor` heading classes.
 *   • For pages that embed full-width React components (landing /,
 *     /path/<persona>/, /modules/<m>/), skip both the wrapper and the
 *     chrome so the React component keeps its own width.
 */

function useSyntheticTitle(): string | null {
  const {metadata, frontMatter, contentTitle} = useDoc();
  const shouldRender =
    !(frontMatter as {hide_title?: boolean}).hide_title &&
    typeof contentTitle === 'undefined';
  return shouldRender ? metadata.title : null;
}

// Pages that render full-width React heroes (not regular prose articles).
// On these we render the MDX children directly inside .markdown, with NO
// prose-column wrapper and NO chrome.
function isFullWidthPage(url: string | undefined): boolean {
  if (!url) return false;
  if (url === '/') return true;
  if (url.startsWith('/path/')) return true;
  // Module overview pages: exactly /modules/<m> or /modules/<m>/ — but NOT
  // sub-folders like /modules/<m>/<sub> (those are real articles).
  if (/^\/modules\/[^/]+\/?$/.test(url)) return true;
  return false;
}

function useReadingMinutesRef(
  deps: React.DependencyList,
): [React.RefObject<HTMLDivElement>, number | null] {
  const ref = useRef<HTMLDivElement | null>(null);
  const [minutes, setMinutes] = useState<number | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const id = window.requestAnimationFrame(() => {
      const text = ref.current?.textContent || '';
      const words = text.trim().split(/\s+/).filter(Boolean).length;
      setMinutes(words > 0 ? Math.max(1, Math.round(words / 200)) : null);
    });
    return () => window.cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return [ref, minutes];
}

export default function DocItemContent(props: Props): ReactNode {
  const {metadata} = useDoc();
  const url = metadata?.permalink ?? '';
  const fullWidth = isFullWidthPage(url);
  const syntheticTitle = useSyntheticTitle();
  const [columnRef, minutes] = useReadingMinutesRef([url]);

  if (fullWidth) {
    // Landing, persona doors, and module overview indexes — render flat
    // without the prose-column wrapper or chrome.
    return (
      <div className={clsx(ThemeClassNames.docs.docMarkdown, 'markdown')}>
        {syntheticTitle && (
          <header>
            <Heading as="h1">{syntheticTitle}</Heading>
          </header>
        )}
        <MDXContent>{props.children}</MDXContent>
      </div>
    );
  }

  // Article pages — single ancestor owns the reading column.
  return (
    <div className={clsx(ThemeClassNames.docs.docMarkdown, 'markdown')}>
      <div ref={columnRef} className="sw-prose-column">
        {syntheticTitle && (
          <header>
            <Heading as="h1">{syntheticTitle}</Heading>
          </header>
        )}
        <MetaChip minutes={minutes} />
        <MDXContent>{props.children}</MDXContent>
        <FeedbackFooter />
        <RelatedStrip />
      </div>
    </div>
  );
}
