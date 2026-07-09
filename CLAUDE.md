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
├── theme/
│   ├── palette.ts          — ThemeColors interface + DARK_COLORS/LIGHT_COLORS palettes (app chrome only)
│   └── ThemeContext.tsx    — ThemeProvider/useTheme() (owns + persists ThemeMode, resolves it against OS scheme → colors)
├── storage/storage.ts      — AsyncStorage load/save/clear
├── store/useAppStore.ts    — React hook: combines storage + state machine
├── components/
│   ├── InjectionButton.tsx — single injection point button
│   ├── ButtonContextMenu.tsx — long-press menu for a single point (address, history, actions)
│   ├── BottomMenu.tsx      — Undo / Menu / Help / Lock bar
│   ├── AutoLockDialog.tsx  — edit auto-lock delays (opened from MenuSheet)
│   ├── DaysToWhiteDialog.tsx — edit the "days to white" setting (opened from MenuSheet)
│   ├── ThemeDialog.tsx     — edit the theme setting (Light/Dark/System, opened from MenuSheet)
│   ├── ImportExportOptions.tsx — shared "marks" checkbox + "settings" accordion (one checkbox per `ExportSettingKey`), used by both ExportOptionsDialog and ImportOptionsDialog; takes an `ExportSelection` + `onSelectionChange`, plus optional `marksDisabled`/`disabledSettingKeys` (an `ExportSettingKey[]`) so the import side can grey out categories absent from the file — also exports `isSelectionEmpty`/`SETTING_KEYS` helpers
│   ├── ExportOptionsDialog.tsx — pick which categories (marks / app settings) go into the export file, via ImportExportOptions
│   ├── ImportOptionsDialog.tsx — pick which categories to actually apply from a parsed import file, via ImportExportOptions; a category absent from the file is passed in as disabled (nothing to import for it), and the settings accordion checkbox is disabled once all four of its sub-rows are
│   ├── icons/              — one file per icon component (e.g. UndoIcon.tsx, MenuIcon.tsx)
│   └── common/             — generic, domain-agnostic UI primitives, reusable outside this app
│       ├── Modal.tsx       — full-screen overlay + backdrop
│       ├── Dialog.tsx      — confirm/cancel modal (built on Modal), optional `confirmDisabled`
│       ├── ContextMenu.tsx — action-list modal (built on Modal)
│       ├── ConfirmDialog.tsx — title/message confirm wrapper (built on Dialog)
│       ├── BottomSheet.tsx — swipe-to-dismiss bottom sheet
│       ├── Toast.tsx       — transient status message banner (info/warn/success/error, own icon + color per status)
│       ├── TimeField.tsx   — minutes/seconds picker pair (used by AutoLockDialog)
│       ├── NumberPickerField.tsx — single labeled numeric picker (used by DaysToWhiteDialog)
│       ├── Checkbox.tsx    — labeled checkbox row, supports `indeterminate` and `disabled` (used by ImportExportOptions)
│       ├── Chevron.tsx     — small directional (`down`/`right`) arrow built from a rotated bordered box (no SVG); animates between the two rotations via `Animated.Value`
│       └── Accordion.tsx   — generic expand/collapse group, smooth via `LayoutAnimation`; `label` is a `ReactNode` so a caller-supplied control (e.g. a checkbox) keeps its own tap target since RN gives touch priority to the innermost responder — Accordion itself holds no checkbox logic (used by ImportExportOptions); optional `disabled` prop blocks the header tap (no expand/collapse) and dims the chevron — used by ImportExportOptions when the whole group's checkbox is disabled (ImportOptionsDialog, when the file carries no settings at all)
└── screens/MainScreen.tsx  — root screen composing all components
App.tsx                     — entry point (mounts ThemeProvider above MainScreen)
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
- Types that enumerate string constants must be TypeScript `enum`s, not string-literal unions (e.g. `ButtonColor`, `ZoneGroup`, `ZoneId`, `AppEventType`, `AutoLockDialogMode`, `ToastStatus`, `ThemeMode` in `src/types/index.ts`). Reference values as `EnumName.Member`, never as raw string literals.
- Discriminated-union result types (e.g. `PressResult` in `src/logic/stateMachine.ts`, `ImportResult` in `src/storage/storage.ts`) use `type` as the discriminant field name (not `kind`), backed by its own enum (e.g. `PressResultType`, `ImportResultType`).
- No inline color literals (hex/`rgba`) in component styles. Chrome colors (surfaces, text, borders, icons, switches — anything that should flip between light/dark) are fields on `ThemeColors` (`src/theme/palette.ts`), read via `const { colors } = useTheme()` (`src/theme/ThemeContext.tsx`), never imported as flat constants. Colors that are deliberately theme-invariant (the `ButtonColor` cycle in `stateMachine.ts`, `ZONE_COLORS` in `data/zones.ts`, toast status colors) stay as plain constants in their own file/`src/constants.ts`, since they carry fixed semantic meaning independent of app chrome. A color literal used in 2+ places with the same semantic role is a shared constant (a `ThemeColors` field, or `src/constants.ts` if theme-invariant); one used in only one place is still a named constant, declared locally in the file/component where it applies (not inlined). Two literals that happen to share a value by coincidence, but mean different things (e.g. a UI accent color vs. an unrelated injection-cycle color in `stateMachine.ts`), are kept as separate constants — never merged just because the value matches.
- The same rule applies to non-color literals: no unnamed "magic" numbers (durations, thresholds, sizes) or magic strings (UI labels, storage keys, MIME types, format patterns) in component/logic code. A value reused in 2+ places for the same reason is a shared constant in `src/constants.ts` (or a shared helper in `src/format.ts` for repeated formatting logic, e.g. `pad2`, `splitSeconds`, `SECONDS_PER_MINUTE`); a single-use but deliberate value is still a named local constant in the file where it applies. Ordinary one-off layout numbers (an arbitrary `padding`/`fontSize`/`borderRadius` with no cross-cutting meaning) and one-off prose don't need this — only values that encode an actual decision. Coincidental value matches with unrelated meaning are kept as separate constants, same as colors.
- **Keep this file current**: whenever a change affects code style, project structure, or any other app-wide convention (not just a single file's internals), add or update the relevant note in this CLAUDE.md in the same change. Treat an out-of-date CLAUDE.md as a bug.
- **Keep README.md current too**: whenever a change affects the project description, features, setup/scripts, or structure, update README.md in the same change, not just CLAUDE.md.
- **Every new menu setting must round-trip through storage and export/import**, following the pattern set by `mirrored`/`autoLock*`/`daysToWhite`: its own AsyncStorage key + `load.../save...` pair in `src/storage/storage.ts`, a field on `ExportedAppData` in `src/types/index.ts`, a matching optional-type check in `isValidAppStorage`, inclusion in `useAppStore`'s `exportData`/`applyImport`, `BottomMenu`'s `buildImportData` filter, and a row label constant in `src/constants.ts` documented in HelpSheet's "Пункты меню" section. If the setting is a standalone toggle/value shown in `MenuSheet` (not bundled into an existing row like auto-lock's three fields), also add it to `ExportSettingKey`, `ImportExportOptions`'s `SETTING_LABEL` map, and `ImportOptionsDialog`'s `SETTING_AVAILABLE` map so it gets its own checkbox on both sides — see "Selective export / merge import" below. `themeMode` follows the same storage/export/import contract but, uniquely, isn't held in `useAppStore`'s state — see "Theme" below for why.

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

