import {Config} from '@docusaurus/types';
import * as fs from 'node:fs';
import * as path from 'node:path';

// Load IA-migration redirects emitted by scripts/migrate-ia.js.
// Strip trailing /index since Docusaurus serves index.md at the directory URL,
// and de-dupe (since collapsing /index can produce identical entries).
type RedirectEntry = {from: string; to: string};
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
const seen = new Set<string>();
const redirects: RedirectEntry[] = [];
for (const r of rawRedirects) {
  const from = normPath(r.from);
  const to = normPath(r.to);
  if (from === to) continue;
  const key = from + '→' + to;
  if (seen.has(key)) continue;
  seen.add(key);
  redirects.push({from, to});
}

const config: Config = {
  title: 'SmartWinnr Help Center',
  tagline: 'Private Documentation for SmartWinnr Users',
  favicon: 'img/favicon.ico',

  url: 'https://help.smartwinnr.com',
  baseUrl: '/',

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',
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
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: '/',
          editUrl: 'https://gitlab.com/smartwinnr/help-docs/edit/main/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
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