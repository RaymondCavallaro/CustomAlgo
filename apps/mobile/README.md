# SocialLens Mobile

Initial mobile client for CustomAlgo/SocialLens.

This app is planned to cover:

- Android
- iOS
- iPadOS
- web preview through Expo

The first app uses Expo/React Native and imports the shared lens logic from `@customalgo/sociallens-core`.

## Current Scope

The current app is a usable local clean-feed prototype:

- capture a shared URL manually
- apply fast decisions such as spam, ragebait, clickbait, source-backed, and save-for-later
- evaluate the shared SocialLens rule engine
- toggle lens layers
- inspect and remove local tags
- persist the local lens with SQLite on the device
- export, import, and reset the local lens JSON

This is not wired to native share sheets yet. Manual URL capture is the first iPad-friendly path while the data model and routing remain flexible.

## Run

Install dependencies from the repository root:

```bash
npm install
```

Start the mobile app:

```bash
npm run mobile
```

Platform shortcuts:

```bash
npm run mobile:android
npm run mobile:ios
npm run mobile:web
```

## Run With Docker

From the repository root:

```bash
docker compose up mobile
```

For web preview:

```bash
docker compose up mobile-web
```

See `docs/docker-windows.md` for Windows/Hyper-V notes.

## Next Mobile Steps

1. Move SQLite reads/writes behind a named mobile data-source adapter.
2. Add native share-sheet capture for URLs.
3. Add an in-app browser capture flow.
4. Add iPad/tablet split layouts for lens review and tag inspection.
5. Add encrypted sync hooks once the data-source contract is stable.
