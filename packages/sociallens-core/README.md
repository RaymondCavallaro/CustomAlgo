# `@sociallens/core`

Shared, platform-neutral SocialLens logic.

Every client should depend on this package instead of re-implementing the algorithm:

- browser extension
- web/PWA app
- Android app
- iOS/iPadOS app
- future desktop app

The package owns:

- lens state shape
- tag normalization
- rule evaluation
- layer toggling
- import/merge helpers
- data source interface vocabulary

Clients own:

- platform extraction
- UI
- local storage adapter
- sync adapter
- native share/browser hooks

## Future Data Sources

The core package should remain storage-neutral. Browser extension storage, mobile SQLite, encrypted cloud sync, and self-hosted servers should all sit behind a common data source adapter.

See `docs/data-source-protocol.md` for the JDBC-like direction.

The placeholder module `data-source.js` exposes `assertLensDataSource` and `UnsupportedLensDataSource` as a lightweight boundary marker. It is not a full protocol yet; it exists so future clients have a named place to integrate storage adapters.
