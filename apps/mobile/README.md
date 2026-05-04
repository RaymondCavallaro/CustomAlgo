# SocialLens Mobile

Expo client for CustomAlgo/SocialLens. The main try-it-now path is web, with the same app still targeting mobile and tablet.

This app is planned to cover:

- web through Expo
- iPadOS through Safari or Expo Go
- Android
- iOS

The first app uses Expo/React Native and imports the shared lens logic from `@customalgo/sociallens-core`.

## Current Scope

The current app is a usable local clean-feed prototype:

- capture a shared URL manually
- apply fast decisions such as spam, ragebait, clickbait, source-backed, and save-for-later
- evaluate the shared SocialLens rule engine
- toggle lens layers
- inspect and remove local tags
- persist the local lens with browser storage on web and SQLite on native devices
- export, import, and reset the local lens JSON

This is not wired to native share sheets yet. Manual URL capture in the web app is the main path while the data model and routing remain flexible.

## Run

Install dependencies from the repository root:

```bash
npm install
```

Start the web app:

```bash
npm run mobile:web
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
docker compose up mobile-web
```

The app should be available from the host browser at:

http://localhost:8081

See `docs/docker-windows.md` for Windows/Hyper-V notes.

## Next Mobile Steps

1. Move SQLite reads/writes behind a named mobile data-source adapter.
2. Add native share-sheet capture for URLs.
3. Add an in-app browser capture flow.
4. Add iPad/tablet split layouts for lens review and tag inspection.
5. Add encrypted sync hooks once the data-source contract is stable.
