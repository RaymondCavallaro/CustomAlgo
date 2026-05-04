# JS/TS Protocol And Adapter Survey

SocialLens is currently written in JavaScript and should probably move toward TypeScript as soon as the shared core becomes central. There is no single JDBC equivalent in the JS/TS ecosystem, but there are several protocol and adapter families that can support the same architectural goal: keeping SocialLens independent from one storage backend.

## Good Candidates

| Candidate | What It Is | Where It Fits | Notes |
| --- | --- | --- | --- |
| IndexedDB | Browser-native structured storage | Extension and PWA local database | Portable web baseline, but not a sync protocol |
| Dexie | JS wrapper over IndexedDB | Extension and PWA local adapter | Better API, queries, reactivity, and TypeScript ergonomics |
| SQLite | Embedded database | Mobile, desktop, server, possibly browser via WASM/OPFS | Strong cross-platform storage target |
| Kysely | Type-safe SQL query builder | Server and SQLite/Postgres adapters | Useful if SocialLens standardizes relational schemas |
| RxDB | Local-first JS database with many storages and replication options | PWA, mobile, desktop, extension if bundle size is acceptable | Very aligned with adapter-backed local-first architecture |
| CouchDB replication | HTTP JSON document sync protocol | Self-hosted/community sync adapter | Mature replication model; document shape fits tags/rules |
| PowerSync | Backend DB to client SQLite sync | Cross-platform app sync | Good fit if we choose SQLite as client truth |
| Automerge | CRDT document model and sync protocol | Shared lenses, collaborative rule packs, conflict-heavy data | Strong for merging, less natural for large queryable tag indexes |
| OpenAPI | Machine-readable HTTP API description | Server adapter contract | Good for documenting SocialLens sync APIs |
| GraphQL | Typed API query layer | App dashboard and networked search | Good for flexible reads, not itself a storage protocol |
| JSON:API | JSON resource API convention | Simple REST adapter | Useful if we want boring resource CRUD |
| Solid Protocol | User-controlled pods | User-owned data source adapter | Philosophically aligned, but integration cost and UX need validation |
| AT Protocol | Personal data repositories, Lexicon schemas, federation | Public tag feeds, labels, portable identity, future social graph | Very relevant to public/shared semantic layers |
| ActivityPub | Federated social protocol | Public sharing/federation with existing fediverse | Better for social activity delivery than private data ownership |
| WebDAV | HTTP file/resource storage | Simple user-controlled file backend | Useful as a basic export/import storage adapter, less ideal for indexed querying |

## Initial Recommendation

Do not pick one universal backend yet. Use SQLite as the default local data source and make PostgreSQL an optional remote/self-hosted data source through a sync/service adapter.

Use this staged approach:

1. Define SocialLens entities and the `LensDataSource` adapter in TypeScript.
2. Use SQLite for mobile and tablet local storage.
3. Use Dexie/IndexedDB for browser/PWA local storage when a browser SQL option is not appropriate.
4. Use PostgreSQL behind a user-configurable sync service, not directly from mobile clients.
5. Keep the sync contract backend-neutral with pull/push/checkpoint semantics.
6. Consider RxDB or PowerSync if we want an existing sync engine instead of writing one.
7. Keep AT Protocol and Solid as future interoperability adapters, not MVP dependencies.

For a SQL intermediary, prefer Drizzle below the SocialLens data-source contract. Drizzle has a documented Expo SQLite driver and PostgreSQL support, which fits the SQLite-default/Postgres-optional direction. Kysely remains attractive for server-side query building, but it is less directly aligned with Expo mobile. Prisma is strong for server apps but is heavier and less suitable as the mobile-local layer.

## Why This Direction

SocialLens data has two personalities:

- queryable records: tags, content references, contacts, trust weights, visibility rules
- mergeable documents: lens packs, algorithms, rule stacks, shared annotations

