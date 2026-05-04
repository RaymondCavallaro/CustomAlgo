# SocialLens Mobile

Initial mobile client for CustomAlgo/SocialLens.

This app is planned to cover:

- Android
- iOS
- iPadOS
- web preview through Expo

The first scaffold uses Expo/React Native and imports the shared lens logic from `@customalgo/sociallens-core`.

## Current Scope

The current screen is a real mobile-shaped prototype:

- capture a shared URL manually
- apply a quick tag
- evaluate the shared SocialLens rule engine
- toggle lens layers
- inspect and remove local tags

This is not wired to native share sheets or persistent device storage yet.

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

## Next Mobile Steps

1. Add a persistent mobile data-source adapter.
2. Add native share-sheet capture for URLs.
3. Add an in-app browser capture flow.
4. Add iPad/tablet split layouts for lens review and tag inspection.
5. Add encrypted sync hooks once the data-source contract is stable.
