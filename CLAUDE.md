# Insulin Shot Tracker — Project Documentation

## Overview

Mobile app for people with diabetes who take insulin injections to track insulin injection sites and enforce maximum rotation to prevent lipodystrophy. Users tap a button to log an injection; the button changes colour over a configurable number of days (1–8, default 8) to show when the site is safe to reuse.

**Platform:** iOS / Android — Expo Managed Workflow, TypeScript, React Native.

---

## Running the project

```bash
npm install
npm start          # opens Expo dev tools (scan QR with Expo Go)
npm test           # Jest unit tests (state machine logic)
npx tsc --noEmit   # TypeScript type check
```

---

## Architecture & folder structure

```
src/
├── types/index.ts          — all shared TypeScript types
├── constants.ts            — shared UI colors, labels, and other app-wide constants
├── format.ts               — shared formatting helpers (pad2, splitSeconds, SECONDS_PER_MINUTE)
├── data/zones.ts           — zone + button definitions with (x,y) positions
├── logic/
│   ├── stateMachine.ts     — pure functions: color computation, press handling
│   └── stateMachine.test.ts
├── storage/storage.ts      — AsyncStorage load/save/clear
├── store/useAppStore.ts    — React hook: combines storage + state machine
├── components/
│   ├── InjectionButton.tsx — single injection point button
│   ├── ButtonContextMenu.tsx — long-press menu for a single point (address, history, actions)
│   ├── BottomMenu.tsx      — Undo / Menu / Help / Lock bar
│   ├── AutoLockDialog.tsx  — edit auto-lock delays (opened from MenuSheet)
│   ├── DaysToWhiteDialog.tsx — edit the "days to white" setting (opened from MenuSheet)
│   ├── icons/              — one file per icon component (e.g. UndoIcon.tsx, MenuIcon.tsx)
│   └── common/             — generic, domain-agnostic UI primitives, reusable outside this app
│       ├── Modal.tsx       — full-screen overlay + backdrop
│       ├── Dialog.tsx      — confirm/cancel modal (built on Modal)
│       ├── ContextMenu.tsx — action-list modal (built on Modal)
│       ├── ConfirmDialog.tsx — title/message confirm wrapper (built on Dialog)
│       ├── BottomSheet.tsx — swipe-to-dismiss bottom sheet
│       ├── Toast.tsx       — transient status message banner (info/warn/success/error, own icon + color per status)
│       ├── TimeField.tsx   — minutes/seconds picker pair (used by AutoLockDialog)
│       └── NumberPickerField.tsx — single labeled numeric picker (used by DaysToWhiteDialog)
└── screens/MainScreen.tsx  — root screen composing all components
App.tsx                     — entry point
```

---

## Technical decisions

| Decision | Choice | Rationale |
|---|---|---|
| Local storage | AsyncStorage | Small data volume (4–6 events/day), no SQL queries needed |
| State management | Custom hook (`useAppStore`) | No Redux/MobX — app state is one JSON object |
| ID generation | Timestamp + random string | No uuid lib needed |
| SVG silhouette | react-native-svg inline Path | No external image asset required at MVP |
| Testing | Jest + ts-jest | Pure logic tests; no React Native renderer required |

---

## Coding conventions

