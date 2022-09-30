// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').DocusaurusConfig} */
const config = {
  title:
    "The open source hyperconverged infrastructure (HCI) solution for a cloud native world",
  tagline: "",
  url: "https://docs.harvesterhci.io",
  baseUrl: "/",
  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",
  favicon: "img/favicon.ico",
  organizationName: "harvester",
  projectName: "docs",
  i18n: {
    defaultLocale: "en",
    locales: ["en", "zh"],
    localeConfigs: {
      en: {
        label: "English",
      },
      zh: {
        label: "简体中文",
      },
    },
  },
  presets: [
    [
      'classic',
      ({
        docs: {
          routeBasePath: '/',
          sidebarPath: require.resolve("./sidebars.js"),
          showLastUpdateTime: true,
          editUrl: "https://github.com/harvester/docs/edit/main/",
          versions: {
            current: {
              label: 'v1.1-dev 🚧',
            },
            "v1.0": {
              path: "v1.0",
            }
          }
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      }),
    ],
  ],
  themeConfig: {
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
          position: 'right',
          dropdownActiveClassDisabled: true,
        },
        {
          type: "localeDropdown",
          position: "right",
        },
        {
          type: 'doc',
          docId: 'index',
          position: "right",
          label: "Docs",
          className: "navbar__docs",
        },
        {
          href: "https://www.suse.com/c/?s=harvester",
          position: "right",
          label: "Blog",
          className: "navbar__blog",
        },
        {
          href: "https://harvesterhci.io/kb",
          position: "right",
          label: "Knowledge Base",
          className: "navbar__kb",
        },
        {
          href: "https://github.com/harvester/harvester",
          label: "GitHub",
          position: "right",
          className: "navbar__github btn btn-secondary icon-github",
        },
      ],
    },
    colorMode: {
      // "light" | "dark"
      defaultMode: "light",

      // Hides the switch in the navbar
      // Useful if you want to support a single color mode
      disableSwitch: true,
    },
    footer: {
      style: "dark",
      links: [],
      copyright: `Copyright © ${new Date().getFullYear()} harvesterhci.io`,
    },
    prism: {
      theme: lightCodeTheme,
      darkTheme: darkCodeTheme,
    },
  },
  customFields: {
    title: "Harvester - Open-source hyperconverged infrastructure",
    description:
      "An open-source hyperconverged infrastructure (HCI) software for a cloud-native world",
  },
  plugins: [],
};

module.exports = config;