# Apps

This directory reserves space for the required SocialLens clients.

The first implementation in this repo is still the desktop browser extension at the repository root. The product direction is broader:

- `browser-extension`: desktop browser overlay
- `web`: responsive PWA for dashboard, search, imports, trust, and circles
- `mobile`: iOS, iPadOS, Android, and Expo web-preview app

All apps should use `packages/sociallens-core` for the lens state and algorithm behavior.
