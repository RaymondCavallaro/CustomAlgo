# Lens Format

This document describes the current JSON shape exported by SocialLens. The format is intended to be shared by every client: browser extension, web/PWA, Android, iOS, and iPadOS.

The format should evolve toward the tag-native semantic graph described in `docs/tag-native-semantics.md`, where tags and tag applications are first-class records.

## Root

```json
{
  "version": 1,
  "mode": "clean",
  "tags": [],
  "contacts": [],
  "circles": [],
  "layers": [],
  "rules": [],
  "quickTags": []
}
```

## Tag Entry

```json
{
  "id": "uuid",
  "tag": "deep-research",
  "targetType": "content",
  "targetId": "youtube:abc123",
  "platform": "youtube",
  "url": "https://www.youtube.com/watch?v=...",
  "title": "Video title or post excerpt",
  "author": "Creator",
  "sourceUser": "me",
  "visibility": "private",
  "confidence": 1,
  "createdAt": "2026-05-03T12:00:00.000Z"
}
```

Target types:

- `content`
- `author`
- `domain`

## Rule

```json
{
  "id": "rule-boost-research",
  "label": "Boost deep research",
  "enabled": true,
  "when": {
    "target": "content",
    "tag": "deep-research"
  },
  "then": {
    "action": "boost",
    "weight": 1.7
  }
}
```

Supported actions:

- `hide`
- `dim`
- `boost`
- `badge`

## Layer

```json
{
  "id": "layer-personal-tags",
  "name": "My personal tags",
  "type": "tag_pack",
  "enabled": true,
  "priority": 10,
  "sourceUser": "me"
}
```

Layer types planned:

- `base`
- `tag_pack`
- `rules`
- `trust_pack`
- `session_filter`

## Future Trust Entry

Trust is not active in the MVP, but the model is expected to look like this:

```json
{
  "sourceUser": "me",
  "trustedUser": "alice",
  "context": "AI",
  "weight": 0.8,
  "allowedTags": ["deep-research", "misleading"]
}
```
