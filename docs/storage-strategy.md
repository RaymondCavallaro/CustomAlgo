# Storage Strategy

SocialLens should use SQLite as the default local database and allow advanced users to connect their own PostgreSQL-backed data source later.

## Recommendation

Use three layers:

```txt
SocialLens core
  -> LensDataSource contract
    -> SQL repository adapter
      -> SQLite adapter
      -> PostgreSQL adapter
```

The common intermediary should be the project-owned `LensDataSource` interface, not a third-party ORM by itself. The ORM/query layer should sit below that interface.

## Best Fit: Drizzle Under The Adapter

For the SQL implementation, Drizzle is the best current fit:

- supports Expo SQLite, which matters for Android, iOS, and iPadOS
- supports PostgreSQL through standard JS drivers
- keeps schema definitions close to TypeScript
- provides migrations through Drizzle Kit
- is lighter than Prisma for mobile/local-first use
- is more mobile-aligned than Kysely because it has a documented Expo SQLite driver

The core package should not import Drizzle directly. Instead:

```txt
packages/sociallens-core
  LensDataSource types and domain logic

packages/sociallens-storage-sql
  shared schema vocabulary and repository behavior

packages/sociallens-storage-sqlite
  Expo SQLite / local SQLite implementation

services/sync-api
  PostgreSQL implementation for self-hosted or managed sync
```

## SQLite Default

SQLite is the default data source for:

- mobile app
- tablet app
- future desktop app
- offline-first local data
- private user-owned local tags

For Expo mobile, use `expo-sqlite`.

Important detail: SQLite on mobile should be treated as the user's local source of truth. Sync is an optional layer over it, not a requirement for using the app.

## PostgreSQL Option

PostgreSQL should be supported as a user-configurable remote data source, but mobile clients should not connect directly to Postgres with raw database credentials.

Preferred model:

```txt
iPad / mobile / browser client
  -> SocialLens Sync API
    -> user's PostgreSQL database
```

This avoids putting database credentials on a phone or browser and lets a user self-host the sync service.

Possible PostgreSQL targets:

- user's own Postgres server
- Supabase
- Neon
- local network Postgres
- enterprise/team Postgres

## Why Not Direct Postgres From iPad

Direct database access from an iPad app is a poor default because:

- credentials would live on the device
- firewall/network setup is brittle
- Postgres wire protocol is not browser/mobile friendly
- permission models need an application layer anyway
- offline use still needs local SQLite

So Postgres should be a sync/storage backend, not the first mobile persistence layer.

## Schema Design Rules

Keep the schema portable across SQLite and Postgres:

- use text IDs instead of database-specific auto IDs
- store timestamps as ISO strings or integer milliseconds
- store JSON as text in SQLite and JSONB in Postgres behind adapters
- avoid triggers and stored procedures in the portable layer
- keep migrations explicit and versioned
- preserve provenance: `source_user`, `source_layer`, `import_id`, `created_at`

## Current Direction

1. Define durable TypeScript types for `LensState`, `Entity`, `Tag`, `TagApplication`, `Rule`, `Layer`, `Contact`, `Circle`, and `TrustEdge`.
2. Add a SQLite data source for mobile using Expo SQLite.
3. Add a Postgres-backed sync service later.
4. Keep social/API imports writing through the same `LensDataSource` contract.
5. Store tags and tag applications as first-class records so tags can tag tags and tag applications.

## Sources

- Expo SQLite: https://docs.expo.dev/versions/latest/sdk/sqlite/
- Drizzle Expo SQLite: https://orm.drizzle.team/docs/connect-expo-sqlite
- Drizzle PostgreSQL: https://orm.drizzle.team/docs/get-started-postgresql
- Kysely dialects: https://kysely-org.github.io/kysely-apidoc/interfaces/Dialect.html
- Prisma supported databases: https://docs.prisma.io/docs/orm/core-concepts/supported-databases
