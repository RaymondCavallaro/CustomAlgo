# Default Lens Packs

The first stage should focus on social networks and ship with minimal default algorithms that users can understand, fork, edit, or reset.

The first user-facing win should be Clean Feed. Other default lenses are important, but they should not distract from proving immediate value.

Defaults are starter semantics, not official truth.

Users can:

- use defaults
- edit defaults through personal override layers
- fork defaults
- import another default pack
- reset to system defaults

## Target Platforms

Default lens packs should be useful across:

- YouTube
- Instagram
- TikTok
- Facebook
- Reddit
- X / Twitter
- LinkedIn
- RSS feeds

The first implementation can support only some platforms, but the default vocabulary should be platform-agnostic.

## Minimal Default Algorithms

### Chronological / Old Web Mode

Purpose: restore "show me what was posted, not what manipulates engagement."

Needs tags:

```txt
seen
new
fromFollowed
timestampKnown
```

Behavior:

```txt
sort by time
prefer followed sources
avoid engagement-based boosts
```

### Clean Feed Mode

Purpose: reduce spam, bait, outrage, and low-effort content.

Needs tags:

```txt
spam
ragebait
clickbait
lowEffort
adLike
repost
```

Behavior:

```txt
hide or downrank spam, ragebait, and clickbait
dim ad-like content
collapse repeated reposts
```

### Friends / People First Mode

Purpose: fix the feeling that platforms hide people the user actually cares about.

Needs tags:

```txt
closeContact
friend
family
knownPerson
creatorIValue
```

Behavior:

```txt
boost close contacts
boost known people
downrank anonymous viral content
```

### Learning / Research Mode

Purpose: make social media useful for knowledge.

Needs tags:

```txt
deepResearch
sourceBacked
expert
tutorial
reference
saveForLater
```

Behavior:

```txt
boost source-backed content
boost experts and tutorials
save or highlight references
downrank shallow takes
```

### No Doomscroll Mode

Purpose: reduce addictive loops.

Needs tags:

```txt
shortLoop
infiniteScrollBait
emotionalHook
alreadySeen
timeSink
```

Behavior:

```txt
limit repeated short-form content
warn after repeated emotional hooks
hide already-seen loops
```

### Disagreement / Opposing View Mode

Purpose: avoid echo chambers without opening the door to junk.

Needs tags:

```txt
disagreesWithMe
goodFaith
badFaith
strongArgument
weakArgument
```

Behavior:

```txt
boost good-faith disagreement
hide bad-faith attacks
show strong opposing arguments
```

### Local / Community Mode

Purpose: surface local people, events, and practical information.

Needs tags:

```txt
local
event
nearMe
community
practicalInfo
```

Behavior:

```txt
boost local/community content
boost events and practical info
downrank global viral noise
```

## Minimal Universal Tag Set

Start with roughly 30 default tags:

```txt
spam
ragebait
clickbait
lowEffort
adLike
repost
alreadySeen
shortLoop
emotionalHook
timeSink

friend
family
knownPerson
closeContact
creatorIValue

deepResearch
sourceBacked
expert
tutorial
reference
saveForLater

goodFaith
badFaith
strongArgument
weakArgument
disagreesWithMe

local
event
community
practicalInfo
fromFollowed
```

## Relation To Tag-Native Semantics

These tags should ship as a system default layer.

Users should not edit the default layer directly. When a user changes a meaning, the system creates a personal override layer.

Example:

```txt
System default:
  tag:system:ragebait realizes concept:emotionalManipulation

User override:
  tag:alice:ragebait closeMatch tag:system:outrageContent
```

Resetting to defaults disables the user's override layer.
