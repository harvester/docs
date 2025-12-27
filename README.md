# docs.harvesterhci.io

This website is built using [Docusaurus 2](https://docusaurus.io/), a modern
static website generator.

## File Location

Before you contribute, please read the table below first to ensure that you are
modifying the correct files:

| Path                                 | Version       | URL         |
| ------------------------------------ | ------------- | ----------- |
| docs/hello.md                        | v1.8 (Dev)    | /v1.8/hello |
| versioned_docs/version-v1.7/hello.md | v1.7 (Latest) | /v1.7/hello |
| versioned_docs/version-v1.6/hello.md | v1.6          | /v1.6/hello |
| versioned_docs/version-v1.5/hello.md | v1.5          | /v1.5/hello |
| versioned_docs/version-v1.4/hello.md | v1.4          | /v1.4/hello |
| versioned_docs/version-v1.3/hello.md | v1.3          | /v1.3/hello |
| versioned_docs/version-v1.2/hello.md | v1.2          | /v1.2/hello |
| versioned_docs/version-v1.1/hello.md | v1.1          | /v1.1/hello |
| versioned_docs/version-v1.0/hello.md | v1.0          | /v1.0/hello |
| versioned_docs/version-v0.3/hello.md | v0.3          | /v0.3/hello |

## Installation

Install docusaurus and all necessary dependencies for developing with:

```console
yarn install
```

## Local Development

Generate API docs with:

```console
yarn gen-api-docs
```

Start a local development server with live updates for most changes with:

```console
yarn start
```

Clean out the generated artifacts in the cache with:

```console
yarn clear
yarn clean-api-docs
```

## Build

```console
yarn build
```

This command generates static content into the `build` directory and can be
served using any static contents hosting service. The build may take a while.

### Generate PDF

First, the docs need to be served on a local dev server. You can do that with:

```console
yarn start > /dev/null 2>&1 &
```

When they are successfully generated and served at `localhost:3000` the PDF can
be generated with

```console
yarn gen-pdf-docs
```

## Deployment

```console
GIT_USER=<Your GitHub username> USE_SSH=true yarn deploy
```

If you are using GitHub pages for hosting, this command is a convenient way to
build the website and push to the `gh-pages` branch.

## Updating API docs

To update the API docs for the dev-version, replace `api/dev-swagger.json` with
a freshly generated swagger file from the main branch of the
harvester/harvester repo.
To create a new version of the API docs, place the `api/v1.x-swagger.json` file
and update the docusaurus.config.js file in the appropriate section for the API
docs:

```
[...]

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
              },                
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

[...]
```
Once either of these two steps are done, clean out all generated content and
re-generate the API docs:

```console
yarn clear
yarn clean-api-docs
yarn gen-api-docs
```

## Troubleshooting

If you encounter out-of-memory errors with the local development server or while
generating the static website you can allow NodeJS to consume more memory:

```console
export NODE_OPTIONS='--max-old-space-size=7168'
yarn start
```
