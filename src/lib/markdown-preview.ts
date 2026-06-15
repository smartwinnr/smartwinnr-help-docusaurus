import {useEffect, useState} from 'react';

/**
 * Render a markdown string to HTML via lazy-imported markdown-it. Strips
 * the YAML frontmatter block before rendering so it doesn't leak into the
 * preview. Falls back to escaped <pre> if markdown-it fails to load.
 *
 * Shared between the authoring wizard's Step 4 preview and the raw
 * markdown editor at /admin/authoring/edit.
 */
export function useMarkdownHtml(md: string): string {
  const [html, setHtml] = useState('');
  useEffect(() => {
    if (!md) { setHtml(''); return; }
    (async () => {
      try {
        // markdown-it ships only ESM without bundled .d.ts, so TS can't
        // resolve types here. The dynamic import resolves at runtime via
        // Docusaurus's webpack - suppress the missing-types error.
        // @ts-expect-error - no @types/markdown-it
        const mod = (await import('markdown-it')) as unknown as {default?: unknown};
        const Ctor = (mod.default ?? mod) as unknown as new (opts?: object) => {render(s: string): string};
        const renderer = new Ctor({html: false, linkify: true, typographer: true});
        const body = md.replace(/^---[\s\S]*?\n---\s*\n?/, '');
        setHtml(renderer.render(body));
      } catch { setHtml('<pre>' + md.replace(/</g, '&lt;') + '</pre>'); }
    })();
  }, [md]);
  return html;
}
