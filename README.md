# docs.harvesterhci.io

This website is built using [Docusaurus 2](https://docusaurus.io/), a modern static website generator.

## File Location

Before you contribute, please read the table below first to ensure that you are modifying the correct files:

| Path                                 | Version                | URL         |
| ------------------------------------ | ---------------------- | ----------- |
| docs/hello.md                        | v1.2 (current, stable) | /v1.2/hello |
| versioned_docs/version-v1.1/hello.md | v1.1                   | /v1.1/hello |
| versioned_docs/version-v1.0/hello.md | v1.0                   | /v1.0/hello |
| versioned_docs/version-v0.3/hello.md | v0.3                   | /v0.3/hello |

## Installation

```console
yarn install
```

## Local Development

```console
yarn start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

## Build

```console
yarn build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

## Deployment

```console
GIT_USER=<Your GitHub username> USE_SSH=true yarn deploy
```

If you are using GitHub pages for hosting, this command is a convenient way to build the website and push to the `gh-pages` branch.
