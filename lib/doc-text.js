/**
 * Turn an article's markdown/MDX body into the plain prose we index, search,
 * and show to readers.
 *
 * The indexer used to store the raw body, so search results and chatbot
 * citations previewed articles as `import ModuleOverview from '@site/...'`
 * followed by `<ModuleOverview slug="video-coaching" />` - the file's actual
 * source. The same text was embedded (so those pages matched on their
 * JavaScript rather than their subject) and handed to the model as
 * "documentation".
 *
 * Used by scripts/internal-indexer.js at index time and by server.js when
 * building snippets, so content indexed before the cleanup is still presented
 * cleanly.
 */

/** Strip MDX/markdown syntax down to readable prose. */
function toIndexableText(markdown) {
  if (!markdown || typeof markdown !== 'string') return '';
  let t = markdown;

  // Frontmatter, if the caller hasn't already removed it.
  t = t.replace(/^---\n[\s\S]*?\n---\n?/, '');

  // MDX module syntax. These are the lines that were showing up in search.
  t = t.replace(/^[ \t]*import\s+[^\n]*\n?/gm, '');
  t = t.replace(/^[ \t]*export\s+(?:const|default|function)\s+[^\n]*\n?/gm, '');

  // Fenced code blocks (before inline rules, so their contents aren't mangled
  // into the prose) and HTML comments.
  t = t.replace(/```[\s\S]*?```/g, ' ');
  t = t.replace(/<!--[\s\S]*?-->/g, ' ');

  // JSX / HTML tags. Self-closing components, paired tags, and the closing
  // half of a pair - the text between paired tags is kept.
  t = t.replace(/<\/?[A-Za-z][A-Za-z0-9._-]*(?:\s[^<>]*?)?\/?>/g, ' ');

  // Docusaurus admonitions: drop the ::: fences, keep the body text.
  t = t.replace(/^[ \t]*:::[a-zA-Z]*[^\n]*\n?/gm, '');

  // Images first (they'd otherwise leave a stray "!" behind), then links,
  // keeping the link text.
  t = t.replace(/!\[[^\]]*\]\([^)]*\)/g, ' ');
  t = t.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');

  // Block markup: blockquotes (153 articles open with "> **At a glance** -"),
  // headings, list bullets, table pipes, horizontal rules.
  t = t.replace(/^[ \t]*>[ \t]?/gm, '');
  t = t.replace(/^[ \t]*#{1,6}[ \t]+/gm, '');
  t = t.replace(/^[ \t]*[-*+][ \t]+/gm, '');
  t = t.replace(/^[ \t]*\d+\.[ \t]+/gm, '');
  t = t.replace(/^[ \t]*[-*_]{3,}[ \t]*$/gm, ' ');
  t = t.replace(/^[ \t]*\|/gm, ' ').replace(/\|[ \t]*$/gm, ' ');

  // Inline emphasis / code. Underscore emphasis only when it wraps whole
  // words, so identifiers like user_rating survive.
  t = t.replace(/\*\*([^*]+)\*\*/g, '$1');
  t = t.replace(/\*([^*\n]+)\*/g, '$1');
  t = t.replace(/(^|\s)__([^_]+)__(?=\s|$)/g, '$1$2');
  t = t.replace(/(^|\s)_([^_]+)_(?=[\s.,;:!?]|$)/g, '$1$2');
  t = t.replace(/`([^`]*)`/g, '$1');

  return t.replace(/\s+/g, ' ').trim();
}

/**
 * Text to index for an article whose body has no prose - the module landing
 * pages and persona paths, whose content is rendered client-side from a
 * manifest. Without this they index as their import statements (or not at
 * all), so a search for "video coaching" can't find the Video Coaching page.
 */
function synthesizeFromFrontmatter(fm) {
  if (!fm) return '';
  const parts = [];
  if (fm.title) parts.push(String(fm.title).trim());
  if (fm.description) parts.push(String(fm.description).trim());
  if (Array.isArray(fm.tags) && fm.tags.length) {
    parts.push(fm.tags.map((t) => String(t).trim()).filter(Boolean).join(', '));
  }
  // Join with a period, but don't double up when a part already ends in one.
  return parts
    .filter(Boolean)
    .reduce((acc, part) => (acc ? `${acc.replace(/[.\s]+$/, '')}. ${part}` : part), '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** A short, clean preview. Cuts on a word boundary rather than mid-word. */
function toSnippet(text, maxLen = 200) {
  const clean = toIndexableText(text);
  if (clean.length <= maxLen) return clean;
  const cut = clean.slice(0, maxLen);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > maxLen * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd() + '…';
}

module.exports = { toIndexableText, synthesizeFromFrontmatter, toSnippet };
