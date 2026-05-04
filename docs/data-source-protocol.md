# Data Source Protocol

SocialLens should eventually let users choose where their own data lives.

The project should not assume that tags, rules, contacts, trust weights, or layer imports must live in one company-owned database. A user may want:

- local-only device storage
- encrypted cloud sync
- their own server
- a community server
- a Git repository
- a Solid pod
- a personal database
- an enterprise/team data source

## JDBC-Like Analogy

Java applications can talk to many databases through JDBC because the app depends on a common interface instead of a specific database implementation.

SocialLens should eventually have a similar concept:

```txt
SocialLens clients
  -> Lens data source interface
    -> local storage adapter
    -> encrypted sync adapter
    -> personal server adapter
    -> community server adapter
    -> future decentralized adapter
```

This does not need to be built now. The important thing is to preserve the architecture so it remains possible.

## What The Protocol Must Cover

The future interface should support:

- reading and writing the user's lens state
- querying tags by content, author, domain, source user, and time
- querying tag applications by target, tag, creator, layer, and permission
- tagging tags and tag applications as first-class targets
- importing and exporting lens packs
- syncing changes incrementally
- preserving provenance for imported tags and rules
- handling circles, visibility, and permissions
- working offline first
- supporting encryption before data leaves a device when the user wants privacy

## Minimum Adapter Shape

This is a sketch, not a stable API:

```ts
interface LensDataSource {
  getProfile(): Promise<LensProfile>;
  getState(): Promise<LensState>;
  saveState(state: LensState): Promise<void>;

  queryTags(query: TagQuery): Promise<TagEntry[]>;
  addTag(tag: TagEntry): Promise<void>;
  removeTag(tagId: string): Promise<void>;

  listLayers(): Promise<LensLayer[]>;
  importLensPack(pack: LensPack): Promise<ImportResult>;
  exportLensPack(options: ExportOptions): Promise<LensPack>;

  subscribeToChanges?(cursor?: string): AsyncIterable<LensChange>;
}
```

## Design Rule

Clients should not call a specific backend directly for lens data. They should call an adapter that satisfies the SocialLens data source contract.

For the current MVP, `chrome.storage.local` is acceptable inside the browser extension. As soon as there is a web app or mobile app, storage access should be routed through a shared adapter boundary.

## Why This Matters

User-owned algorithms only stay user-owned if the user can move or self-host the underlying data.

The long-term promise is:

```txt
Your tags.
Your trust graph.
Your circles.
Your algorithms.
Your data source.
```

## Related Survey

See `docs/protocol-survey-js-ts.md` for a survey of protocols and JS/TS ecosystem options that could support this adapter direction.

## Current Storage Direction

See `docs/storage-strategy.md` for the current decision: SQLite as the default local database and PostgreSQL as an optional user-controlled remote data source through a sync/service adapter.
