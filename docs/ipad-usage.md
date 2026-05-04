# iPad Usage

There is not an App Store or TestFlight app yet.

The first usable iPad path is a development flow through Expo. The same React Native app in `apps/mobile` targets iOS and iPadOS because `apps/mobile/app.json` has:

```json
{
  "ios": {
    "supportsTablet": true
  }
}
```

## Option 1: Expo Go

This is the easiest path for using the app on your iPad right now.

Current useful loop on iPad:

- open the app in Expo Go
- paste a URL from Safari or another app into Capture
- apply a fast decision such as spam, ragebait, clickbait, source-backed, or save-for-later
- inspect the lens result immediately
- keep the tags locally in SQLite
- use Data to export, import, or reset the local lens JSON

Steps:

1. Install Expo Go from the iPad App Store.
2. Start the SocialLens mobile dev server on your computer.
3. Scan the QR code from the iPad camera or Expo Go.
4. The app opens inside Expo Go.

From a normal host terminal:

```bash
npm install
npm run mobile
```

If LAN discovery does not work, use tunnel mode:

```bash
npx expo start --tunnel
```

With the current Docker setup, the intended Windows-side command is:

```powershell
docker compose up mobile
```

If using Docker through Codex/WSL relay, the command shape is:

```bash
CUSTOMALGO_WORKSPACE='<windows repository path>' DOCKER_HOST=unix://<relay socket path> docker compose up mobile
```

## Option 2: Development Build

Use this when we add native modules that Expo Go does not include, or when we want a standalone SocialLens app icon on the iPad before App Store/TestFlight.

Expo development builds work like a custom development client. After the build is installed on the iPad, the app connects to the local dev server or a QR code.

This will likely become necessary after we add:

- SQLite configuration that requires custom native build behavior
- native share sheet integration
- secure storage
- deep links
- in-app browser native hooks

## Option 3: TestFlight / Internal Distribution

Use this when you want something closer to a real app on the iPad.

For iOS/iPadOS, builds require Apple signing. Without a Mac/Xcode workflow, the practical route is EAS Build:

```bash
eas build --platform ios
```

Then distribute through:

- EAS internal distribution
- TestFlight
- App Store later

Devices running iOS 16 or later may need Developer Mode enabled for internal/development builds.

## Option 4: IPA + AltServer

Another path is to build an `.ipa` and install it through AltServer/AltStore.

This should be treated as a separate sideloading phase:

1. Generate an `.ipa` with EAS Build or GitHub Actions.
2. Install it manually with AltServer first.
3. After manual install works, experiment with an AltServer-style Docker service.

See `docs/ios-ipa-altserver-plan.md`.

## How The iPad Experience Should Work

The iPad app should not try to overlay every other app. iPadOS does not allow a universal overlay like a desktop browser extension.

The iPad experience should be:

- share a URL into SocialLens from Safari or another app
- tag content, domains, videos, and authors from the share flow
- manage tags, layers, rules, contacts, circles, and visibility
- browse inside a SocialLens in-app browser when we need controlled annotation
- use the same SQLite local database as the mobile app
- optionally sync to the user's chosen backend

## Sources

- Expo start developing: https://docs.expo.dev/get-started/start-developing/
- Expo development builds: https://docs.expo.dev/develop/development-builds/use-development-builds/
- EAS Build: https://docs.expo.dev/build/introduction/
- iOS Developer Mode: https://docs.expo.dev/guides/ios-developer-mode/
- AltServer overview: https://faq.altstore.io/altstore-classic/altserver
