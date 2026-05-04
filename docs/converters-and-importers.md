# Converters And Importers

SocialLens should support converters between external semantic formats and the internal tag-native graph.

It should also support importers for existing tags, annotations, curation lists, fact checks, bias ratings, community notes, and algorithm-like feeds.

## Core Idea

External systems become layers.

```txt
RDF / OWL / JSON-LD / graph export / RSS / API source
  -> converter or importer
  -> tag-native records
  -> imported layer
  -> user's trust and algorithm rules decide what to do
```

SocialLens should not replace existing interpretation systems first. It should aggregate them into a unified, composable interpretation layer.

## Converter Boundary

Converters translate between data models.

```ts
interface SemanticConverter {
  id: string;
  label: string;
  inputTypes: string[];
  outputTypes: string[];
  import(input: ConverterInput): Promise<TagNativeBundle>;
  export(bundle: TagNativeBundle): Promise<ConverterOutput>;
}
```

Initial converters:

- RDF triples to tag-native graph
- OWL/RDFS-lite concepts to root tags and semantic relation tags
- JSON / JSON-LD to tag-native graph
- generic graph nodes/edges to entities, tags, and relation applications
- tag-native graph to RDF-like triples for interoperability

## RDF-Like Mapping

RDF shape:

```txt
subject -> predicate -> object
```

Tag-native shape:

```txt
subject entity
predicate relation tag
object entity or value
relation application as taggable object
```

Example:

```txt
post:123 -> schema:about -> topic:climate
```

Can become:

```json
{
  "kind": "relationApplication",
  "from": "post:123",
  "relation": "tag:import:schema:about",
  "to": "topic:climate",
  "creator": "importer:rdf",
  "permission": "private"
}
```

The relation tag can then be tagged:

```json
{
  "target": "tag:import:schema:about",
  "tag": "tag:system:closeMatch",
  "value": "tag:system:about"
}
```

## OWL/RDFS-Inspired Mapping

Do not implement full OWL reasoning in the MVP.

Start with useful semantic relations:

- `sameAs`
- `closeMatch`
- `broaderThan`
- `narrowerThan`
- `inverseOf`
- `realizes`
- `subClassOf` as a tag relation
- `subPropertyOf` as a tag relation

Map external ontologies into a semantic layer that users can disable, trust, fork, or override.

## Importer Boundary

Importers fetch or parse data from existing systems.

```ts
interface LayerImporter {
  id: string;
  label: string;
  sourceType: string;
  capabilities: ImporterCapability[];
  import(input: ImportInput): Promise<ImportedLayer>;
  sync?(cursor?: string): AsyncIterable<ImportEvent>;
}
```

Importers should not directly decide ranking. They produce normalized tags, tag applications, relation applications, and provenance records.

## Existing Systems As Layers

### Bias And Media Perspective

Examples:

- Ground News
- AllSides
- Media Bias/Fact Check

Possible imported tags:

```txt
leftBias
centerBias
rightBias
mixedFactuality
highFactuality
lowFactuality
ownershipKnown
coverageGap
blindspot
```

Use as:

- source-level tags
- story-level tags
- bias/perspective layer

### Fact Checking Networks

Examples:

- Snopes
- PolitiFact
- Full Fact

Possible imported tags:

```txt
verified
false
misleading
partlyFalse
contextMissing
factCheckAvailable
```

Use as:

- claim-level tags
- content reference tags
- evidence links

### Community Moderation Signals

Examples:

- Community Notes
- Reddit votes/comments

Possible imported tags:

```txt
communityContext
helpfulContext
controversial
highSignal
lowQuality
disputed
crossPerspectiveAgreement
```

Use as:

- social proof layer
- disagreement layer
- trust calibration source

### Annotation And Highlighting

Examples:

- Hypothesis
- Diigo

Possible imported tags:

```txt
highlighted
annotated
importantPassage
researchNote
userComment
```

Use as:

- reading/research layer
- content segment annotations

### Algorithm And Feed Systems

Examples:

- Bluesky custom feeds
- Mastodon chronological/local timelines

Possible imported tags:

```txt
fromCustomFeed
chronological
localTimeline
algorithmicFeed
feedRanked
```

Use as:

- imported algorithm layer
- emulated lens preset

### Curation And Bookmarking

Examples:

- Pocket
- Raindrop.io

Possible imported tags:

```txt
saved
readLater
favorite
collection
archive
```

Use as:

- personal curation layer
- search seed data

## Emulation Mode

When an API is unavailable or too restricted, SocialLens can emulate a layer.

Examples:

```txt
Ground News-like mode:
  compare domains and known source tags
  show possible perspective spread

Community Notes-like mode:
  aggregate trusted user notes
  show context when trusted disagreement appears

Bluesky-like custom feed:
  run a user-defined ranking rule over imported/local content
```

Emulation should be labeled clearly. Do not present emulated tags as official third-party data.

## Provenance Requirements

Every imported tag or relation must preserve:

- importer ID
- source URL or source record ID
- import timestamp
- source confidence if available
- license/terms note if relevant
- whether it is official data or emulated

Imported layers should be removable without deleting the user's own tags.

## MVP Importer Order

Start with:

1. RSS importer
2. manual JSON/tag-native bundle importer
3. simple RDF/JSON-LD converter
4. Hypothesis-style annotation import if API access is straightforward
5. X/Facebook URL enrichment only where API access allows

Do not start by depending on restricted social APIs. URL/share capture and RSS provide a safer base.