- Use named exports for all components, functions, and modules — no `export default`. Import with `import { Foo } from "./Foo"`.
- Every component (including small presentational helpers like icons or a single form field extracted from a screen) lives in its own file named after the component. Do not define a second component — even an unexported local one only used within the file — alongside another component in the same file. Icon components go in `src/components/icons/`. Generic, domain-agnostic UI primitives with no knowledge of app types (`Modal`, `Dialog`, `ConfirmDialog`, `ContextMenu`, `BottomSheet`, `Toast`, `TimeField`, `NumberPickerField`) go in `src/components/common/`; components that reference app domain types (e.g. `ButtonColor`, `ZoneId`, `AutoLockDialogMode`) or compose the app's screens stay directly under `src/components/`.
- Types that enumerate string constants must be TypeScript `enum`s, not string-literal unions (e.g. `ButtonColor`, `ZoneGroup`, `ZoneId`, `AppEventType`, `AutoLockDialogMode`, `ToastStatus` in `src/types/index.ts`). Reference values as `EnumName.Member`, never as raw string literals.
- Discriminated-union result types (e.g. `PressResult` in `src/logic/stateMachine.ts`, `ImportResult` in `src/storage/storage.ts`) use `type` as the discriminant field name (not `kind`), backed by its own enum (e.g. `PressResultType`, `ImportResultType`).
- No inline color literals (hex/`rgba`) in component styles. A color literal used in 2+ places with the same semantic role (e.g. dialog title text, modal backdrop, hairline border) is a shared constant in `src/constants.ts`. A literal that's meaningful but used in only one place is still a named constant, declared locally in the file/component where it applies (not inlined). Two literals that happen to share a value by coincidence, but mean different things (e.g. a UI accent color vs. an unrelated injection-cycle color in `stateMachine.ts`), are kept as separate constants — never merged just because the value matches.
- The same rule applies to non-color literals: no unnamed "magic" numbers (durations, thresholds, sizes) or magic strings (UI labels, storage keys, MIME types, format patterns) in component/logic code. A value reused in 2+ places for the same reason is a shared constant in `src/constants.ts` (or a shared helper in `src/format.ts` for repeated formatting logic, e.g. `pad2`, `splitSeconds`, `SECONDS_PER_MINUTE`); a single-use but deliberate value is still a named local constant in the file where it applies. Ordinary one-off layout numbers (an arbitrary `padding`/`fontSize`/`borderRadius` with no cross-cutting meaning) and one-off prose don't need this — only values that encode an actual decision. Coincidental value matches with unrelated meaning are kept as separate constants, same as colors.
- **Keep this file current**: whenever a change affects code style, project structure, or any other app-wide convention (not just a single file's internals), add or update the relevant note in this CLAUDE.md in the same change. Treat an out-of-date CLAUDE.md as a bug.
- **Keep README.md current too**: whenever a change affects the project description, features, setup/scripts, or structure, update README.md in the same change, not just CLAUDE.md.
- **Every new menu setting must round-trip through storage and export/import**, following the pattern set by `mirrored`/`autoLock*`/`daysToWhite`: its own AsyncStorage key + `load.../save...` pair in `src/storage/storage.ts`, a field on `ExportedAppData` in `src/types/index.ts` with a matching optional-type check in `isValidAppStorage`, a default fallback in `pickImportFile`, inclusion in `useAppStore`'s `exportData`/`applyImport`, and a row label constant in `src/constants.ts` documented in HelpSheet's "Пункты меню" section.

---

## Data model

```ts
// StoredButtonState — persisted per button
interface StoredButtonState {
  buttonId: string;
  lastInjectionAt?: number;       // timestamp of last normal injection
  blackoutStartedAt?: number;     // timestamp when system blackout was triggered
  blackoutDurationDays?: number;  // duration of blackout in days
  isManuallyBlocked: boolean;     // gray (user-locked) state
}

// AppEvent — undo history entry
interface AppEvent {
  id: string;
  timestamp: number;
  type: 'injection' | 'blackout' | 'manual-block' | 'manual-unblock';
  buttonId: string;
  zoneId: string;
  prevButtonState: StoredButtonState;  // snapshot for undo
}

// AppStorage — root object in AsyncStorage
interface AppStorage {
  buttonStates: Record<string, StoredButtonState>;
  events: AppEvent[];
}

// ExportedAppData — AppStorage plus settings that live in their own
// AsyncStorage keys, written out as one JSON file by export/import.
interface ExportedAppData extends AppStorage {
  mirrored: boolean;
  autoLockEnabled: boolean;
  autoLockAfterMarkSeconds: number;
  autoLockAfterUnlockSeconds: number;
  daysToWhite: number;  // 1–8, default 8 — see "Button colour state machine" below
}
```

Storage keys: `@insulin_shot_tracker_v1` (buttonStates/events), plus one key per setting (mirror, interface-locked, auto-lock, `daysToWhite`) — see `src/storage/storage.ts`.

---

## Button colour state machine

### Days-to-white setting

The number of days it takes an injection point to reach White (fully free) is configurable via the **"Дней до восстановления точки"** row in the menu (`DaysToWhiteDialog.tsx`), range 1–8, default 8 (`MIN_DAYS_TO_WHITE`/`MAX_DAYS_TO_WHITE`/`DEFAULT_DAYS_TO_WHITE` in `src/constants.ts`). It's persisted like `mirrored`/auto-lock (its own AsyncStorage key, round-trips through export/import as `ExportedAppData.daysToWhite`) and threaded into `computeButtonColor`/`onPress` as a third argument (defaults to 8 when omitted, e.g. in older call sites/tests).

At the default of 8, every color below is used, one per day. Lowering the setting compresses the cycle by dropping colors, in this fixed order (first dropped → last dropped): **dark yellow → dark orange → dark green → orange → red → green → yellow**. Maroon (day 0) is never dropped; White is always reached on day `daysToWhite`. See `activeCycleColors`/`COLOR_REMOVAL_ORDER` in `src/logic/stateMachine.ts`. Examples:

- 7: orange on day 3, yellow on day 4, green on day 6, white on day 7 (dark yellow dropped)
- 6: red on day 1, orange on day 2, yellow on day 3, green on day 5, white on day 6 (dark yellow, dark orange dropped)
- 1: white on day 1 (only maroon remains)

Blackout durations (below) stay keyed by color identity regardless of the setting — a color's blackout duration doesn't change just because other colors were dropped from the cycle.

### Normal injection cycle (days since `lastInjectionAt`)

"Days" are local calendar days, not elapsed 24h periods: the color advances at local midnight (device timezone), so a press at 15:30 becomes day 1 as soon as the clock crosses into the next calendar day, not 24h later. Same rule applies to the post-blackout cycle. See `daysBetween`/`localDayIndex` in `src/logic/stateMachine.ts`.

Full (default, daysToWhite = 8) cycle:

| Days | Colour |
|---|---|
| 0 | Maroon `#7B1D1D` |
| 1 | Red `#DC2626` |
| 2 | Dark orange `#C2410C` |
| 3 | Orange `#EA580C` |
| 4 | Dark yellow `#A16207` |
| 5 | Yellow `#EAB308` |
| 6 | Dark green `#166534` |
| 7 | Green `#16A34A` |
| 8+ | White `#EBEBEB` |

### Re-use (blackout) — button pressed while not white/dark-green/green

| Colour at press | Blackout duration |
|---|---|
| Maroon / Red | 4 days |
| Dark orange / Orange | 2 days |
| Dark yellow / Yellow | 1 day |

After blackout: post-blackout cycle starts at **Red** (maroon is skipped), counting from `blackoutStartedAt + blackoutDurationDays * DAY_MS`. The post-blackout cycle is subject to the same daysToWhite-driven compression as the normal cycle (with Maroon excluded, since it never appears post-blackout).

Dark-green / Green re-press → treated as white (restart cycle from maroon, no blackout).

### Manual block (gray)
Long-press (~800 ms) → toggle `isManuallyBlocked`. Gray overrides all colours visually, but the underlying time cycle continues ticking.

### Priority (highest → lowest)
1. Gray (manual block)
2. Black (system blackout, if `blackoutStartedAt > lastInjectionAt` and `now < blackoutEnd`)
3. Post-blackout cycle (if blackout ended)
4. Normal injection cycle
5. White (never used or 8+ days)

---

## Toast statuses

Every toast (`src/components/common/Toast.tsx`) carries a `ToastStatus` (`src/types/index.ts`) that drives its background/border color and leading icon (`src/components/icons/Toast{Info,Warn,Success,Error}Icon.tsx`, colors in `src/constants.ts`):

| Status | Used for |
|---|---|
| `Info` | Locking/unlocking the interface (bottom-bar lock button); auto-lock engaging on its own (countdown elapsed); attempting to mark a point while the interface is locked, or a point that's individually blocked (gray/black) |
| `Warn` | A point mark that triggers a system blackout (site reused too early) |
| `Success` | A point mark with no blackout; manual block/unblock of a point; clearing a point; clearing all data; undo; successful export/import; any menu setting change (mirror toggle, auto-lock enable/disable/edit, days-to-white) |
| `Error` | A failed import (corrupt/invalid file) |

`MainScreen`'s `showToast` (message, status, optional duration — defaults to `TOAST_DURATION_MS`) covers point-level actions (mark/block/clear, both driven off the shared `buildPointAddressSuffix` helper) and the interface lock toggle. `BottomMenu` receives it as an `onNotify` prop for actions it owns end-to-end (undo, clear all, export, import success/failure, and every `MenuSheet`/`AutoLockDialog`/`DaysToWhiteDialog` setting change), since those confirm/cancel flows live entirely inside that component. `useAppStore` itself takes an optional `onAutoLockFired` callback (read through a ref so passing a fresh closure each render doesn't retrigger the countdown effect), invoked only when the auto-lock countdown elapses on its own — not when the user locks the interface manually, which the caller already notifies itself.

