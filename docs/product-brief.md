# Product Brief

## One Sentence

SocialLens is a composable feed and search interpretation layer where users tag content, share those tags, choose whose judgments they trust, and build personal algorithms over existing platforms.

## Starting Point

Do not build a new social network first. Start as a lens over existing platforms where users already spend time:

- X/Twitter
- Reddit
- YouTube
- Hacker News
- LinkedIn
- blogs and articles

The first client can be a desktop browser extension because it proves overlay behavior quickly. The product itself must also work on Android, iOS, iPadOS, mobile browsers, and desktop browsers.

## MVP Bet

The earliest useful product is a cross-social tagging layer:

1. A user tags posts, accounts, and domains.
2. A local database stores those tags.
3. Simple rules hide, dim, boost, or label content.
4. Users export and import tags and algorithms as portable JSON.
5. The same lens data is available in extension, web/PWA, and mobile app clients.

This proves the core behavior: the user can alter their experience of the web without platform permission.

## Differentiator

Tags are first-class decision signals, not just notes. A tag is a claim about a piece of content, an author, or a domain.

```txt
Tags = observations
Trust = who you believe about which observations
Algorithms = how your feed reacts to those observations
```

## Layer Stack

The user composes their experience like layered commits:

```txt
Platform default feed
  + My personal tags
  + Imported anti-spam tags
  + Trusted friends' research tags
  + My final rules
  + Session filter: no politics today
```

Order matters. A user's own rules should be able to override imported layers.

## Privacy And Sharing

Contacts eventually become circles:

- Private
- Trusted
- Public
- custom groups

Users decide which tags and algorithms are visible to which circles. This prevents every classification from becoming a public performance.

## Long-Term Direction

After social feeds, SocialLens can become networked search:

```txt
Query -> your trust graph -> tagged content -> contextual results
```

The long-term goal is not to replace a global index. It is to build a parallel discovery layer where authority is explicit, contextual, and chosen by the user.

## Product Surface Principle

SocialLens is not "just a plugin." It is a cross-platform lens system:

- extension for direct desktop feed overlays
- web/PWA for dashboard, search, imports, trust, and circles
- mobile app for iOS, iPadOS, and Android
- share-sheet entry points for tagging from mobile apps
- in-app browser for mobile pages where SocialLens needs a controlled reading surface
