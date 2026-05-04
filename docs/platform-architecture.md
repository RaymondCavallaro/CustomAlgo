# Platform Architecture

SocialLens must be usable on phones, tablets, and desktop browsers. The browser extension is only one client.

## Mandatory Surfaces

| Surface | Required Role | First Useful Form |
| --- | --- | --- |
| Desktop browsers | Full overlay on social feeds and web pages | Chrome/Edge extension, then Firefox/Safari |
| Mobile browsers | Tag links/pages and use lenses while browsing | PWA plus Safari/Android share extensions |
| iOS | Manage tags, rules, contacts, circles, and shared lenses | Native app or React Native app |
| iPadOS | Same as iOS, with richer review/search workspace | Tablet layout in the same app |
| Android | Manage tags/rules and tag content from share intents | Native app or React Native app |
| Web app | Cross-device dashboard and networked search | Responsive PWA |

## Important Mobile Constraint

Mobile operating systems do not allow the same universal page overlay that desktop browser extensions allow. The product needs several entry points:

- desktop extension for direct feed overlays
- web/PWA app for dashboard, search, rules, trust, and imports
- mobile share sheet for tagging URLs from any app
- mobile in-app browser for pages where SocialLens controls the reading surface
- platform-specific browser extension support where available, especially Safari-style web extensions

This means the core product is not "an extension." The core product is the lens data model and algorithm engine.

## Proposed Repo Shape

```txt
packages/
  sociallens-core/
    state, tags, rules, layers, import/export
apps/
  browser-extension/
    desktop browser overlay
  web/
    responsive PWA dashboard and search
  mobile/
    iOS, iPadOS, Android app
services/
  sync-api/
    optional encrypted sync and sharing
docs/
  platform-architecture.md
  data-source-protocol.md
  storage-strategy.md
  tag-native-semantics.md
  default-lens-packs.md
  converters-and-importers.md
  ipad-usage.md
  social-integrations.md
  product-brief.md
  lens-format.md
```

The current repository has the extension at the root for speed, but the new `packages/sociallens-core` directory starts the split toward this shape.

## Client Responsibilities

### Browser Extension

- detect posts/accounts/domains on supported sites
- overlay tag controls and badges
- apply hide/dim/boost rules locally
- export/import lens JSON

### Web/PWA App

- manage tags, rules, contacts, circles, and layers
- search saved/tagged/imported content
- inspect disagreements and provenance
- work on desktop, tablet, and mobile browsers

### Mobile App

- receive URLs from the native share sheet
- tag pages, accounts, videos, domains, and notes
- manage circles and visibility before sharing tags
- provide a SocialLens in-app browser for pages where overlay behavior is needed
- sync local encrypted lens data when the user opts in
- use SQLite as the default local database

### Sync/Sharing Service

- not required for the local MVP
- required for cross-device use, tag sharing, trust subscriptions, and circles
- should be designed so private local use still works without an account

### Data Source Adapter

- not required for the first extension prototype
- required before the product depends on multiple clients or sync backends
- should act like a JDBC-style boundary for SocialLens data
- lets users eventually choose local storage, encrypted cloud sync, self-hosted storage, community servers, or other backends
- keeps the lens protocol independent from any one company-owned database

## Data Principle

All clients should read and write the same lens format:

```txt
Content references
+ tag claims
+ trust weights
+ visibility rules
+ ordered layers
+ algorithms
= user's composed view
```

That is what makes Android, iOS, iPadOS, web, and desktop browser behavior feel like one product.

The same principle applies to storage. SocialLens should depend on a common data source contract, not a single hard-coded backend.

See `docs/ipad-usage.md` for the concrete iPad development and usage path.
