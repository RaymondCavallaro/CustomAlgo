# iOS IPA And AltServer Plan

Goal: generate an iOS `.ipa` from GitHub and install it on an iPad through an AltServer-style flow.

This is possible, but there are two separate problems:

```txt
Build/sign IPA
  -> GitHub Actions / EAS / Xcode signing

Install IPA on iPad
  -> AltServer / AltStore / device trust / refresh limits
```

## Recommended Path

Use GitHub Actions to trigger an Expo EAS iOS build first.

Why:

- the project is already Expo/React Native
- EAS handles macOS build machines, Xcode, Fastlane, and Expo prebuild
- GitHub Actions can trigger EAS through `expo/expo-github-action`
- avoids maintaining a custom macOS signing pipeline immediately

The first build target should be an internal or development-style `.ipa`, not App Store release.

## GitHub Actions Shape

Use a manual workflow first:

```txt
.github/workflows/ios-ipa.yml
  -> checkout
  -> setup Node
  -> npm ci
  -> setup Expo/EAS
  -> eas build --platform ios --profile preview --non-interactive --wait
```

Required secrets:

- `EXPO_TOKEN`

Likely required setup before CI works:

- run the first EAS build manually once
- create/link the EAS project
- configure Apple credentials or EAS-managed credentials
- decide bundle identifier
- decide distribution profile

## Direct GitHub macOS Build Alternative

GitHub Actions can build iOS directly on macOS runners with Xcode, but this is more work.

It requires:

- macOS runner
- Xcode selection
- Apple signing certificate secret
- provisioning profile secret
- keychain setup in CI
- `expo prebuild` or committed `ios/` native project
- `xcodebuild archive`
- `xcodebuild -exportArchive`

This path gives more control but creates a heavier signing pipeline. Do not start here unless EAS is a bad fit.

## AltServer / AltStore Install Path

Official AltServer is a companion app for a computer. It lets AltStore sideload, refresh, activate, and deactivate apps when the iPad is on the same Wi-Fi network or connected through USB.

Important constraints:

- AltServer official support is Windows/macOS oriented
- AltServer direct IPA sideloading exists, but apps installed this way need manual refresh/reinstall
- AltStore-managed apps can refresh in the background when AltServer is reachable
- iOS/iPadOS devices may need Developer Mode enabled
- free Apple ID sideloading has active-app limits and refresh constraints

## AltServer In Docker

Running an AltServer-style service in Docker should be treated as experimental.

Reasons:

- official AltServer is not primarily distributed as a Linux container
- iPad discovery requires local network visibility
- USB device passthrough from Docker Desktop/Hyper-V is difficult
- Apple authentication and anisette handling can be fragile
- firewall and Bonjour/mDNS discovery matter

If we try it, use it as a separate experiment:

```txt
services/altserver/
  Dockerfile
  README.md
  scripts/
```

Do not couple the main mobile build pipeline to this until it is proven on the local machine.

## Better First Installation Flow

1. Generate `.ipa` with EAS/GitHub Actions.
2. Download `.ipa` artifact.
3. Install manually with Windows AltServer first.
4. Once that works, automate AltServer/AltStore refresh.
5. Only then experiment with AltServer-like Docker service.

This avoids debugging build signing and sideload networking at the same time.

## Sources

- Expo EAS Build: https://docs.expo.dev/build/
- Expo iOS build process: https://docs.expo.dev/build-reference/ios-builds/
- Expo GitHub Actions: https://github.com/expo/expo-github-action
- Expo CI builds: https://docs.expo.dev/build/building-on-ci/
- Apple Xcode command-line tools: https://developer.apple.com/documentation/xcode/xcode-command-line-tool-reference
- Apple archive export files: https://help.apple.com/xcode/mac/current/en.lproj/deva1f2ab5a2.html
- AltServer overview: https://faq.altstore.io/altstore-classic/altserver
- AltStore Windows install: https://faq.altstore.io/altstore-classic/how-to-install-altstore-windows
- AltStore activating apps: https://faq.altstore.io/altstore-classic/activating-apps
