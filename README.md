# docs.harvesterhci.io

This website is built using [Material for MkDocs](https://squidfunk.github.io/mkdocs-material/), a modern static website generator.

## Installation

Please refer to this [doc](https://squidfunk.github.io/mkdocs-material/customization/#environment-setup) to set up your local development environment.
After following those instructions, while in the same `mkdocs-material` repository on your local machine, please additionally install:
```
pip install mkdocs-render-swagger-plugin
```
As referenced [here](https://github.com/bharel/mkdocs-render-swagger-plugin).

## Local Development

Edit [`mkdocs.yml`](./mkdocs.yml) to disable strict mode: 
```yaml
# Set to false for local docs development
strict: false
```

And run the builtin development server:
```console
mkdocs serve

# or run the server on certain IP and port:
mkdocs serve -a <IP>:<PORT>
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
