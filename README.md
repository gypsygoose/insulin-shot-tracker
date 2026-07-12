# Insulin Shot Tracker

A mobile app for people with diabetes who take insulin injections, to track injection sites and enforce site rotation, helping prevent lipodystrophy.

Tap a point on the body diagram to log an injection at that spot. The point's color cycles over a configurable number of days (1–8, default 8) to show how recently that site was used, so you always know which sites are safe to reuse.

**Platform:** iOS / Android — built with Expo (managed workflow), TypeScript, and React Native.

## Features

- Interactive body diagram with 30 injection points across 6 zones (shoulders, belly, thighs) by default — the row/column grid is configurable per zone type from the menu (up to 3×2 for shoulders, 4×4 for belly, 4×3 for thighs), without losing injection history for points that stay in range
- Individual zones (e.g. left/right shoulder) can be hidden from the body diagram entirely from the menu, without losing their injection history — at least one zone always stays enabled
- Long-press a point to see its body-relative address (row from top, position in the row from the body's center) alongside its history and actions; a toast with the same address confirms every marked injection, calling out a triggered blackout or a backdated mark's date/time when relevant
- Status toasts (info/warning/success/error, each with its own color and icon) confirm every action — marking, blocking, clearing, undo, and import/export — and flag anything that needs attention, like a site getting system-blacked-out or a failed import
- Color-coded rotation cycle (maroon → red → orange → yellow → green → white) based on local calendar days since last injection
- Configurable "days to white" delay (1–8 days) to match your own rotation schedule
- Automatic "blackout" cooldown when a site is reused too early, with duration based on how recently it was used
- Manual site lock (long-press) to mark a spot as temporarily unavailable
- Light, dark, or system-matched theme, switchable from the menu (defaults to following the OS appearance)
- Russian and English UI, switchable from the menu (defaults to following the device language)
- Undo, injection history, and selective import/export/clear of your data (choose which of active points / manually blocked points / individual app settings to include on export; on import, pick which of the categories actually present in the file to apply; on clear, pick which of those same categories to permanently reset to their defaults) — all stored locally on-device, no account or backend required

## Getting started

```bash
npm install
npm start          # opens Expo dev tools — scan the QR code with Expo Go
```

Other useful scripts:

```bash
npm test           # run unit tests (state machine logic)
npx tsc --noEmit   # type-check the project
npm run ios        # run on iOS simulator/device
npm run android    # run on Android emulator/device
```

## Project structure

```
src/
├── types/                  — shared TypeScript types, split by entity (zone.ts, point.ts, event.ts, storage.ts, theme.ts, language.ts, toast.ts, autoLock.ts), re-exported via index.ts
├── constants.ts            — shared non-text UI constants (durations, sizes, status colors)
├── utils/                  — shared helper functions, one per file (pad2, formatDateTime, splitSeconds, uuid, lastPressedByGroup, ...), re-exported via index.ts
├── hooks/useAppStore.ts    — React hook combining storage + state machine, re-exported via index.ts
├── data/zones.ts           — zone metadata + buildZoneData(zonePointCounts, enabledZones): computes each zone's layout/points fresh from the configurable per-zone-type grid and per-zone enable/disable settings, re-exported via index.ts
├── logic/                  — pure functions: color computation, press handling (stateMachine.ts), re-exported via index.ts
├── theme/                  — light/dark theme palettes + ThemeProvider/useTheme, re-exported via index.ts
├── i18n/                   — i18next setup, ru/en translations, LanguageProvider/useLanguage
├── storage/StorageService.ts — AsyncStorage load/save + export/import, re-exported via index.ts
├── components/             — app screens and components (helper-heavy ones live in their own ComponentName/ folder alongside their utils/constants/types — see CLAUDE.md); every folder, down to each ComponentName/utils/, has an index.ts barrel, so imports always go through a folder, never a concrete file inside it
└── screens/MainScreen/     — root screen
App.tsx                     — entry point
```

See [CLAUDE.md](CLAUDE.md) for full architecture notes, the point color/rotation rules, and coding conventions.

## Notes

- All data is stored locally on-device (AsyncStorage) — there is no backend or cloud sync.
- UI is available in Russian and English (see the "Язык"/"Language" menu row); more languages may be added later.
- This app supports injection-site rotation tracking and is not a substitute for medical advice.

## License

MIT — see [LICENSE](LICENSE).
