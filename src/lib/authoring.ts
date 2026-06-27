/**
 * Shared authoring helpers used by the wizard (index.tsx), the unified
 * editor (edit.tsx), and the queue (drafts.tsx). Pure functions + constants
 * only - no React, no DOM. Extracted so the editor can reuse the wizard's
 * frontmatter parsing / title-shape coaching / tag vocabulary instead of
 * duplicating them.
 */

/** The 9 canonical sub-folders every module has, with display labels and the
 *  default audience roles each grants. Mirrors server-side CANONICAL_SUBFOLDERS
 *  + SUBFOLDER_TEMPLATE. Single source for the wizard's Step 1 picker, the
 *  Published-tab folder filter, and the editor's Move control. */
export const SUB_FOLDERS: Array<{value: string; label: string; audience: string[]}> = [
  {value: 'for-learners',             label: 'For Learners',             audience: ['user', 'manager', 'editor', 'admin', 'orgadmin', 'lamadmin', 'superadmin']},
  {value: 'for-managers',             label: 'For Managers',             audience: ['manager', 'editor', 'admin', 'orgadmin', 'lamadmin', 'superadmin']},
  {value: 'create-and-manage',        label: 'Create & Manage',          audience: ['editor', 'admin', 'orgadmin', 'lamadmin', 'superadmin']},
  {value: 'assign-and-schedule',      label: 'Assign & Schedule',        audience: ['editor', 'admin', 'orgadmin', 'lamadmin', 'superadmin']},
  {value: 'features',                 label: 'Features',                 audience: ['editor', 'admin', 'orgadmin', 'lamadmin', 'superadmin']},
  {value: 'reports-and-analytics',    label: 'Reports & Analytics',      audience: ['editor', 'admin', 'orgadmin', 'lamadmin', 'superadmin']},
  {value: 'settings-and-permissions', label: 'Settings & Permissions',   audience: ['editor', 'admin', 'orgadmin', 'lamadmin', 'superadmin']},
  {value: 'best-practices',           label: 'Best Practices',           audience: ['editor', 'admin', 'orgadmin', 'lamadmin', 'superadmin']},
  {value: 'faqs-and-troubleshooting', label: 'FAQs & Troubleshooting',   audience: ['user', 'manager', 'editor', 'admin', 'orgadmin', 'lamadmin', 'superadmin']},
];

/** The controlled tag vocabulary surfaced in the TagPicker. Mirrors the
 *  "Tag vocabulary" list in prompts/author-article.md. */
export const TAG_VOCAB = [
  'quiz', 'smartpath', 'smartfeed', 'video-coaching', 'ai-coaching',
  'field-coaching', 'survey', 'knowledge-hub', 'forms', 'kpi',
  'gamification', 'reports', 'notifications', 'settings', 'admin',
  'troubleshooting', 'billing', 'onboarding', 'mobile', 'web', 'integration',
];

/** The frontmatter fields the authoring UI reads/writes. */
export type FrontmatterFields = {
  title: string;
  description: string;
  slug: string;
  audienceRoles: string[];
  privilege: string;
  tags: string[];
};

