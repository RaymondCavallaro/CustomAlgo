# Tag-Native Semantics

SocialLens should shift from "tags as labels" toward "tags as the language of the system."

This keeps the product usable now while preserving a path toward RDF/OWL-like semantic expressiveness later.

## Core Shift

Everything should be taggable:

- content
- people/accounts
- algorithms
- contacts/circles
- tags
- tag applications
- relations
- imported layers

This means users can tag tags, including their own tags and tags created by others.

## Minimal Native Objects

Keep native objects small.

### Entity

Any thing that can be tagged:

```json
{
  "id": "post:123",
  "kind": "entity"
}
```

### Tag

Tags should have minimal built-in fields:

```json
{
  "id": "tag:alice:isMisleading",
  "kind": "tag",
  "text": "isMisleading",
  "creator": "user:alice",
  "permission": "public"
}
```

Do not hardcode many semantic fields into tags. Meaning should be added by applying more tags.

### Tag Application

Applying a tag is also an object, and that object can itself be tagged:

```json
{
  "id": "tagapp:001",
  "kind": "tagApplication",
  "target": "post:123",
  "tag": "tag:alice:isMisleading",
  "creator": "user:alice",
  "permission": "circle:trusted"
}
```

Then extra meaning is nested:

```json
{
  "id": "tagapp:002",
  "kind": "tagApplication",
  "target": "tagapp:001",
  "tag": "tag:system:confidenceHigh",
  "creator": "user:alice",
  "permission": "circle:trusted"
}
```

So confidence, reason, source, context, classifiers, and qualifiers can all be modeled as tags over a tag application.

## Root Tags And Implementation Tags

Separate abstract concepts from practical applied tags.

```txt
Root concept tag = abstract meaning
Implementation tag = concrete applied signal
```

Example:

```txt
concept:Misleading
  conceptual node

tag:alice:isMisleading
  practical tag users apply to content
  realizes -> concept:Misleading
```

This prevents the root concept from being overloaded by every content edge.

The graph becomes:

```txt
Entity
  receives ImplementationTag

ImplementationTag
  points toward RootTag

RootTag
  carries conceptual meaning through more tag applications
```

This gives us:

```txt
reality layer -> usage layer -> concept layer
```

## Relation Tags

SocialLens can represent two-way relationships without becoming pure RDF.

Use relation tags with inverse semantics:

```json
{
  "id": "tag:system:loves",
  "kind": "tag",
  "text": "loves",
  "creator": "system",
  "permission": "public"
}
```

Then tag the relation tag:

```json
{
  "target": "tag:system:loves",
  "tag": "tag:system:inverseOf",
  "value": "tag:system:lovedBy"
}
```

A relation application can be explicit:

```json
{
  "id": "rel:bob-loves-alice",
  "kind": "relationApplication",
  "from": "user:bob",
  "relation": "tag:system:loves",
  "to": "user:alice",
  "creator": "user:bob",
  "permission": "private"
}
```

Or represented as a tag application with a value:

```json
{
  "target": "user:alice",
  "tag": "tag:system:lovedBy",
  "value": "user:bob",
  "creator": "user:bob",
  "permission": "private"
}
```

The system can derive the inverse view when the inverse tag is known.

## System Defaults As Layers

Defaults should be editable by users without being mutated globally.

Use layers:

```txt
Layer 0: System defaults
Layer 1: Imported/shared semantics
Layer 2: Personal overrides
Layer 3: Session tweaks
```

The "reset to default" button should disable or clear user override layers. It should not rewrite the immutable system default layer.

This gives users freedom without breaking shared semantics.

## Well-Known System Tags

Most semantics should be user-defined, but tools need a small default vocabulary to coordinate.

Start with well-known tags:

```txt
realizes
inverseOf
sameAs
closeMatch
broaderThan
narrowerThan
createdBy
visibleTo
trustedFor
confidenceHigh
confidenceLow
reason
context
sourceBacked
disputedBy
```

These are still tags, not special database columns. The system simply ships with them in the default semantics layer.

## Resolution Rule

When two active layers disagree:

```txt
session layer wins over personal layer
personal layer wins over imported layer
imported layer wins over system default only where explicitly configured
system default remains available for reset
```

Do not silently mutate shared tags. Fork, override, or map them.

## First Product Implication

The project should move toward:

- a semantic default pack
- a minimal default tag pack for social feed algorithms
- UI for "edit meaning" that creates a personal override
- UI for "reset to default" that disables overrides
- storage schema where tags and tag applications are first-class records

## Naming

This model can be described as:

```txt
Nested Tag Relations
Tag-native semantic graph
Composable semantics
```
