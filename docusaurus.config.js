// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').DocusaurusConfig} */
const config = {
  title: "Harvester",
  tagline: "The open-source hyperconverged infrastructure solution for a cloud-native world",
  url: "https://docs.harvesterhci.io",
  baseUrl: "/",
  onBrokenLinks: "warn",
  onBrokenMarkdownLinks: "warn",
  favicon: "img/favicon.ico",
  organizationName: "harvester",
  projectName: "docs",
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
    localeConfigs: {
      en: {
        label: "English",
      },
      zh: {
        label: "简体中文",
      },
    },
  },
  webpack: {
    jsLoader: (isServer) => ({
      loader: require.resolve("swc-loader"),
      options: {
        jsc: {
          parser: {
            syntax: "typescript",
            tsx: true,
          },
          target: "es2019",
          transform: {
            react: {
              runtime: "automatic",
            },
          },
        },
        module: {
          type: isServer ? "commonjs" : "es6",
        },
      },
    }),
  },
  themes: ["docusaurus-theme-openapi-docs"],
  presets: [
    [
      'classic',
      ({
        docs: {
          routeBasePath: '/',
          sidebarPath: require.resolve("./sidebars.js"),
          showLastUpdateTime: true,
          editUrl: "https://github.com/harvester/docs/edit/main/",
          docItemComponent: "@theme/ApiItem",
          lastVersion: 'v1.3',
          versions: {
            current: {
              label: 'v1.4 (dev)',
              path: 'v1.4',
            },
            "v1.3": {
              label: 'v1.3 (latest)',
              path: 'v1.3',
              banner: `none`
            },
            "v1.2": {
              label: 'v1.2',
              path: 'v1.2',
              banner: `none`
            },
            "v1.1": {
              label: 'v1.1 (EOL)',
              path: 'v1.1',
              banner: `unmaintained`
            },
            "v1.0": {
              label: 'v1.0 (EOL)',
              path: 'v1.0',
              banner: `unmaintained`
            },
            "v0.3": {
              label: 'v0.3 (EOL)',
              path: 'v0.3',
              banner: `unmaintained`
            }
          }
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
        googleTagManager: {
          containerId: 'GTM-57KS2MW',
        },
      }),
    ],
  ],
  themeConfig: {
    zoom: {},
    algolia: {
      appId: 'U7QCSJFCWR',
      apiKey: '954c1b1327687e818ef6930a5e8f8770',
      indexName: 'harvester',
      contextualSearch: true,
      searchParameters: {},
      // Optional: path for search page that enabled by default (`false` to disable it)
      searchPagePath: 'search',
    },
    docs: {
      sidebar: {
        hideable: true,
      },
    },
    navbar: {
      logo: {
        alt: "Harvester Logo",
        src: "img/logo_horizontal.svg",
      },
      items: [
        {
          type: 'docsVersionDropdown',
          position: 'left',
          dropdownActiveClassDisabled: true,
        },
        {
          type: 'docSidebar',
          label: 'API',
          position: 'left',
          sidebarId: 'api',
        },
        {
          type: "localeDropdown",
          position: "left",
        },
        {
          type: 'search',
          position: 'left',
        },
        {
          type: 'dropdown',
          label: 'Quick Links',
          position: 'right',
          items: [
            {
              href: "https://harvesterhci.io/",
              label: "Harvester Home",
            },
            {
              href: 'https://github.com/harvester/harvester',
              label: 'GitHub',
            },
            {
              href: 'https://github.com/harvester/docs',
              label: 'Docs GitHub',
            },
            {
              href: "https://harvesterhci.io/kb",
              label: "Knowledge Base",
            },
            {
              href: "https://www.suse.com/c/?s=harvester",
              label: "Blog",
            },
          ],
        },
        {
          type: 'dropdown',
          label: 'More from SUSE',
          position: 'right',
          items: [
            {
              href: 'https://www.rancher.com',
              label: 'Rancher',
              className: 'navbar__icon navbar__rancher',
            },
            {
              type: 'html',
              value: '<hr style="margin: 0.3rem 0;">',
            },
            {
              href: 'https://elemental.docs.rancher.com/',
              label: 'Elemental',
              className: 'navbar__icon navbar__elemental',
            },
            {
              href: 'https://fleet.rancher.io/',
              label: 'Fleet',
              className: 'navbar__icon navbar__fleet',
            },
            {
              href: 'https://rancherdesktop.io/',
              label: 'Rancher Desktop',
              className: 'navbar__icon navbar__rancherdesktop',
            },
            {
              type: 'html',
              value: '<hr style="margin: 0.3rem 0;">',
            },
            {
              href: 'https://opensource.suse.com/',
              label: 'More Projects...',
              className: 'navbar__icon navbar__suse',
            },
          ],
      },
      ],
    },
    colorMode: {
      // "light" | "dark"
      defaultMode: "light",

      // Hides the switch in the navbar
      // Useful if you want to support a single color mode
      disableSwitch: false,
    },
    footer: {
      style: "dark",
      links: [],
      copyright: `Copyright © ${new Date().getFullYear()} SUSE Rancher. All Rights Reserved.`,
    },
    prism: {
      theme: lightCodeTheme,
      darkTheme: darkCodeTheme,
      additionalLanguages: ['hcl'],
    },
    languageTabs: [
      {
        highlight: "bash",
        language: "curl",
        logoClass: "bash",
      },
      {
        highlight: "python",
        language: "python",
        logoClass: "python",
        variant: "requests",
      },
      {
        highlight: "go",
        language: "go",
        logoClass: "go",
      },
      {
        highlight: "javascript",
        language: "nodejs",
        logoClass: "nodejs",
        variant: "axios",
      }
    ]
  },
  customFields: {
    title: "Harvester - Open-source hyperconverged infrastructure",
    description:
      "The open-source hyperconverged infrastructure solution for a cloud-native world",
  },
  plugins: [
    require.resolve('docusaurus-plugin-image-zoom'),
    [
      '@docusaurus/plugin-client-redirects',
      {
        redirects: [
          { // Redirects for links in the Harvester README.md file
            to: '/v1.1/install/pxe-boot-install',
            from: '/latest/install/pxe-boot-install'
          },
        ],
      },
    ],
    [
      "docusaurus-plugin-openapi-docs",
      {
        id: "api",
        docsPluginId: "classic", // e.g. "classic" or the plugin-content-docs id
        config: {
          api: { // "api" is considered the <id> that you will reference in the CLI
            specPath: "api/dev-swagger.json", // path or URL to the OpenAPI spec
            outputDir: "docs/api", // output directory for generated *.mdx and sidebar.js files
            sidebarOptions: {
              groupPathsBy: "tag", // generate a sidebar.js slice that groups operations by tag
              categoryLinkSource: "tag",
            },
            version: "dev", // Current version
            label: "dev", // Current version label
            baseUrl: "/dev/api", // Leading slash is important
            versions: {
              "v1.3": {
                specPath: "api/v1.3-swagger.json",
                outputDir: "versioned_docs/version-v1.3/api", // No trailing slash
                label: "v1.3",
                baseUrl: "/v1.3/api", // Leading slash is important
              },
              "v1.2": {
                specPath: "api/v1.2-swagger.json",
                outputDir: "versioned_docs/version-v1.2/api", // No trailing slash
                label: "v1.2",
                baseUrl: "/v1.2/api", // Leading slash is important
              },
              "v1.1": {
                specPath: "api/v1.1-swagger.json",
                outputDir: "versioned_docs/version-v1.1/api", // No trailing slash
                label: "v1.1",
                baseUrl: "/v1.1/api", // Leading slash is important
              },
            },
          },
        },
      },
    ],
  ],
};

module.exports = config;
