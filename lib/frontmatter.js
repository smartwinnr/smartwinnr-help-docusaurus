/**
 * Frontmatter edits that decide an article's access gate.
 *
 * Shared by server.js (the /move and /save authoring paths) and
 * scripts/restamp-article-roles.js so there is exactly one implementation of
 * "stamp this article's audience" - a security-relevant operation that should
 * not have divergent copies.
 *
 * Both helpers are scoped to the frontmatter block, so a stray `roles:` or
 * `privilege:` line in the article body is never touched.
 */

/** Replace the (indented) `customProps.roles` block in an article's
 *  frontmatter with an inline `roles: [a, b, …]`. Handles both the inline
 *  `[..]` form and the `- item` block-sequence form; inserts a roles line
 *  under `customProps:` if none exists, and appends a `customProps:` block
 *  if the article has none. */
function setFrontmatterRoles(markdown, roles) {
  const fmMatch = /^---\n([\s\S]*?)\n---/.exec(markdown);
  if (!fmMatch) return markdown;
  let fm = fmMatch[1];
  const inline = `  roles: [${roles.join(', ')}]`;
  const rolesRe = /^[ \t]+roles[ \t]*:[^\n]*(?:\n[ \t]+-[ \t]*[^\n]*)*/m;
  if (rolesRe.test(fm)) {
    fm = fm.replace(rolesRe, inline);
  } else if (/^customProps[ \t]*:/m.test(fm)) {
    fm = fm.replace(/^(customProps[ \t]*:[^\n]*\n)/m, `$1${inline}\n`);
  } else {
    fm = fm.replace(/\s*$/, '') + `\ncustomProps:\n${inline}`;
  }
  return markdown.replace(fmMatch[0], `---\n${fm}\n---`);
}

/** Drop the article-level `customProps.privilege:` line so the destination
 *  folder's _category_.json gate governs licensing (gates AND-combine). */
function removeFrontmatterPrivilege(markdown) {
  const fmMatch = /^---\n([\s\S]*?)\n---/.exec(markdown);
  if (!fmMatch) return markdown;
  const fm = fmMatch[1].replace(/^[ \t]+privilege[ \t]*:[^\n]*\n?/m, '');
  return markdown.replace(fmMatch[0], `---\n${fm}\n---`);
}

/** Rewrite the `last_update:` mapping in an article's frontmatter to
 *  {date, author}, replacing the whole existing block (the `last_update:`
 *  line plus its indented children) or appending one when the article has
 *  none. A surgical string edit rather than a gray-matter round-trip:
 *  re-serializing reflows the `description: >-` block scalars and reorders
 *  keys across most of the corpus, turning a one-line date change into a
 *  300-file diff.
 *
 *  `date` is written unquoted YYYY-MM-DD; two thirds of the corpus already
 *  carries that shape and MetaChip normalizes it alongside the legacy
 *  `2022-06-24T00:00:00.000Z` form. Omitting `author` writes only the date -
 *  callers that must not invent attribution pass the existing value through. */
function setLastUpdate(markdown, { date, author }) {
  const fmMatch = /^---\n([\s\S]*?)\n---/.exec(markdown);
  if (!fmMatch) return markdown;
  const fm = fmMatch[1];
  const lines = ['last_update:', `  date: ${date}`];
  if (author) lines.push(`  author: ${String(author).replace(/[\r\n]/g, ' ')}`);
  const stamp = lines.join('\n');

  const nextFm = /^last_update\s*:/m.test(fm)
    ? fm.replace(/^last_update\s*:[^\n]*(?:\n[ \t]+[^\n]*)*/m, () => stamp)
    : fm.trimEnd() + '\n' + stamp;

  // Function replacement, not a string: frontmatter descriptions contain `$`
  // (e.g. "$50 target") and a string replacement would read `$&` / `$'` as
  // substitution patterns and corrupt the file.
  return markdown.replace(fmMatch[0], () => `---\n${nextFm}\n---`);
}

module.exports = { setFrontmatterRoles, removeFrontmatterPrivilege, setLastUpdate };
