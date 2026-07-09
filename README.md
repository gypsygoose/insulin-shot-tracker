# Insulin Shot Tracker

A mobile app for people with diabetes who take insulin injections, to track injection sites and enforce site rotation, helping prevent lipodystrophy.

Tap a button on the body diagram to log an injection at that spot. The button's color cycles over a configurable number of days (1–8, default 8) to show how recently that site was used, so you always know which sites are safe to reuse.

**Platform:** iOS / Android — built with Expo (managed workflow), TypeScript, and React Native.

## Features

- Interactive body diagram with 30 injection points across 6 zones (shoulders, belly, thighs)
- Long-press a point to see its body-relative address (row from top, position in the row from the body's center) alongside its history and actions; a toast with the same address confirms every marked injection, calling out a triggered blackout or a backdated mark's date/time when relevant
- Status toasts (info/warning/success/error, each with its own color and icon) confirm every action — marking, blocking, clearing, undo, and import/export — and flag anything that needs attention, like a site getting system-blacked-out or a failed import
- Color-coded rotation cycle (maroon → red → orange → yellow → green → white) based on local calendar days since last injection
- Configurable "days to white" delay (1–8 days) to match your own rotation schedule
- Automatic "blackout" cooldown when a site is reused too early, with duration based on how recently it was used
- Manual site lock (long-press) to mark a spot as temporarily unavailable
- Light, dark, or system-matched theme, switchable from the menu (defaults to following the OS appearance)
- Undo, injection history, and selective import/export of your data (choose which of injection marks / individual app settings to include on export; on import, pick which of the categories actually present in the file to apply) — all stored locally on-device, no account or backend required

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
├── types/index.ts          — all shared TypeScript types
├── constants.ts            — shared UI colors, labels, and other app-wide constants
├── format.ts               — shared formatting helpers
├── data/zones.ts           — zone + button definitions with (x,y) positions
├── logic/stateMachine.ts   — pure functions: color computation, press handling
├── theme/                  — light/dark theme palettes + ThemeProvider/useTheme
├── storage/storage.ts      — AsyncStorage load/save/clear
├── store/useAppStore.ts    — React hook combining storage + state machine
├── components/             — app screens and components
└── screens/MainScreen.tsx  — root screen
App.tsx                     — entry point
```

See [CLAUDE.md](CLAUDE.md) for full architecture notes, the button color/rotation rules, and coding conventions.

## Notes

- All data is stored locally on-device (AsyncStorage) — there is no backend or cloud sync.
- UI is currently Russian-only; English localization is planned.
- This app supports injection-site rotation tracking and is not a substitute for medical advice.

## License

MIT — see [LICENSE](LICENSE).
