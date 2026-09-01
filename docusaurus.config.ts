import {Config} from '@docusaurus/types';
import * as fs from 'node:fs';
import * as path from 'node:path';
import matter from 'gray-matter';

// Load IA-migration redirects emitted by scripts/migrate-ia.js.
// Strip trailing /index since Docusaurus serves index.md at the directory URL,
// and de-dupe (since collapsing /index can produce identical entries).
type RedirectEntry = {from: string; to: string};
// Keep in sync with normRoute in server.js (deploy pre-flight validation).
function normPath(p: string): string {
  // Strip trailing /index and trailing slash to match Docusaurus' canonical
  // route form (e.g. /modules/ai-coaching, not /modules/ai-coaching/).
  let n = p.replace(/\/index$/, '');
  if (n.length > 1) n = n.replace(/\/$/, '');
  n = n || '/';
  return n;
}
const redirectsFile = path.join(__dirname, 'data', 'redirects.json');
const rawRedirects: RedirectEntry[] = fs.existsSync(redirectsFile)
  ? (JSON.parse(fs.readFileSync(redirectsFile, 'utf8')).redirects ?? [])
  : [];

/**
 * Walk docs/ and build a map of every article URL -> {file, isDraft}.
 * Used by the redirect normalizer to drop redirects whose target is
 * currently a draft (Docusaurus excludes drafts from the prod build,
 * so the redirect would fail the build's target-exists check). Once
 * the article is republished, the draft flag flips and the redirect
 * comes back on the next build.
 *
 * Doesn't try to enumerate category / generated-index landings - if
 * a redirect target isn't in this map at all, we keep the redirect
 * and let Docusaurus's own validation flag it.
 *
 * Keep in sync with buildLocalDocEntries in server.js, which ports this
 * walk for the deploy pre-flight validation.
 */
type DocEntry = {file: string; isDraft: boolean};
function buildDocUrlMap(): Map<string, DocEntry> {
  const map = new Map<string, DocEntry>();
  const docsRoot = path.join(__dirname, 'docs');
  if (!fs.existsSync(docsRoot)) return map;
  function walk(dir: string) {
    for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
      const p = path.join(dir, entry.name);
      if (entry.isDirectory()) { walk(p); continue; }
      if (!/\.(md|mdx)$/i.test(entry.name)) continue;
      let content = '';
      try { content = fs.readFileSync(p, 'utf8'); } catch { continue; }
      // Real YAML parse (not a regex): frontmatter routinely uses block
      // scalars (slug: >-) that line-based regexes misread as ">-".
      let fm: Record<string, unknown> = {};
      // Options arg bypasses gray-matter's content-keyed cache, which returns
      // `{data:{}}` when re-parsing a string whose first parse threw - broken
      // frontmatter would otherwise look like an article that simply has none.
      try { fm = matter(content, {}).data ?? {}; } catch { /* fall back below */ }
      const isDraft = fm.draft === true;
      const rel = path.relative(docsRoot, p).replace(/\\/g, '/');
      const dirRel = rel.replace(/\/?[^/]+\.(md|mdx)$/i, '');
      const fileBase = path.basename(p).replace(/\.(md|mdx)$/i, '');
      const slug = typeof fm.slug === 'string' && fm.slug.trim() ? fm.slug.trim() : fileBase;
      const url = slug.startsWith('/') ? slug : '/' + (dirRel ? dirRel + '/' : '') + slug;
      map.set(normPath(url), {file: p, isDraft});
    }
  }
  walk(docsRoot);
  return map;
}
const docUrlMap = buildDocUrlMap();

const seen = new Set<string>();
const redirects: RedirectEntry[] = [];
let droppedDraft = 0;
for (const r of rawRedirects) {
  const from = normPath(r.from);
  const to = normPath(r.to);
  if (from === to) continue;
  const key = from + '→' + to;
  if (seen.has(key)) continue;
  seen.add(key);
  // If the target is a known article AND that article is currently a
  // draft, drop the redirect. Drafts aren't routed in prod; a redirect
  // to a missing route fails the build. Unmapped targets (category
  // landings, generated-index, custom pages) pass through unchanged.
  const target = docUrlMap.get(to);
  if (target && target.isDraft) {
    droppedDraft += 1;
    continue;
  }
  redirects.push({from, to});
}
if (droppedDraft > 0) {
  console.log(`[redirects] dropped ${droppedDraft} redirect(s) whose target is a draft article`);
}