// ExportedAppData — AppStorage fields plus settings that live in their own
// AsyncStorage keys, written out as one JSON file by export/import. Every
// field is optional: ExportOptionsDialog lets the user write only a subset
// of categories, and a missing field on import means "leave this category
// untouched", not "reset to default" — see "Selective export / merge
// import" below.
interface ExportedAppData {
  buttonStates?: Record<string, StoredButtonState>;
  events?: AppEvent[];
  mirrored?: boolean;
  autoLockEnabled?: boolean;
  autoLockAfterMarkSeconds?: number;
  autoLockAfterUnlockSeconds?: number;
  daysToWhite?: number;  // 1–8, default 8 — see "Button colour state machine" below
  themeMode?: ThemeMode; // Light/Dark/System, default System — see "Theme" below
}
```

Storage keys: `@insulin_shot_tracker_v1` (buttonStates/events), plus one key per setting (mirror, interface-locked, auto-lock, `daysToWhite`, `themeMode`) — see `src/storage/storage.ts`.

---

## Selective export / merge import

The **"Экспорт..."** row (`MenuSheet`) opens `ExportOptionsDialog.tsx` instead of exporting immediately; the **"Импорт..."** row similarly opens `ImportOptionsDialog.tsx` over the parsed file instead of applying it outright. Both render the same `ImportExportOptions.tsx` (`src/components/ImportExportOptions.tsx`): a top-level **"Отметки точек укола"** checkbox (`buttonStates`/`events`) plus a **"Настройки приложения"** accordion of four sub-checkboxes, one per `ExportSettingKey` (`Mirrored`/`AutoLock`/`DaysToWhite`/`Theme`, `src/types/index.ts`), built on the generic `Accordion` common component (`src/components/common/Accordion.tsx`), which knows nothing about checkboxes — `ImportExportOptions` passes a `Checkbox` (with its own `label` prop) directly as `Accordion`'s `label` node. In `Checkbox.tsx`, only the 22×22 box is a `TouchableOpacity`; the label text next to it is plain `Text`, not touchable. So tapping that checkbox's box bulk-toggles (and shows indeterminate for a partial selection of) the four sub-checkboxes, labeled with the same row-label constants as `MenuSheet` — while tapping its label text (or the chevron) falls through to `Accordion`'s own header `TouchableOpacity` and toggles `expanded` instead, since React Native gives touch priority to the innermost responder and the text itself isn't one. Expanding/collapsing animates via `LayoutAnimation` (`Accordion`) and the chevron's rotation animates via `Animated.Value` (`Chevron`). The group starts collapsed, and the selection is untouched by expand/collapse.

`ImportExportOptions` is a controlled component: it takes the current `ExportSelection` (`{ marks: boolean; settings: Record<ExportSettingKey, boolean> }`) and an `onSelectionChange`, and two optional props — `marksDisabled` and `disabledSettingKeys` (an `ExportSettingKey[]`) — that grey out and disable individual rows; both default to "nothing disabled" (`[]`), which is exactly `ExportOptionsDialog`'s case, since every category is always available to export. It also exports `isSelectionEmpty(selection)`, used by both dialogs to disable their Confirm button while nothing is selected, and `SETTING_KEYS` (`Object.values(ExportSettingKey)`). `ExportOptionsDialog` owns the `ExportSelection` state (defaulting to everything checked) and passes it straight through; its resulting selection is passed to `useAppStore`'s `exportData(themeMode, selection)`, which builds the `ExportedAppData` object with only the selected keys set — unselected categories are omitted entirely, not written with a default/empty value (see `ExportedAppData`'s comment above).

Import mirrors this on the way back in: `storage.ts`'s `isValidAppStorage` only validates fields that are present, and `pickImportFile` returns the parsed data as-is (normalizing `buttonStates` to include every current `BUTTONS` entry only when that category is present, rather than defaulting missing categories). `ImportOptionsDialog` derives `marksDisabled`/`disabledSettingKeys` from whether each field is actually present on the parsed `ExportedAppData` (its `SETTING_AVAILABLE` map, e.g. `data.daysToWhite !== undefined`) and passes them into `ImportExportOptions`, so a category absent from the file is forced unchecked and can't be selected; the "Настройки приложения" accordion checkbox is itself disabled by `ImportExportOptions` once every one of its four sub-rows is (i.e. the file carries no settings at all) — and `Accordion`'s own `disabled` prop then also blocks expanding/collapsing that group. Confirming calls `BottomMenu`'s local `buildImportData(data, selection)`, which narrows the parsed file down to just the checked categories (mirroring `exportData`'s filter on the way out), before handing that filtered object to `useAppStore`'s `applyImport`/`importStorage`, which persist and merge only the fields present — an omitted category's current state and AsyncStorage value are left untouched rather than reset. This lets e.g. a settings-only export be imported without wiping injection history, or only auto-lock (not theme) be applied from a file that has both. `MainScreen`'s `onApplyImport` only calls `onSetThemeMode` when `data.themeMode !== undefined`, for the same reason — which now also covers the user deliberately unchecking the theme row in `ImportOptionsDialog`.

---

## Theme

The app supports light, dark, and system-matched themes via the **"Тема"** row in the menu (`ThemeDialog.tsx`, opened from `MenuSheet`), backed by the `ThemeMode` enum (`Light`/`Dark`/`System`) in `src/types/index.ts`. It's persisted with its own AsyncStorage key (`load.../saveThemeMode` in `src/storage/storage.ts`) and round-trips through export/import as `ExportedAppData.themeMode`, defaulting to `ThemeMode.System`.

Unlike every other menu setting, `themeMode` is **not** held in `useAppStore`'s state — it's owned end to end by `ThemeProvider` (`src/theme/ThemeContext.tsx`), since `<ThemeProvider>` is mounted in `App.tsx`, above `MainScreen` (and therefore above the `useAppStore()` call that lives inside it). `src/theme/palette.ts` defines the `ThemeColors` interface plus `DARK_COLORS`/`LIGHT_COLORS` — every chrome color (surfaces, text, borders, dividers, icons, switches, the bottom bar, dialogs/sheets/menus, the status bar). `ThemeProvider` loads the persisted `ThemeMode` on mount, resolves it against the live OS appearance (via React Native's `useColorScheme()`) into a `resolvedScheme` (`Light`/`Dark`) and the matching `ThemeColors`, and exposes `{ mode, resolvedScheme, colors, setMode }` through context — consumed anywhere in the tree, including `MainScreen` itself, with `const { colors } = useTheme();`. `MainScreen` reads `mode`/`setMode` (aliased to `themeMode`/`onSetThemeMode`) to pass down to `BottomMenu`, and threads `themeMode` into `useAppStore().exportData(themeMode)` and calls `setMode(data.themeMode)` after `applyImport(data)`, since `useAppStore` itself no longer tracks or persists this setting.

Domain/status colors are deliberately **not** theme-dependent and stay as plain constants: the injection-cycle `ButtonColor` palette (`COLOR_HEX` in `stateMachine.ts`), the per-zone `accent`/`glow` colors (`ZONE_COLORS` in `data/zones.ts`), and the toast status colors (`TOAST_*_COLOR`/`TOAST_*_BACKGROUND_COLOR`/`TOAST_TEXT_COLOR` in `constants.ts`) all carry fixed semantic meaning (day count, zone identity, message severity) and are self-contained saturated colors that read fine on either background. `body.png` is likewise reused unchanged in both themes (it's a solid-filled illustration, not linework that depends on the surface behind it).

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

Toasts stack: each new one renders above older ones (`ToastStack`, `src/components/common/ToastStack.tsx`, rendering a `ToastEntry[]` newest-first) instead of replacing them, and each entry (`Toast`, `src/components/common/Toast.tsx`) fades itself in/out and self-dismisses after its own `duration`. `MainScreen` caps the stack at `MAX_STACKED_TOASTS` (`src/constants.ts`), dropping the oldest entry once a new one would exceed it.

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
