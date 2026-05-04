# Social Network Integrations

The first stage of SocialLens should focus on social networks.

Integrations must be optional. A user should be able to use SocialLens without connecting any social account.

## Integration Principle

Social connectors are import/capture sources, not the core product.

```txt
Social API / RSS / share sheet / browser extension
  -> content references
  -> tags and observations
  -> LensDataSource
  -> user's rules and layers
```

The user chooses which sources to connect.

## First Connectors

### RSS

RSS should be the first network-like connector because it is open, simple, stable, and does not require OAuth.

Use it for:

- blogs
- news sites
- podcasts
- newsletters with feeds
- public project updates

RSS items should become content references that users can tag, filter, and search.

### X / Twitter

Use X API v2 as an optional connector.

Start with:

- import public posts by URL
- optionally use recent search where the user's API access allows it
- store only normalized content references and user tags locally

Do not assume every user will have useful X API access. The connector should degrade gracefully to URL/share capture.

### Facebook

Use Meta Graph API as an optional connector, but be conservative.

Facebook user and page access is permission-heavy and subject to app review. The first useful scope should be:

- user shares a Facebook URL into SocialLens
- SocialLens stores a content reference
- if the user connects a Meta account and grants permissions, enrich references where allowed

Do not design the MVP around broad Facebook feed scraping. Treat Graph API enrichment as optional.

## Optional Account Model

Users can choose:

```txt
No connected socials
  -> manual tags, browser extension, share sheet, RSS

Connected X
  -> import/enrich X content within API limits

Connected Facebook
  -> import/enrich Facebook content within Graph API permissions

Connected RSS
  -> subscribe to feeds without identity coupling
```

Every connector should be removable.

## Connector Boundary

Add a connector interface separate from storage:

```ts
interface SocialConnector {
  id: string;
  label: string;
  capabilities: ConnectorCapability[];
  connect(): Promise<ConnectorAccount>;
  disconnect(accountId: string): Promise<void>;
  importUrl(url: string): Promise<ContentReference>;
  sync?(cursor?: string): AsyncIterable<ConnectorEvent>;
}
```

Connectors should not directly mutate UI state. They should emit normalized content references and observations that are written through `LensDataSource`.

## Privacy Rules

- connecting a social account is optional
- importing content does not imply sharing tags publicly
- tokens must be stored separately from tags and rules
- tokens should not be exported in lens packs
- tags imported from APIs should preserve source/provenance
- platform terms and rate limits must be respected

## Sources

- X API v2 search migration: https://docs.x.com/x-api/posts/search/migrate/overview
- RSS 2.0 specification: https://www.rssboard.org/rss-specification
- Meta Graph API overview: https://developers.facebook.com/docs/graph-api/overview/
- Meta Facebook Login permissions: https://developers.facebook.com/docs/facebook-login/permissions/
