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

module.exports = { setFrontmatterRoles, removeFrontmatterPrivilege };
