# docs.harvesterhci.io

This website is built using [Material for MkDocs](https://squidfunk.github.io/mkdocs-material/), a modern static website generator.

## Installation

```console
yarn install
```

## Local Development

```console
mkdocs serve
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

## Build

```console
mkdocs build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

## Deployment

https://squidfunk.github.io/mkdocs-material/publishing-your-site/

```console
mkdocs gh-deploy --force
```

If you are using GitHub pages for hosting, this command is a convenient way to build the website and push to the `gh-pages` branch.
