# Product Strategy

SocialLens is structurally novel, but the first product experience must be brutally simple.

The long-term vision is a user-controlled epistemic layer for the web. The first win is much narrower and should start where people already feel the pain: social feeds.

```txt
I can clean my social feed better than the platform can.
```

If the product does not deliver visible feed improvement in one session, the deeper graph model will not matter to most users.

## Differentiation

Individual pieces already exist:

- annotations and highlights
- bookmarking and tagging
- social feeds
- search rankings
- fact-checking
- bias ratings
- custom feeds

The differentiation is the combination:

```txt
user-owned algorithm control
+ tags as decision signals
+ contextual trust
+ composable layers
+ cross-platform feed/search influence
+ eventual networked search
```

This is not mainly a social network, bookmarking tool, browser extension, or annotation app.

It is closer to:

```txt
a user-controlled epistemic layer for the web
```

## What Is Unique

### User-Owned Algorithm Layer

The user composes their feed instead of only accepting platform ranking.

### Tags As First-Class Signals

Tags are not just notes or organization helpers. They are inputs that affect hide, boost, dim, badge, filter, search, and recommendation behavior.

### Explicit Contextual Trust

Trust is not global reputation.

```txt
trust Alice for AI
trust Bruno for local politics
ignore Clara for health
```

### Composable Layers

Users can stack:

```txt
platform default
+ personal tags
+ imported anti-spam layer
+ trusted friend research tags
+ personal rules
+ session filter
```

This is closer to commits/layers than to a static preference screen.

### Networked Search

The long-term search direction is:

```txt
query -> user's trust graph -> tagged content -> contextual results
```

Not global ranking as the only authority.

## Execution Risks

### Cold Start

No tags and no trust graph means no value.

Mitigation:

- personal tagging must help immediately
- default lens packs must work before network effects
- RSS/share/manual URL capture should provide value without social API access

### UX Complexity

The system can become too powerful too early.

Mitigation:

- hide the semantic graph from the first-run flow
- ship presets before advanced controls
- make defaults reversible
- keep "reset to default" always visible

### Incentives And Manipulation

People may spam tags, import low-quality layers, or manipulate trust.

Mitigation:

- trust weighting
- provenance on every import
- private-by-default personal tags
- imported layers off/removable
- contextual rather than global reputation

## MVP Rule

Delay the big vision in the first experience.

Do not lead with:

- semantic web model
- trust network
- search replacement
- import marketplace
- ontology editing

Lead with:

- tag a post
- hide ragebait
- dim spam
- boost research
- reduce repeated junk

## One-Session MVP

The first session should prove:

```txt
before SocialLens: feed is noisy
after SocialLens: feed feels cleaner
```

Minimum useful flow:

1. User opens a supported feed.
2. SocialLens offers a default Clean Feed preset.
3. User tags a few posts as spam, ragebait, low-effort, or deep-research.
4. Similar content is dimmed/hidden/badged.
5. User can undo or reset instantly.

## Product Phases

### Phase 1: Personal Social Clean Feed

- local tags
- social post capture
- social source metadata such as platform, author, URL, quoted claim, and annotation
- default lens packs
- hide/dim/boost/badge rules
- no account required
- no trust network required

### Phase 2: Web Annotation Layer

- Hypothesis-like annotations for normal web pages
- quote/selector anchoring
- page-level, passage-level, author-level, and domain-level tags
- import/export compatibility with annotation-shaped data

### Phase 3: Portable Semantics

- export/import tag-native bundles
- default semantics layer
- personal override layer
- reset to default

### Phase 4: Optional Social Imports

- RSS first
- URL/share capture
- optional X/Facebook enrichment
- imported layers with provenance

### Phase 5: Trust Network

- trust people by context
- subscribe to tag layers
- conflict/disagreement views

### Phase 6: Networked Search

- search saved/tagged/imported content
- expand through trusted users and layers
- show provenance and disagreement

## Positioning

Short product framing:

```txt
Control your feed with your own tags and rules.
```

Long product framing:

```txt
A composable, user-owned interpretation layer for the web.
```

Internal north star:

```txt
new way of structuring how people interpret information online
```