export function slugify(s: string): string {
  return s.toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

/** Sub-folder-aware title-shape table. Each sub-folder maps to (a) the
 *  prefixes a title should start with, (b) a human-readable hint shown
 *  under the field when the title doesn't match. Mirrors the
 *  Title-shape-by-sub-folder table in prompts/author-article.md so the
 *  wizard's soft warning and the LLM's generation rules agree.
 *
 *  Unknown sub-folder slugs fall back to a generic verb/question check
 *  (the legacy behavior) so cross-module / not-yet-defined sub-folders
 *  still get *some* coaching. */
const TITLE_SHAPE_BY_SUBFOLDER: Record<string, {prefixes: RegExp[]; hint: string}> = {
  'create-and-manage': {
    prefixes: [/^how to\b/i],
    hint: 'Should start with "How to ..." (e.g. "How to create a manual quiz").',
  },
  'assign-and-schedule': {
    prefixes: [/^how to\b/i],
    hint: 'Should start with "How to assign ..." or "How to schedule ..." (e.g. "How to assign a quiz to a group").',
  },
  'for-learners': {
    prefixes: [/^how to\b/i],
    hint: 'Should start with "How to ..." in learner-facing tone (e.g. "How to retake a quiz").',
  },
  'for-managers': {
    prefixes: [/^how to\b/i],
    hint: 'Should start with "How to ..." in manager-facing tone (e.g. "How to review your team\'s scores").',
  },
  'features': {
    prefixes: [/^what is\b/i, /^understanding\b/i],
    hint: 'Should start with "What is ..." or "Understanding ..." (e.g. "What is auto-quiz").',
  },
  'reports-and-analytics': {
    prefixes: [/^how to read\b/i, /^understanding\b/i, /^how to\b/i],
    hint: 'Should start with "How to read the ..." or "Understanding the ... report" (e.g. "How to read the engagement report").',
  },
  'settings-and-permissions': {
    prefixes: [/^configure\b/i, /^set up\b/i, /^enable\b/i, /^disable\b/i],
    hint: 'Should start with "Configure ...", "Set up ...", "Enable ...", or "Disable ..." (e.g. "Configure SSO").',
  },
  'best-practices': {
    prefixes: [/^best practices\b/i, /^tips for\b/i],
    hint: 'Should start with "Best practices for ..." (e.g. "Best practices for writing quiz questions").',
  },
  'faqs-and-troubleshooting': {
    prefixes: [
      /^(why|what|how|when|where|who|can|do(es)?|is|are|will|should)\b/i,
      /^troubleshooting\b/i,
    ],
    hint: 'Should be a question ("Why does ...?", "Can I ...?") or start with "Troubleshooting ..." (e.g. "Why does my quiz score show 0?").',
  },
};

/** Returns {ok, hint} for the title against the article's sub-folder.
 *  `ok=false` means the title should be reshaped; `hint` is the message
 *  to surface to the editor. Empty titles or missing sub-folders return
 *  ok=true so we don't double-warn before the editor has even typed. */
export function checkTitleShape(title: string, subFolder: string): {ok: boolean; hint: string} {
  const t = (title || '').trim();
  if (!t || !subFolder) return {ok: true, hint: ''};
  const shape = TITLE_SHAPE_BY_SUBFOLDER[subFolder];
  if (shape) {
    const ok = shape.prefixes.some((re) => re.test(t));
    return {ok, hint: shape.hint};
  }
  // Fallback for unmapped sub-folders: legacy verb/question check.
  const first = t.split(/\s+/)[0].toLowerCase();
  const verbs = new Set([
    'how', 'what', 'why', 'when', 'where', 'who',
    'add', 'configure', 'create', 'manage', 'edit', 'delete', 'send',
    'set', 'view', 'enable', 'disable', 'import', 'export', 'update',
    'assign', 'review', 'duplicate', 'troubleshoot', 'build', 'find',
    'submit', 'open', 'close', 'archive',
  ]);
  return {
    ok: verbs.has(first),
    hint: 'Should start with an action verb or question word (How, What, Add, Create, Configure…).',
  };
}

/**
 * Hand-rolled frontmatter parser scoped to the fields the authoring UI
 * cares about. Robust to the shapes real articles use - not just the clean
 * single-line double-quoted frontmatter the wizard generates, but also the
 * HelpScout-migrated shapes the unified editor loads: YAML block scalars
 * (`>`, `>-`, `|`, `|-`) for long descriptions, unquoted values containing
 * quote characters, and block sequences (`- item`) for roles/tags. We don't
 * pull in a YAML library on the client.
 */
export function parseFrontmatterFields(markdown: string): FrontmatterFields | null {
  const m = /^---\s*\n([\s\S]*?)\n---\s*\n/.exec(markdown);
  if (!m) return null;
  const fm = m[1];

  const unquote = (s: string): string => {
    const t = s.trim();
    if (t.length >= 2
      && ((t[0] === '"' && t[t.length - 1] === '"') || (t[0] === "'" && t[t.length - 1] === "'"))) {
      return t.slice(1, -1);
    }
    return t;
  };

  // Scalar field: inline (quoted/unquoted) OR a YAML block scalar whose value
  // spans subsequent indented lines (`key: >-` / `key: |`).
  const scalar = (key: string): string => {
    const r = new RegExp(`^${key}[ \\t]*:(.*)((?:\\n[ \\t]+.*)*)`, 'm').exec(fm);
    if (!r) return '';
    const inline = r[1].trim();
    if (inline === '' || /^[|>][-+]?\d*$/.test(inline)) {
      const lines = r[2].split('\n').slice(1).map((l) => l.replace(/^[ \t]+/, ''));
      // `|` keeps newlines; `>` (and bare) folds them into spaces.
      return inline.startsWith('|')
        ? lines.join('\n').replace(/\n+$/, '').trim()
        : lines.join(' ').replace(/\s+/g, ' ').trim();
    }
    return unquote(inline);
  };

  // Array field: inline `[a, b]` OR a block sequence of `- item` lines.
  const arrayField = (key: string): string[] => {
    const inline = new RegExp(`^[ \\t]*${key}[ \\t]*:[ \\t]*\\[([^\\]]*)\\]`, 'm').exec(fm);
    if (inline) {
      return inline[1].split(',').map(unquote).filter(Boolean);
    }
    const block = new RegExp(`^[ \\t]*${key}[ \\t]*:[ \\t]*\\n((?:[ \\t]+-[ \\t]*[^\\n]*\\n?)+)`, 'm').exec(fm);
    if (block) {
      return block[1]
        .split('\n')
        .map((l) => {
          const im = /^[ \t]+-[ \t]*(.*)$/.exec(l);
          return im ? unquote(im[1]) : '';
        })
        .filter(Boolean);
    }
    return [];
  };

  // privilege lives under customProps - regex matches both top-level and nested.
  const privMatch = /^\s*privilege\s*:\s*["']?([A-Za-z0-9_]+)["']?\s*$/m.exec(fm);
  return {
    title: scalar('title'),
    description: scalar('description'),
    slug: scalar('slug'),
    audienceRoles: arrayField('roles'),
    privilege: privMatch ? privMatch[1] : '',
    tags: arrayField('tags'),
  };
}

export function replaceFrontmatterFields(
  markdown: string,
  patch: {title?: string; description?: string; tags?: string[]},
): string {
  const fmMatch = /^---\n([\s\S]*?)\n---/.exec(markdown);
  if (!fmMatch) return markdown;
  let fm = fmMatch[1];

  // Replace a top-level key's whole block (key line + any subsequent
  // indented continuation lines). Appends a fresh line if the key is
  // absent from the frontmatter.
  const replaceKey = (src: string, key: string, line: string): string => {
    // Matches `<key>:<rest of line>` plus zero or more subsequent lines
    // that begin with whitespace (continuation under that key). Stops at
    // the next non-indented line (a sibling key) or end-of-frontmatter.
    const re = new RegExp(`^${key}\\s*:[^\\n]*(?:\\n[ \\t]+[^\\n]*)*`, 'm');
    return re.test(src) ? src.replace(re, line) : src + '\n' + line;
  };

  if (patch.title !== undefined) {
    fm = replaceKey(fm, 'title', `title: ${JSON.stringify(patch.title)}`);
  }
  if (patch.description !== undefined) {
    fm = replaceKey(fm, 'description', `description: ${JSON.stringify(patch.description)}`);
  }
  if (patch.tags !== undefined) {
    const v = '[' + patch.tags.map((t) => JSON.stringify(t)).join(', ') + ']';
    fm = replaceKey(fm, 'tags', `tags: ${v}`);
  }
  return markdown.replace(fmMatch[0], `---\n${fm}\n---`);
}

/** Parse a docs/modules article path into its routing parts. Returns null
 *  for anything outside the canonical `docs/modules/<m>/<sub>/<slug>.md` shape
 *  (e.g. a queued `_category_.json` or image). */
export function parsePath(p: string): {module: string; subFolder: string; slug: string} | null {
  const m = /^docs\/modules\/([^/]+)\/([^/]+)\/([^/]+)\.(md|mdx)$/.exec(p.replace(/\\/g, '/'));
  return m ? {module: m[1], subFolder: m[2], slug: m[3]} : null;
}

/** Read the frontmatter `draft:` flag. Returns true/false, or null when the
 *  field is absent (Docusaurus treats absent as published). */
export function getDraftFlag(markdown: string): boolean | null {
  const m = /^draft:\s*(true|false)\s*$/m.exec(markdown);
  return m ? m[1] === 'true' : null;
}

/** Force the frontmatter `draft:` flag to `isDraft`. Replaces an existing
 *  flag or inserts one before the closing `---` if absent. Used to preserve
 *  a published article's state across an AI refine (the generate prompt
 *  otherwise hard-sets `draft: true`). */
export function setDraftFlag(markdown: string, isDraft: boolean): string {
  const line = `draft: ${isDraft}`;
  if (/^draft:\s*(true|false)\s*$/m.test(markdown)) {
    return markdown.replace(/^draft:\s*(true|false)\s*$/m, line);
  }
  // Insert just before the closing frontmatter delimiter.
  return markdown.replace(/^(---[\s\S]*?\n)(---)/, (_m, fm, end) => fm + line + '\n' + end);
}