const config: Config = {
  title: 'SmartWinnr Help Center',
  tagline: 'Private Documentation for SmartWinnr Users',
  favicon: 'img/favicon.ico',

  url: 'https://help.smartwinnr.com',
  baseUrl: '/',

  // Broken links fail the build: a dead link is a user-visible 404, and
  // 'warn' meant nobody ever saw them scroll past in CI.
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'throw',
  // Still 'warn' - there are 16 known-broken Help Scout anchors
  // (#Overview-Tab-USrFb style) left over from the migration. Flip this to
  // 'throw' once those headings get explicit {#anchor} ids.
  onBrokenAnchors: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  // Preload the two self-hosted variable fonts so first-paint text is rendered
  // with Inter immediately (no FOUT to a system fallback). See plan §14.2.
  headTags: [
    {
      tagName: 'link',
      attributes: {
        rel: 'preload',
        href: '/fonts/InterVariable.woff2',
        as: 'font',
        type: 'font/woff2',
        crossorigin: 'anonymous',
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'preload',
        href: '/fonts/JetBrainsMonoVariable.woff2',
        as: 'font',
        type: 'font/woff2',
        crossorigin: 'anonymous',
      },
    },
    // Favicon set generated from favicon.io. The `favicon` top-level option
    // above wires /img/favicon.ico for the legacy default; the links below
    // give modern browsers the correct sized PNG so the tab icon and the
    // home-screen icon both render crisply.
    {
      tagName: 'link',
      attributes: {rel: 'icon', type: 'image/png', sizes: '32x32', href: '/img/favicon-32x32.png'},
    },
    {
      tagName: 'link',
      attributes: {rel: 'icon', type: 'image/png', sizes: '16x16', href: '/img/favicon-16x16.png'},
    },
    {
      tagName: 'link',
      attributes: {rel: 'apple-touch-icon', sizes: '180x180', href: '/img/apple-touch-icon.png'},
    },
    {
      tagName: 'link',
      attributes: {rel: 'manifest', href: '/site.webmanifest'},
    },
    {
      tagName: 'meta',
      attributes: {name: 'theme-color', content: '#8b5cf6'},
    },
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: '/',
          // No editUrl: it rendered an "Edit this page" link on all 328 pages
          // exposing the repo name and the article's internal file path
          // (docs/modules/.../index.mdx) to every reader - and it pointed at a
          // GitLab repo this project no longer deploys from, so it 404'd.
          // Editors publish through the in-app tool at /admin/authoring.
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
        // The whole site is auth-gated (see auth/index.js) and robots.txt
        // disallows crawling everything except the retired URLs handled by
        // the external-redirects middleware in server.js - nothing here is
        // meant to be indexed. With zero items the plugin skips writing
        // sitemap.xml entirely (no dangling reference to it belongs in
        // robots.txt).
        sitemap: {
          createSitemapItems: async () => [],
        },
      },
    ],
  ],

  plugins: [
    './plugins/chatbot-plugin.js',
    './plugins/api-routes-plugin.js',
    './plugins/access-gate-emit.js',
    [
      '@docusaurus/plugin-client-redirects',
      {
        redirects,
      },
    ],
  ],

  themeConfig: {
    image: 'img/smartwinnr-social-card.jpg',
    navbar: {
      title: 'SmartWinnr Help',
      logo: {
        alt: 'SmartWinnr Logo',
        src: 'img/logo_blue.svg',
        srcDark: 'img/logo_white.png',
        // The homepage lives at /home; bare / is a public 301 to the
        // marketing site (see the root handler in server.js). Without this
        // the logo defaults to baseUrl and ejects signed-in users.
        href: '/home',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Documentation',
        },
        {
          label: 'SmartWinnr App',
          href: 'https://app.smartwinnr.com',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            {
              label: 'Getting started',
              to: '/get-started/overview/',
            },
            {
              label: 'Modules',
              to: '/modules/',
            },
            {
              label: 'Release notes',
              to: '/release-notes/',
            },
          ],
        },
        {
          title: 'SmartWinnr',
          items: [
            {
              label: 'App Login',
              href: 'https://app.smartwinnr.com',
            },
            {
              label: 'Website',
              href: 'https://smartwinnr.com',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} SmartWinnr. All rights reserved.`,
    },
    prism: {
      theme: {
        plain: {
          color: "#393A34",
          backgroundColor: "#f6f8fa"
        },
        styles: [
          {
            types: ["comment", "prolog", "doctype", "cdata"],
            style: {
              color: "#999988",
              fontStyle: "italic"
            }
          }
        ]
      },
      darkTheme: {
        plain: {
          color: "#f8f8f2",
          backgroundColor: "#2b2b2b"
        },
        styles: [
          {
            types: ["comment", "prolog", "doctype", "cdata"],
            style: {
              color: "#8292a2",
              fontStyle: "italic"
            }
          }
        ]
      },
    },
  },
};

export default config;