**Every completed user action must show a toast.** When adding a new one (a new point action, a new menu setting, anything that completes an operation), don't pick its message/status unilaterally — propose the toast text and the suggested `ToastStatus` and let the user confirm that status, pick a different one, or decline the toast entirely before wiring it in.

---

## Zones and buttons

6 zones, 30 buttons total. All button positions are fractions (0–1) of the body image container (393.46×621.91, matching `body.png`'s aspect ratio), extracted directly from the Figma "with buttons" frame (node `27:744`, file `grYg39698ogy0nEBd88Fup`). Each button renders as a 25 px knob (state colour fill) inside a 35 px radial-gradient glow halo tinted with its zone's `glow` colour (see `ZONE_COLORS` in `src/data/zones.ts`).

### Zone list

| Zone ID | Label | Group | Buttons | Accent | Glow |
|---|---|---|---|---|---|
| `shoulder-right` | Правое плечо | shoulders-and-belly | 3 (vertical column) | `#F5D020` | `#C4A800` |
| `shoulder-left` | Левое плечо | shoulders-and-belly | 3 (vertical column) | `#F5D020` | `#C4A800` |
| `belly-right` | Живот справа | shoulders-and-belly | 9 (3×3 grid) | `#36D97A` | `#22A85E` |
| `belly-left` | Живот слева | shoulders-and-belly | 9 (3×3 grid) | `#36D97A` | `#22A85E` |
| `thigh-right` | Правое бедро | thighs | 6 (2×3 grid) | `#FF8C33` | `#CC6800` |
| `thigh-left` | Левое бедро | thighs | 6 (2×3 grid) | `#FF8C33` | `#CC6800` |

### Point address

Each button has a body-relative address — `row` (1-indexed, top to bottom within its zone) and `column` (1-indexed, counted outward from the body's own vertical midline, 1 = closest to center) — shown in `ButtonContextMenu` (long-press menu) and in the toast shown after marking a point (tap-to-press, or the context menu's "Отметить" dialog — see `buildMarkToastMessage` in `MainScreen.tsx`, which also includes the zone label). Computed once at module load as `BUTTON_ADDRESS` in `src/data/zones.ts` from each zone's `ZONE_LAYOUT`/`BUTTONS_BY_ZONE` (row-major flat-array index → row/raw column, then the column is flipped to count from center depending on whether the zone's canonical, unmirrored position falls left or right of the body midline `x = 0.5`). The address is fixed to the point's own anatomy and does **not** change when mirror mode is toggled — mirroring only changes which screen half a zone renders on, never the point's row/center-relative position.

