# Language

- Versao em Portugues: [README.md](README.md)
- English version (this one)

# CustomAlgo

Early prototype for a personal, composable layer of social algorithms, tags, trust, and networked discovery.

The project also uses **SocialLens** as the product name for the first experience: a local-first lens that lets users classify posts, authors, and domains, apply hide/dim/boost/badge rules, and prepare a path for selective sharing of tags, algorithms, and data sources.

Made largely with AI.

## What This Is

CustomAlgo explores the idea that users should be able to compose their own feed and search experience:

- tag content, authors, domains, and eventually contacts
- create personal rules over those classifications
- import tags and algorithms from other people
- choose who to trust by context
- stack tag, rule, and filter layers like a commit stack
- keep the option to choose where their own data lives

The goal is not to build a new social network first. The goal is to build a layer over existing platforms and later expand that into networked search and discovery.

## Mandatory Surfaces

The browser extension is only the first client, not the whole product.

The project should keep pointing toward:

- desktop browsers
- mobile browsers
- Android
- iOS
- iPadOS
- responsive web/PWA

On mobile, the experience should combine app, share sheet, PWA, in-app browser, and extension support where the operating system allows it.

## Current Prototype

The current version has a Manifest V3 extension scaffold with:

- simple overlay for social pages and articles
- local tags for content, author, and domain
- local rules for `hide`, `dim`, `boost`, and `badge`
- popup for mode and layers
- options page for quick tags, rules, tag database, and import/export
- initial `packages/sociallens-core` package to separate shared logic from clients
- architecture docs for platform direction, data-source protocol, and lens format

## Core Model

```txt
Content = what exists
Tags = claims people make about content, authors, or domains
Trust = whose claims matter in which context
Algorithms = rules that act on trusted tags
Layers = ordered imports, overrides, and personal rules
Permissions = who can see or use each layer
Data source = where the user's data lives
```

## Run The Extension Locally

1. Open Chrome or Edge.
2. Go to `chrome://extensions`.
3. Enable Developer Mode.
4. Choose Load unpacked.
5. Select this folder: `C:\dev\git\CustomAlgo`.

## Project Structure

```txt
apps/
  README.md
packages/
  sociallens-core/
    data-source.js
    index.js
    state.js
    rules.js
    lens.js
manifest.json
src/
  background.js
  shared/
  content/
  popup/
  options/
docs/
  platform-architecture.md
  data-source-protocol.md
  protocol-survey-js-ts.md
  product-brief.md
  lens-format.md
```

## Important Docs

- [`docs/product-brief.md`](docs/product-brief.md)
- [`docs/platform-architecture.md`](docs/platform-architecture.md)
- [`docs/data-source-protocol.md`](docs/data-source-protocol.md)
- [`docs/protocol-survey-js-ts.md`](docs/protocol-survey-js-ts.md)
- [`docs/lens-format.md`](docs/lens-format.md)

## Next Steps

1. Move the extension into `apps/browser-extension` once the shared core is more fully wired.
2. Migrate the core to TypeScript.
3. Create a real storage adapter before adding web/mobile/sync.
4. Start `apps/web` as a responsive PWA for tags, rules, layers, circles, and search.
5. Start `apps/mobile` for Android, iOS, and iPadOS using the same core.
6. Add mobile share-sheet capture.
7. Improve platform extractors for stable post and account IDs.

## Status

This is a concept test, not a finished product.

The goal right now is to keep the architecture easy to change while the idea of personal algorithms, shareable tags, contextual trust, and configurable user data sources becomes clearer.
