import {Config} from '@docusaurus/types';

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
              label: 'Getting Started',
              to: '/getting-started',
            },
            {
              label: 'Quiz',
              to: '/quiz',
            },
            {
              label: 'Competitions',
              to: '/competitions',
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