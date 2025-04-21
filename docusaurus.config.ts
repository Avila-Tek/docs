import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'Engineering docs - Avila Tek',
  tagline: 'This is the official documentation for Engineering of Avila Tek',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://docs.avilatek.com',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'Avila-Tek', // Usually your GitHub org/user name.
  projectName: 'docs', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'es',
    locales: ['es'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/avila-Tek',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
        blog: {
          blogTitle: 'Tek news',
          blogDescription: '...',
          postsPerPage: 20,
          showReadingTime: true,
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    navbar: {
      title: 'Engineering Docs - Avila Tek',
      logo: {
        alt: 'Avila Tek',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Bienvenido(a)',
        },
        {
          to: 'blog',
          label: 'Blog',
          position: 'left',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Introducción',
              to: '/docs/welcome',
            },
            {
              label: 'Frontend',
              to: '/docs/front-end',
            },
            {
              label: 'Backend',
              to: '/docs/back-end',
            },
            {
              label: 'Mobile',
              to: '/docs/mobile',
            },
            {
              label: 'DevOps',
              to: '/docs/dev-ops',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'LinkedIn',
              href: 'https://www.linkedin.com/company/avilatek',
            },
            {
              label: 'TikTok',
              href: 'https://www.tiktok.com/@avilatek',
            },
            {
              label: 'Instragram',
              href: 'https://www.instagram.com/avilatek',
            },
            {
              label: 'X',
              href: 'https://x.com/avilatekdev',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Website',
              to: 'https://avilatek.com',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/Avila-Tek/docs',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Avila Tek, LLC. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['dart'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
