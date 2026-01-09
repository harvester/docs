// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const {themes} = require('prism-react-renderer');
const lightCodeTheme = themes.github;
const darkCodeTheme = themes.dracula;

/** @type {import('@docusaurus/types').DocusaurusConfig} */
const config = {
  title: "Harvester",
  tagline: "The open-source hyperconverged infrastructure solution for a cloud-native world",
  url: "https://docs.harvesterhci.io",
  baseUrl: "/",
  onBrokenLinks: "warn",
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: "warn",
    },
  },
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
  future: {
    v4: true,
    experimental_faster: true,
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
          lastVersion: 'v1.7',
          versions: {
            current: {
              label: 'v1.8 (Dev)',
              path: 'v1.8',
            },
            "v1.7": {
              label: 'v1.7 (Latest)',
              path: 'v1.7',
            },
            "v1.6": {
              label: 'v1.6',
              path: 'v1.6',
              banner: `none`
            },
            "v1.5": {
              label: 'v1.5',
              path: 'v1.5',
              banner: `none`
            },
            "v1.4": {
              label: 'v1.4 (EOL)',
              path: 'v1.4',
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
        createRedirects(existingPath) {
          if (existingPath.includes('/v1.6')) {
            return [existingPath.replace('/v1.6', '/latest')];
          }
          return undefined;
        },
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
              "v1.7": {
                specPath: "api/v1.7-swagger.json",
                outputDir: "versioned_docs/version-v1.7/api", // No trailing slash
                label: "v1.7",
                baseUrl: "/v1.7/api", // Leading slash is important
              },
              "v1.6": {
                specPath: "api/v1.6-swagger.json",
                outputDir: "versioned_docs/version-v1.6/api", // No trailing slash
                label: "v1.6",
                baseUrl: "/v1.6/api", // Leading slash is important
              },              
              "v1.5": {
                specPath: "api/v1.5-swagger.json",
                outputDir: "versioned_docs/version-v1.5/api", // No trailing slash
                label: "v1.5",
                baseUrl: "/v1.5/api", // Leading slash is important
              },              
              "v1.4": {
                specPath: "api/v1.4-swagger.json",
                outputDir: "versioned_docs/version-v1.4/api", // No trailing slash
                label: "v1.4",
                baseUrl: "/v1.4/api", // Leading slash is important
              }
            },
          },
        },
      },
    ],
  ],
  scripts: [
    {
      src: 'https://cdn.cookielaw.org/scripttemplates/otSDKStub.js',
      type:'text/javascript',
      charset: 'UTF-8',
      'data-domain-script': '019aa0c6-dbb5-77a5-9e27-54cc31a91bba',
      async: true
    },
    {
      src: '/scripts/optanonwrapper.js',
      type:'text/javascript',
      async: true
    },
  ],
};

module.exports = config;