Queryable records fit IndexedDB/SQLite/RxDB well. Mergeable documents may eventually benefit from Automerge or another CRDT layer. It is reasonable for SocialLens to support both internally behind the data source boundary.

## Adapter Shape To Preserve

The SocialLens core should not know whether data comes from Chrome storage, IndexedDB, SQLite, CouchDB, Solid, AT Protocol, or a self-hosted server.

The adapter should hide:

- persistence engine
- sync engine
- auth mechanism
- encryption mechanism
- conflict strategy
- remote protocol

The core should see:

```ts
interface LensDataSource {
  getState(): Promise<LensState>;
  saveState(state: LensState): Promise<void>;
  queryTags(query: TagQuery): Promise<TagEntry[]>;
  addTag(tag: TagEntry): Promise<void>;
  removeTag(tagId: string): Promise<void>;
  listLayers(): Promise<LensLayer[]>;
  importLensPack(pack: LensPack): Promise<ImportResult>;
  exportLensPack(options: ExportOptions): Promise<LensPack>;
}
```

## Protocol Notes

### IndexedDB / Dexie

IndexedDB is the web baseline for structured local storage. It works offline and supports indexes, but synchronization must be implemented separately. Dexie is a practical JS wrapper that makes IndexedDB less awkward and gives better query ergonomics.

Use for:

- extension local storage after the MVP grows beyond `chrome.storage.local`
- PWA local database
- local cache for networked search

### SQLite / PowerSync

SQLite is the best common denominator for mobile and desktop. PowerSync is interesting because it treats client-side SQLite as the live local database and syncs from backend databases into it.

Use for:

- Android app
- iOS/iPadOS app
- future desktop app
- cross-platform offline-first sync

### RxDB

RxDB is worth watching closely because it offers multiple storage backends and replication plugins, including custom HTTP replication, GraphQL, CouchDB, WebRTC, and cloud providers. Its replication model has pull, push, and stream concepts similar to what SocialLens would need.

Use for:

- faster local-first MVP if custom sync becomes too expensive
- adapter experimentation
- offline-first PWA or mobile clients

### CouchDB / PouchDB Style Replication

CouchDB's replication protocol is mature, HTTP-based, JSON-document oriented, and designed for peer synchronization. It fits portable user data better than platform-specific cloud databases.

Use for:

- self-hosted sync adapter
- community data source
- JSON document replication inspiration

### Automerge

Automerge is useful when independent devices/users edit the same document concurrently and we want automatic merging. It is less directly suited to large indexed tag search unless paired with an index database.

Use for:

- collaborative algorithm/rule-pack editing
- mergeable lens documents
- conflict-safe shared curation sets

### AT Protocol

AT Protocol is very relevant to SocialLens because it has personal data repositories, signed public records, portable identity, federation, and Lexicon schemas. Its public-data orientation is powerful for shared tags and label feeds, but private tags/circles need careful handling.

Use for:

- public tag feeds
- public labels/classifications
- portable identity
- future social graph interoperability

### Solid

Solid is philosophically aligned with user-owned data pods. It could become an optional user data source adapter if users want their SocialLens data in a pod.

Use for:

- user-controlled storage experiments
- privacy-forward user data hosting

### OpenAPI / GraphQL / JSON:API

These are API contract styles, not storage engines. They are still useful for defining the SocialLens sync API or server API.

Use for:

- OpenAPI: boring, generator-friendly REST contract
- GraphQL: flexible dashboard/search queries
- JSON:API: simple resource representation if REST stays minimal

## Current Project Implication

The current extension uses `chrome.storage.local`, which is fine as a prototype adapter. Before adding web/mobile/sync, create a real adapter implementation:

```txt
packages/sociallens-core
  data-source contract
packages/sociallens-storage-indexeddb
  Dexie adapter
packages/sociallens-storage-sqlite
  SQLite adapter
packages/sociallens-sync-http
  pull/push/checkpoint adapter
```

This keeps the project open to user-configurable data sources without forcing that complexity into the first usable build.