The mark-confirmation toast (`buildMarkToastMessage`) adds two conditional lines on top of the address: it re-runs the pure `onPress` from `stateMachine.ts` against the pre-mark button state to detect a `PressResultType.Blackout` outcome (site reused too early) and calls that out along with the triggered `blackoutDurationDays` (e.g. "заблокирована системой на 4 дня", via `pluralDays`), and it compares the marked timestamp against `Date.now()` — if it's more than `MARK_BACKDATED_THRESHOLD_MS` (`src/constants.ts`) in the past, the toast also shows the marked date/time via `formatDateTime` (`src/format.ts`, shared with `ButtonContextMenu`'s info lines). A plain tap is never backdated (its timestamp is always "now"); only the context menu's "Отметить" dialog (custom date/time picker) can trigger the backdated line.

### Group indicators

- **thighs** group: checkmark (✓) shown on the most recently used button across both thigh zones.
- **shoulders-and-belly** group: checkmark shown on the most recently used button across shoulders + belly zones.

Derived by scanning `events[]` from newest to oldest, skipping `manual-block` / `manual-unblock` events.

---

## Known limitations / TODO

- [ ] No safe-area handling for devices with home indicator (bottom padding is hardcoded to 28 px)
- [ ] Haptics do not fire on Android Expo Go (native module not available in managed workflow without dev build)
- [ ] Dark mode not yet implemented
- [ ] English locale not implemented (Russian only)
- [ ] `npm audit` reports 10 moderate vulnerabilities in dev dependencies — not production-critical
