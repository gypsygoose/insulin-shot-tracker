# Insulin Shot Tracker — Project Documentation

## Overview

Mobile app for people with diabetes who take insulin injections to track insulin injection sites and enforce maximum rotation to prevent lipodystrophy. Users tap a point to log an injection; the point changes colour over a configurable number of days (1–8, default 8) to show when the site is safe to reuse.

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
├── types/                  — shared TypeScript types, split by entity, one file per entity (e.g. src/types/zone.ts, src/types/point.ts) — index.ts is a barrel (`export * from './<entity>'`) so the rest of the app keeps importing from `../types`
│   ├── zone.ts             — ZoneGroup, ZoneId, ZoneType, Zone, ZoneLayout, ZoneGridConfig, ZonePointCounts, EnabledZones, ZoneRuntimeData
│   ├── point.ts            — PointColor, PointDefinition, PointAddress, StoredPointState
│   ├── event.ts            — AppEventType, AppEvent
│   ├── storage.ts          — AppStorage, ExportedAppData, ExportSettingKey, ExportSelection
│   ├── theme.ts            — ThemeMode
│   ├── language.ts         — LanguageMode
│   ├── toast.ts            — ToastStatus
│   ├── autoLock.ts         — AutoLockDialogMode
│   └── index.ts            — barrel re-export of the above
├── constants.ts            — shared non-text UI constants (durations, thresholds, sizes, theme-invariant status colors) — user-facing text lives in src/i18n/ instead
├── utils/                  — root-level shared helper functions, one per file, used from more than one otherwise-unrelated place (pad2.ts, formatDateTime.ts, splitSeconds.ts, uuid.ts, lastPressedByGroup.ts) + index.ts (barrel) — see "Helper function / hook placement" below
├── hooks/                  — root-level shared React hooks, one per file (useAppStore.ts: combines storage + state machine) + index.ts (barrel) — see "Helper function / hook placement" below
├── data/                   — zones.ts (zone metadata: ZONES/ZONE_MAP/ZONE_MIRROR_MAP/ZONE_TYPE/ZONE_TYPE_ZONE_IDS (both ZoneIds sharing a ZoneType, right then left), plus ZONE_LABEL_KEY/ZONE_TYPE_LABEL_KEY: translation keys for each zone's/zone-type's label, typed `Record<ZoneId|ZoneType, TranslationKey>` — `TranslationKey` imported from `../i18n/types` directly, not the `../i18n` barrel, since that barrel re-exports `./hooks` → `LanguageContext.tsx` → `StorageService` → `data/`, which would make a `data/` → `../i18n` barrel import circular. Point positions/counts are no longer static: `DEFAULT_ZONE_POINT_COUNTS` is the starting `ZonePointCounts` value, `DEFAULT_ENABLED_ZONES` is the starting `EnabledZones` value (every zone enabled), and `buildZoneData(zonePointCounts, enabledZones)` computes the per-`ZoneId` `ZoneLayout`/points/point-map/point-address fresh from the current settings — see "Zones and points" below) + index.ts (barrel, `export * from './zones'`)
├── logic/
│   ├── PointService.ts     — static-methods-only class: color computation, press handling (public surface only — its private day-math/color-cycle helpers live in logic/utils/ as standalone functions, called unqualified since utils/ is a separate module; its own types/constants live in logic/types.ts and logic/constants.ts, module-scoped the same way theme/types.ts and storage/constants.ts are). Public: `activeCycleColors`, `computePointColor`, `getBlackoutEndAt`, `onPress`, `colorLabel`, `checkmarkColor`. Private: `blackoutDurationFor` (called only from `onPress`). `toggleManualBlock` (the former simple `{ ...state, isManuallyBlocked: !state.isManuallyBlocked }` toggle) was removed as dead code — every call site sets `isManuallyBlocked` directly instead (see `useAppStore.ts`)
│   ├── PointService.test.ts
│   ├── types.ts            — PressResultType/PressResult (onPress's discriminated-union result), ColorLabelType/ColorLabelDescriptor (colorLabel's return descriptor) — used both within PointService.ts and by outside consumers via logic/index.ts
│   ├── constants.ts        — DAY_MS, FULL_CYCLE_COLORS/COLOR_REMOVAL_ORDER (logic/utils/activeCycleColors.ts's inputs), COLOR_HEX — DAY_MS is also imported directly by logic/utils/localDayIndex.ts (a same-folder-tree reach, not through a barrel, since utils/ sits inside logic/)
│   ├── utils/              — helpers used by PointService.ts: localDayIndex.ts, daysBetween.ts, activeCycleColors.ts, injectionCycleColor.ts, postBlackoutColor.ts, + index.ts (barrel; re-exports the four PointService.ts imports — localDayIndex is internal to daysBetween.ts and stays out). `activeCycleColors.ts` holds the actual color-cycle-compression logic; `PointService.activeCycleColors` (its public surface) just delegates to it. `injectionCycleColor.ts`/`postBlackoutColor.ts` call the sibling `activeCycleColors.ts` directly (a same-folder import, not through the barrel) rather than `PointService.activeCycleColors(...)` — calling back into PointService.ts from here would circularly import PointService.ts → logic/utils/index.ts → PointService.ts
│   └── index.ts            — barrel re-export of logic/'s external surface only: `PointService` from PointService.ts; `PressResultType`/`PressResult`/`ColorLabelType`/`ColorLabelDescriptor` from types.ts; `COLOR_HEX` from constants.ts — code outside `logic/` imports from `"../logic"`, never by reaching into `"../logic/PointService"`/`"../logic/types"`/`"../logic/constants"` directly
├── theme/
│   ├── palette.ts          — DARK_COLORS/LIGHT_COLORS palettes (app chrome, plus the one theme-selected domain exception, zoneColors — see "Zones and points")
│   ├── types.ts            — ThemeColors/ZoneColorPair/ResolvedScheme/ThemeContextValue (module-scoped, not in src/types/ — consumed only within theme/ plus ThemeColors/ResolvedScheme read by the rest of the app via useTheme())
│   ├── ThemeContext.tsx    — the created `ThemeContext` object + `ThemeProvider` (owns + persists ThemeMode, resolves it against OS scheme → colors)
│   ├── hooks/useTheme.ts   — private hook, only used outside theme/ (reads `ThemeContext` directly from `../ThemeContext`, same reach-into-parent pattern as utils/resolveScheme.ts below), + index.ts (barrel)
│   ├── utils/resolveScheme.ts — private helper, only used by ThemeContext.tsx, + index.ts (barrel)
│   └── index.ts            — barrel (`export * from './palette'` + `export * from './types'` + `export * from './ThemeContext'` + `export * from './hooks'`)
├── i18n/
│   ├── index.ts            — i18next singleton setup (resources, device-locale-based initial language, fallbackLng); re-exports `TranslationKey` (dot-path union of every key in locales/en.ts, actually defined in `./types` — see below) as a type-only export; imports `en`/`ru` from `./locales` and `getDeviceLanguage` from `./utils` — both barrels, since index.ts is itself outside those two subfolders; also re-exports `./hooks` (`useLanguage`), which reaches `LanguageContext.tsx`
│   ├── i18next.d.ts        — module augmentation typing every t() call app-wide against locales/en.ts's key shape (imports `AppLocale` from `./locales`)
│   ├── LanguageContext.tsx — exported `LanguageContext` object + `LanguageProvider` (owns + persists LanguageMode, resolves it against the device locale via utils/deviceLanguage.ts → calls i18next.changeLanguage()) — deliberately **not** re-exported by `index.ts`'s barrel itself and always imported directly as `"./i18n/LanguageContext"`, since `App.tsx` needs `LanguageProvider` mounted above everything else that calls `useTranslation()` — see `hooks/useLanguage.ts` below for the one piece of this module that *is* re-exported through `index.ts`. Imports the `i18next` package directly (`import i18next from "i18next"`), not the initialized instance re-exported from `./index` — the package's default export is the same singleton instance app-wide regardless of which file imports it, so importing it directly here avoids a module cycle back through `hooks/useLanguage.ts` (which `index.ts`'s own barrel re-exports)
│   ├── types.ts            — `LanguageContextValue` (module-scoped, not in `src/types/` — consumed only within `i18n/`, by `LanguageContext.tsx` and `hooks/useLanguage.ts`), same pattern as `theme/types.ts`'s `ThemeContextValue`; also `TranslationKey` (and its private `LeafPaths` helper type) — computed here rather than in `index.ts` so `data/zones.ts` can import it directly as `"../i18n/types"` instead of the `"../i18n"` barrel, which would otherwise cycle back through `data/` (see the `data/` entry above); re-exported as a type from `index.ts` for every other consumer, which imports it as `"../i18n"`/`"../../i18n"` like any other i18n export
│   ├── hooks/useLanguage.ts — private hook, only used outside i18n/ (reads `LanguageContext` directly from `../LanguageContext`, same reach-into-parent pattern as `theme/hooks/useTheme.ts`), + index.ts (barrel) — re-exported by `i18n/index.ts`'s own barrel (`export * from "./hooks"`), so consumers import it as `"../../i18n"` like any other i18n export, not `"../../i18n/hooks"`
│   ├── utils/
│   │   ├── deviceLanguage.ts — getDeviceLanguage(): reads only the device's primary/top-priority locale (Localization.getLocales()[0]) — shared by index.ts's initial guess and LanguageContext.tsx's System-mode resolution so they can't drift out of sync
│   │   ├── resolveLanguage.ts — private helper, only used by LanguageContext.tsx
│   │   └── index.ts        — barrel (`getDeviceLanguage`, `ResolvedLanguage`, `resolveLanguage`)
│   └── locales/
│       ├── en.ts            — English translation resources — source of truth for the key shape, exports the `AppLocale` type
│       ├── ru.ts            — Russian translation resources, typed as `AppLocale` (imported directly from sibling `./en`, not the barrel) so a missing key is a compile error
│       └── index.ts        — barrel (`en`, `ru`, `AppLocale`)
├── storage/
│   ├── storage.ts          — `StorageService`, a class of static methods only (`StorageService.loadStorage()`, `.saveThemeMode()`, ...) — the module's public API; no instance is ever created
│   ├── types.ts            — StoredAutoLock, ImportResultType/ImportResult (consumed outside storage/ too — by useAppStore.ts and BottomMenu.tsx — so re-exported via index.ts, unlike constants.ts below)
│   ├── constants.ts        — AsyncStorage keys (including ZONE_POINT_COUNTS_KEY/ENABLED_ZONES_KEY), STORED_TRUE/STORED_FALSE boolean-as-string encoding, JSON/export-file constants, THEME_MODES/LANGUAGE_MODES — private to StorageService.ts, not re-exported by index.ts (nothing outside StorageService.ts needs them)
│   ├── utils/              — helpers private to StorageService.ts: defaultStorage.ts, normalizeStorage.ts, defaultAutoLock.ts, clampDaysToWhite.ts, clampZonePointCounts.ts, clampEnabledZones.ts, isValidPointState.ts, isValidEvent.ts, isValidAppStorage.ts, isValidZonePointCounts.ts, isValidEnabledZones.ts, migrateLegacyPointIds.ts, + index.ts (barrel; re-exports everything StorageService.ts needs — isValidEvent/isValidPointState/isValidZonePointCounts/isValidEnabledZones are internal to isValidAppStorage.ts, and migrateLegacyPointIds is internal to normalizeStorage.ts, so all stay out). `defaultStorage`/`normalizeStorage` take the current ZonePointCounts+EnabledZones-derived active-points list as a parameter (not a static import) — see "Zones and points" below; `migrateLegacyPointIds` (run at the top of `normalizeStorage`) is the one-time rewrite of pre-setting flat-index point ids (`sr-0`) into the current row/col-keyed scheme (`sr-r1c1`)
│   └── index.ts            — barrel (`export * from './StorageService'` + `export * from './types'` + `export { normalizeStorage } from './utils'`, reused outside storage/ by useAppStore.ts to backfill default point states after a ZonePointCounts change)
├── components/
│   ├── index.ts            — top-level barrel: re-exports the five flat dialogs below, every `ComponentName/` folder's own barrel, and (transitively) `common/`'s and `icons/`' barrels — the one import consumers outside `components/` (i.e. `screens/`) use; never imported from *within* `components/` itself (that would cycle back through whichever subfolder is doing the importing — see the "always import a folder via its own index.ts" convention below)
│   ├── AutoLockDialog.tsx, DaysToWhiteDialog.tsx, ThemeDialog.tsx, LanguageDialog.tsx, MarkDialog.tsx — components with no private hook/util/constant/type of their own stay a single flat file (edit auto-lock delays / days-to-white / theme / language from MenuSheet, and the custom-date "Отметить" dialog, respectively)
│   ├── InjectionPoint/     — InjectionPoint.tsx (single injection point button) + constants.ts (GLOW_SIZE/KNOB_SIZE/LONG_PRESS_DELAY_MS) + index.ts
│   ├── PointContextMenu/   — PointContextMenu.tsx (long-press menu for a single point: address, history, actions) + utils/ (formatCountdown.ts + index.ts) + index.ts
│   ├── BottomMenu/         — BottomMenu.tsx (Undo / Menu / Help / Lock bar) + utils/ (buildImportData.ts + index.ts) + index.ts
│   ├── ImportExportOptions/ — ImportExportOptions.tsx (shared "marks" checkbox + "settings" accordion, one checkbox per `ExportSettingKey`, used by both ExportOptionsDialog and ImportOptionsDialog; takes an `ExportSelection` + `onSelectionChange`, plus optional `marksDisabled`/`disabledSettingKeys` so the import side can grey out categories absent from the file) + utils/ (isSelectionEmpty.ts + index.ts) + constants.ts (SETTING_KEYS) + index.ts
│   ├── ExportOptionsDialog/ — ExportOptionsDialog.tsx (pick which categories go into the export file, via ImportExportOptions) + utils/ (allSettings.ts + index.ts) + index.ts
│   ├── ImportOptionsDialog/ — ImportOptionsDialog.tsx (pick which categories to actually apply from a parsed import file, via ImportExportOptions; a category absent from the file is passed in as disabled, and the settings accordion checkbox is disabled once all four of its sub-rows are) + utils/ (availableSettings.ts + index.ts) + index.ts
│   ├── MenuSheet/          — MenuSheet.tsx + utils/ (formatDuration.ts + index.ts) + constants.ts (THEME_MODE_KEY/LANGUAGE_MODE_KEY, also imported by BottomMenu/ThemeDialog/LanguageDialog) + index.ts
│   ├── HelpSheet/          — HelpSheet.tsx + utils/ (colorOrder.ts + formatColorLabel.ts + index.ts) + index.ts
│   ├── ZoneContainer/      — ZoneContainer.tsx (takes the current `zoneLayout`/`pointsByZone` maps as props, not static imports — see "Zones and points" below) + utils/ (chunk.ts + index.ts) + constants.ts (DARK_FILL_ALPHA/DARK_BORDER_ALPHA/LIGHT_FILL_ALPHA/LIGHT_BORDER_ALPHA) + index.ts
│   ├── ZonePointsDialog/   — ZonePointsDialog.tsx (edit the per-zone-type point grid: one collapsed-by-default `Accordion` per `ZoneType` — Плечи/Живот/Бёдра — each with two `NumberPickerField` selectors, rows and columns, range 1 to that type's own `ZONE_MAX_GRID` entry) + utils/ (buildRangeOptions.ts + index.ts) + index.ts
│   ├── ZonesDialog/        — ZonesDialog.tsx (edit which individual zones are enabled: one collapsed-by-default `Accordion` per `ZoneType`, same three groups as `ZonePointsDialog`, each with a bulk header `Checkbox` — built the same way `ImportExportOptions`' "Настройки приложения" accordion is, a `Checkbox` passed directly as `Accordion`'s `label` — plus two per-side `Checkbox` rows, e.g. Левое плечо/Правое плечо) + utils/ (allDisabled.ts: true once every zone in a candidate `EnabledZones` would be off, used to reject a toggle that would leave none enabled + index.ts) + index.ts
│   ├── icons/              — one file per icon component (e.g. UndoIcon.tsx, MenuIcon.tsx) + index.ts (barrel)
│   └── common/             — generic, domain-agnostic UI primitives, reusable outside this app, + index.ts (barrel)
│       ├── Modal.tsx       — full-screen overlay + backdrop
│       ├── Dialog.tsx      — confirm/cancel modal (built on Modal), optional `confirmDisabled`
│       ├── ContextMenu.tsx — action-list modal (built on Modal)
│       ├── ConfirmDialog.tsx — title/message confirm wrapper (built on Dialog)
│       ├── BottomSheet/    — BottomSheet.tsx (swipe-to-dismiss bottom sheet) + constants.ts + index.ts
│       ├── Toast/          — Toast.tsx (transient status message banner: info/warn/success/error, own icon + color per status) + constants.ts (STATUS_ICON/STATUS_BORDER_COLOR/STATUS_BACKGROUND_COLOR) + index.ts
│       ├── TimeField.tsx   — minutes/seconds picker pair (used by AutoLockDialog)
│       ├── NumberPickerField.tsx — single labeled numeric picker (used by DaysToWhiteDialog)
│       ├── Checkbox.tsx    — labeled checkbox row, supports `indeterminate` and `disabled` (used by ImportExportOptions)
│       ├── Chevron/        — Chevron.tsx (small directional (`down`/`right`) arrow built from a rotated bordered box, no SVG; animates between the two rotations via `Animated.Value`) + constants.ts + types.ts (`ChevronDirection`, moved out of `Chevron.tsx` once `constants.ts` needed it too — a same-folder cross-file type use, per the "moves into types.ts" rule below) + index.ts
│       └── Accordion.tsx   — generic expand/collapse group, smooth via `LayoutAnimation`; `label` is a `ReactNode` so a caller-supplied control (e.g. a checkbox) keeps its own tap target since RN gives touch priority to the innermost responder — Accordion itself holds no checkbox logic (used by ImportExportOptions); optional `disabled` prop blocks the header tap (no expand/collapse) and dims the chevron — used by ImportExportOptions when the whole group's checkbox is disabled (ImportOptionsDialog, when the file carries no settings at all)
└── screens/                — index.ts (barrel, `export { MainScreen } from './MainScreen'`)
    └── MainScreen/         — MainScreen.tsx (root screen composing all components) + utils/ (buildPointAddressSuffix.ts + buildMarkToastMessage.ts + index.ts) + index.ts
App.tsx                     — entry point (mounts I18nextProvider, LanguageProvider, and ThemeProvider above MainScreen; imports `MainScreen` from `./src/screens`, `ThemeProvider` from `./src/theme`, `LanguageProvider` from `./src/i18n/LanguageContext` directly per the exception above)
```

**Every folder that exports something has an `index.ts`, and anything outside that folder imports through it — never by reaching into a concrete file inside it.** This applies uniformly: every component/hook/util folder (i.e. every `ComponentName/` entry with its own `hooks/`/`utils/`/`constants.ts`/`types.ts`) exports through its own `index.ts` (`export { ComponentName } from './ComponentName'`, plus any other re-exports a sibling file needs), so an import like `from "./MenuSheet"` keeps working unchanged whether the target used to be a single file or is now a folder — and the same rule extends to every other folder in the tree, including root-level `utils/`/`hooks/`/`data/`/`storage/`/`theme/`, every nested `utils/` folder (`logic/utils/`, `i18n/utils/`, `storage/utils/`, `theme/utils/`, and each component's own `utils/`), nested `hooks/` folders (`theme/hooks/`), `i18n/locales/`, and the umbrella `components/`, `components/common/`, `components/icons/`, and `screens/` folders. A barrel re-exports only what's actually consumed from outside the folder (`реекспортируй только то, что может пригодиться снаружи`) — a helper used only by a sibling file *inside* the same folder (e.g. `isValidEvent`/`isValidPointState`, used only by `isValidAppStorage.ts` within `storage/utils/`; `localDayIndex`, used only by `daysBetween.ts` within `logic/utils/`) is left out of that folder's `index.ts` entirely.

Two things do **not** change under this rule:

- **Same-folder sibling imports stay direct.** A file importing another file that sits right next to it in the same directory (e.g. `Dialog.tsx` importing `./Modal`, `Accordion.tsx` importing `./Chevron` — a subfolder of the same directory) never goes through that directory's own `index.ts`; it isn't "reaching into a folder from outside," and routing it through the barrel anyway would either be pointless (same folder) or, when the target is a subfolder whose contents are re-exported by an ancestor barrel that the importer itself is part of, genuinely circular.
- **A folder's barrel is never imported by code that folder's barrel (transitively) re-exports.** This is why `components/index.ts` (which transitively re-exports every component in the tree) is only ever imported from `screens/MainScreen/MainScreen.tsx` — the one consumer outside `components/` entirely — and never from, say, `BottomMenu.tsx` reaching for a sibling like `AutoLockDialog` (still `from "../AutoLockDialog"`, a direct file import, since `AutoLockDialog.tsx` has no folder/barrel of its own and both files live under the same `components/` barrel that would otherwise cycle). The same logic is why `i18n/LanguageContext.tsx` stays outside `i18n/index.ts`'s barrel (see the `i18n/` entry above) — a barrel can't re-export a file that itself depends on that barrel's own side effects.

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
- The codebase is function/hook-based, not class-based — `StorageService` (`src/storage/StorageService.ts`) and `PointService` (`src/logic/PointService.ts`) are the exceptions: each groups a cohesive set of operations (AsyncStorage load/save/export/import; injection-site color computation/press handling) under a single static-methods-only class (`StorageService.loadStorage()`, `PointService.onPress()`, neither ever instantiated) instead of standalone exported functions, so callers get one qualified name (`StorageService.xxx`/`PointService.xxx`) at every call site instead of a long individual-function import list. A method reachable only from other methods on the same class (never from outside the class file) is marked `private` (e.g. `PointService.blackoutDurationFor`, called only by `PointService.onPress`) — one static method calling another on the same class still qualifies it with the class name (`PointService.computePointColor(...)`, not a bare call), matching how outside callers reach it.
- No single-letter or otherwise abbreviated identifiers for variables, parameters, or callback arguments (e.g. `zone` not `z`, `value` not `v`, `event`/`error` not `e`, depending on context) — always use the full, descriptive word, even in short arrow-function callbacks like `.map()`/`.filter()`.
- Every component (including small presentational helpers like icons or a single form field extracted from a screen) lives in its own file named after the component. Do not define a second component — even an unexported local one only used within the file — alongside another component in the same file. Icon components go in `src/components/icons/`. Generic, domain-agnostic UI primitives with no knowledge of app types (`Modal`, `Dialog`, `ConfirmDialog`, `ContextMenu`, `BottomSheet`, `Toast`, `TimeField`, `NumberPickerField`) go in `src/components/common/`; components that reference app domain types (e.g. `PointColor`, `ZoneId`, `AutoLockDialogMode`) or compose the app's screens stay directly under `src/components/`.
- **Helper function / hook placement.** Every standalone helper function lives in its own file in a `utils/` folder; every React hook lives in its own file in a `hooks/` folder — never define one inline alongside unrelated code. One used from more than one otherwise-unrelated place goes in the nearest shared root: app-wide, that's `src/utils/`/`src/hooks/`; scoped to one existing module folder (`storage/`, `logic/`, `i18n/`, `theme/`), that's `<module>/utils/`/`<module>/hooks/` (e.g. `src/storage/utils/isValidAppStorage.ts`, private to `storage.ts`; `src/theme/hooks/useTheme.ts`, the hook half of `ThemeProvider`/`useTheme()`, split out from `ThemeContext.tsx` alongside the created `ThemeContext` object it reads). One used by only a single component (e.g. `isSelectionEmpty` for `ImportExportOptions`) lives inside that component's own folder instead. **A hook file or a util file is never itself turned into a folder** — if a hook/util needs its own private constants, types, or further helpers, those go at the same directory level as the `hooks/`/`utils/` folder that contains it, not nested one level deeper (e.g. `useAppStore.ts`'s private `uuid`/`lastPressedByGroup` helpers live directly in the root `src/utils/`, alongside `useAppStore.ts`'s own `src/hooks/`, rather than in a `src/hooks/useAppStore/utils/`).
- **A component without its own folder gets one (named after the component, e.g. `ImportExportOptions/`, `MenuSheet/`, `ZoneContainer/`) the moment it needs to place a private hook, util, constant, or type next to it.** Inside: `ComponentName.tsx` (the component itself — its `Props` interface and `StyleSheet` styles stay here, not extracted), a `hooks/`/`utils/` subfolder per kind of helper (each helper still its own flat file — the folder-per-component rule doesn't recurse into those), `constants.ts`, `types.ts`, and an `index.ts` that re-exports everything the rest of the app imports from it. A local constant or type that's private to that one file may stay declared inline instead of moving out, as long as there are 2 or fewer such declarations of that kind in the file; past that (more than 2 local constants, or more than 2 local types) — or the moment a single one of them is used outside that file — all of that kind move into `constants.ts`/`types.ts`. Helper functions have no such threshold: they always move to `utils/`, one per file, regardless of count or how private they are (see `isSelectionEmpty` in `src/components/ImportExportOptions/utils/isSelectionEmpty.ts`).
- Types that enumerate string constants must be TypeScript `enum`s, not string-literal unions (e.g. `PointColor` in `src/types/point.ts`, `ZoneGroup`/`ZoneId` in `src/types/zone.ts`, `AppEventType` in `src/types/event.ts`, `AutoLockDialogMode` in `src/types/autoLock.ts`, `ToastStatus` in `src/types/toast.ts`, `ThemeMode` in `src/types/theme.ts`). Reference values as `EnumName.Member`, never as raw string literals.
- Discriminated-union result types (e.g. `PressResult` in `src/logic/types.ts`, `ImportResult` in `src/storage/types.ts`) use `type` as the discriminant field name (not `kind`), backed by its own enum (e.g. `PressResultType`, `ImportResultType`).
- No inline object type literals (`{ field: Type; ... }`) in a signature, prop, field, or `Record<K, V>` value position, even when only used once — always extract them into a named `interface`/`type` (e.g. `ZoneColorPair` in `src/theme/types.ts`, `MarkToastMessage` in `src/screens/MainScreen/utils/buildMarkToastMessage.ts`). A type used across multiple files goes in `src/types/`, split by entity into its own file (e.g. `Zone` in `src/types/zone.ts`, `PointAddress` in `src/types/point.ts`, `ExportedAppData` in `src/types/storage.ts`) and re-exported via `src/types/index.ts`'s barrel (`export * from './<entity>'`) so the rest of the app keeps importing from `../types`; one used only within a single file/component is still named, but declared locally in that file near its usage. A type scoped to one existing module folder rather than the whole app (e.g. `ThemeColors`/`ZoneColorPair`, used only inside `theme/` plus by `useTheme()` consumers) goes in that module's own `types.ts` (`src/theme/types.ts`) instead of `src/types/`.
- No inline color literals (hex/`rgba`) in component styles. Chrome colors (surfaces, text, borders, icons, switches — anything that should flip between light/dark) are fields on `ThemeColors` (`src/theme/types.ts`), read via `const { colors } = useTheme()` (`src/theme/hooks/useTheme.ts`), never imported as flat constants. Colors that are deliberately theme-invariant (the `PointColor` cycle in `PointService.ts`, toast status colors) stay as plain constants in their own file/`src/constants.ts`, since they carry fixed semantic meaning independent of app chrome. A color literal used in 2+ places with the same semantic role is a shared constant (a `ThemeColors` field, or `src/constants.ts` if theme-invariant); one used in only one place is still a named constant, declared locally in the file/component where it applies (not inlined). Two literals that happen to share a value by coincidence, but mean different things (e.g. a UI accent color vs. an unrelated injection-cycle color in `PointService.ts`), are kept as separate constants — never merged just because the value matches. Exception: `ThemeColors.zoneColors` (`Record<ZoneType, ZoneColorPair>`, `src/theme/types.ts`) is a `ThemeColors` field but its two values (`DARK_COLORS`/`LIGHT_COLORS`) carry the *same* per-zone hue identity, not independent chrome — it's here only because the light theme needs a darker shade for legibility; see "Zones and points" below.
- The same rule applies to non-color literals: no unnamed "magic" numbers (durations, thresholds, sizes) or magic strings (storage keys, MIME types, format patterns) in component/logic code. A value reused in 2+ places for the same reason is a shared constant in `src/constants.ts` (or a shared helper in `src/utils/` for repeated formatting logic, e.g. `pad2.ts`, `splitSeconds.ts` — the latter also exporting `SECONDS_PER_MINUTE`); a single-use but deliberate value is still a named local constant in the file where it applies. One scoped to a single existing module folder rather than the whole app goes in that module's own `constants.ts` instead (e.g. `src/storage/constants.ts`'s AsyncStorage keys and `STORED_TRUE`/`STORED_FALSE`/`JSON_MIME_TYPE`/`EXPORT_FILE_PREFIX`/`IOS_JSON_UTI`, private to `storage.ts` and not re-exported by `storage/index.ts` since nothing outside `storage.ts` needs them). Ordinary one-off layout numbers (an arbitrary `padding`/`fontSize`/`borderRadius` with no cross-cutting meaning) don't need this — only values that encode an actual decision. Coincidental value matches with unrelated meaning are kept as separate constants, same as colors.
- **All user-facing text goes through i18next — never a hardcoded string literal.** Components call `useTranslation()`'s `t()` (or wrap rich inline-bold text in `<Trans i18nKey="..." components={{ bold: <Text style={boldStyle} /> }} />`, e.g. `HelpSheet.tsx`'s per-row explanations). Pure-logic files that don't render JSX (`PointService.ts`, `formatDateTime.ts`) stay free of an i18next dependency entirely: `PointService.colorLabel()` returns a `ColorLabelDescriptor` (`{ type: ColorLabelType; count?: number }`, the project's usual discriminated-union pattern) rather than a formatted string, and the one consumer (`HelpSheet.tsx`) formats it via `t()`; `formatDateTime.ts`'s `formatDateTime(timestamp, locale)` takes the active locale as an explicit parameter (`i18n.language` from the caller's `useTranslation()`) rather than reaching for a global. A `Record<SomeEnum, string>` of translation keys (e.g. `ZONE_LABEL_KEY` in `src/data/zones.ts`, `THEME_MODE_KEY`/`LANGUAGE_MODE_KEY` in `MenuSheet.tsx`) is typed `Record<SomeEnum, TranslationKey>` (`TranslationKey` from `src/i18n/index.ts`, a dot-path union of every key in `locales/en.ts`) rather than plain `string`, so a value pulled from the map and handed to `t()` stays checked against the real key set. New text requires a key added to both `src/i18n/locales/en.ts` and `ru.ts` in the same change — `en.ts` is the source of truth (it exports the `AppLocale` type) and `ru.ts` is typed as `AppLocale`, so a key missing from `ru.ts` is a compile error. Pluralized text always uses i18next's `count` option + key-suffix convention (`_one`/`_few`/`_many`/`_other` for Russian, `_one`/`_other` for English — see `common.daysCount` in `locales/en.ts`), never a hand-rolled plural helper.
- **Keep this file current**: whenever a change affects code style, project structure, or any other app-wide convention (not just a single file's internals), add or update the relevant note in this CLAUDE.md in the same change. Treat an out-of-date CLAUDE.md as a bug.
- **Keep README.md current too**: whenever a change affects the project description, features, setup/scripts, or structure, update README.md in the same change, not just CLAUDE.md.
- **Every new menu setting must round-trip through storage and export/import**, following the pattern set by `mirrored`/`autoLock*`/`daysToWhite`: its own AsyncStorage key + `load.../save...` static method pair on `StorageService` in `src/storage/storage.ts`, a field on `ExportedAppData` in `src/types/storage.ts`, a matching optional-type check in `isValidAppStorage`, inclusion in `useAppStore`'s `exportData`/`applyImport`, `BottomMenu`'s `buildImportData` filter, and a row label translation key documented in HelpSheet's "Пункты меню"/`help.sectionMenuItems` section. If the setting is a standalone toggle/value shown in `MenuSheet` (not bundled into an existing row like auto-lock's three fields), also add it to `ExportSettingKey`, `ImportExportOptions`'s `SETTING_LABEL_KEY` map, and `ImportOptionsDialog`'s `SETTING_AVAILABLE` map so it gets its own checkbox on both sides — see "Selective export / merge import" below. `themeMode`/`languageMode` follow the same storage/export/import contract but, uniquely, aren't held in `useAppStore`'s state — see "Theme" and "Localization" below for why.

---

## Data model

```ts
// StoredPointState — persisted per point
interface StoredPointState {
  pointId: string;
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
  pointId: string;
  zoneId: string;
  prevPointState: StoredPointState;  // snapshot for undo
}

// AppStorage — root object in AsyncStorage
interface AppStorage {
  pointStates: Record<string, StoredPointState>;
  events: AppEvent[];
}

// ExportedAppData — AppStorage fields plus settings that live in their own
// AsyncStorage keys, written out as one JSON file by export/import. Every
// field is optional: ExportOptionsDialog lets the user write only a subset
// of categories, and a missing field on import means "leave this category
// untouched", not "reset to default" — see "Selective export / merge
// import" below.
interface ExportedAppData {
  pointStates?: Record<string, StoredPointState>;
  events?: AppEvent[];
  mirrored?: boolean;
  autoLockEnabled?: boolean;
  autoLockAfterMarkSeconds?: number;
  autoLockAfterUnlockSeconds?: number;
  daysToWhite?: number;  // 1–8, default 8 — see "Point colour state machine" below
  themeMode?: ThemeMode; // Light/Dark/System, default System — see "Theme" below
  languageMode?: LanguageMode; // System/Russian/English, default System — see "Localization" below
  zonePointCounts?: ZonePointCounts; // per-ZoneType {rows, cols}, default = today's fixed counts — see "Zones and points" below
  enabledZones?: EnabledZones; // per-ZoneId on/off, default = every zone enabled — see "Zones and points" below
}
```

Storage keys: `@insulin_shot_tracker_v1` (pointStates/events), plus one key per setting (mirror, interface-locked, auto-lock, `daysToWhite`, `themeMode`, `languageMode`, `zonePointCounts`, `enabledZones`) — see `src/storage/constants.ts`, consumed by `StorageService` in `src/storage/StorageService.ts`.

---

## Selective export / merge import

The **"Экспорт..."** row (`MenuSheet`) opens `ExportOptionsDialog.tsx` instead of exporting immediately; the **"Импорт..."** row similarly opens `ImportOptionsDialog.tsx` over the parsed file instead of applying it outright. Both render the same `ImportExportOptions` (`src/components/ImportExportOptions/ImportExportOptions.tsx`): a top-level **"Отметки точек укола"** checkbox (`pointStates`/`events`) plus a **"Настройки приложения"** accordion of seven sub-checkboxes, one per `ExportSettingKey` (`Mirrored`/`AutoLock`/`DaysToWhite`/`Theme`/`Language`/`ZonePointCounts`/`EnabledZones`, `src/types/storage.ts`), built on the generic `Accordion` common component (`src/components/common/Accordion.tsx`), which knows nothing about checkboxes — `ImportExportOptions` passes a `Checkbox` (with its own `label` prop) directly as `Accordion`'s `label` node. In `Checkbox.tsx`, only the 22×22 box is a `TouchableOpacity`; the label text next to it is plain `Text`, not touchable. So tapping that checkbox's box bulk-toggles (and shows indeterminate for a partial selection of) the seven sub-checkboxes, labeled with the same row-label translation keys as `MenuSheet` (via `SETTING_LABEL_KEY`) — while tapping its label text (or the chevron) falls through to `Accordion`'s own header `TouchableOpacity` and toggles `expanded` instead, since React Native gives touch priority to the innermost responder and the text itself isn't one. Expanding/collapsing animates via `LayoutAnimation` (`Accordion`) and the chevron's rotation animates via `Animated.Value` (`Chevron`). The group starts collapsed, and the selection is untouched by expand/collapse.

`ImportExportOptions` is a controlled component: it takes the current `ExportSelection` (`{ marks: boolean; settings: Record<ExportSettingKey, boolean> }`) and an `onSelectionChange`, and two optional props — `marksDisabled` and `disabledSettingKeys` (an `ExportSettingKey[]`) — that grey out and disable individual rows; both default to "nothing disabled" (`[]`), which is exactly `ExportOptionsDialog`'s case, since every category is always available to export. It also exports `isSelectionEmpty(selection)`, used by both dialogs to disable their Confirm button while nothing is selected, and `SETTING_KEYS` (`Object.values(ExportSettingKey)`). `ExportOptionsDialog` owns the `ExportSelection` state (defaulting to everything checked) and passes it straight through; its resulting selection is passed to `useAppStore`'s `exportData(themeMode, languageMode, dialogTitle, selection)` (`dialogTitle` is the share-sheet title, pre-formatted by the caller via `t('menu.exportOptionsDialog.shareDialogTitle')` since neither `useAppStore` nor `storage.ts` depend on i18next), which builds the `ExportedAppData` object with only the selected keys set — unselected categories are omitted entirely, not written with a default/empty value (see `ExportedAppData`'s comment above).

Import mirrors this on the way back in: `isValidAppStorage` (used by `StorageService.pickImportFile`) only validates fields that are present, and `pickImportFile` returns the parsed data as-is (normalizing `pointStates` to include every current `POINTS` entry only when that category is present, rather than defaulting missing categories). `ImportOptionsDialog` derives `marksDisabled`/`disabledSettingKeys` from whether each field is actually present on the parsed `ExportedAppData` (its `SETTING_AVAILABLE` map, e.g. `data.daysToWhite !== undefined`) and passes them into `ImportExportOptions`, so a category absent from the file is forced unchecked and can't be selected; the "Настройки приложения" accordion checkbox is itself disabled by `ImportExportOptions` once every one of its five sub-rows is (i.e. the file carries no settings at all) — and `Accordion`'s own `disabled` prop then also blocks expanding/collapsing that group. Confirming calls `BottomMenu`'s local `buildImportData(data, selection)`, which narrows the parsed file down to just the checked categories (mirroring `exportData`'s filter on the way out), before handing that filtered object to `useAppStore`'s `applyImport`/`StorageService.importStorage`, which persist and merge only the fields present — an omitted category's current state and AsyncStorage value are left untouched rather than reset. This lets e.g. a settings-only export be imported without wiping injection history, or only auto-lock (not theme/language) be applied from a file that has both. `MainScreen`'s `onApplyImport` only calls `onSetThemeMode`/`onSetLanguageMode` when `data.themeMode`/`data.languageMode !== undefined`, for the same reason — which now also covers the user deliberately unchecking the theme/language row in `ImportOptionsDialog`.

---

## Theme

The app supports light, dark, and system-matched themes via the **"Тема"** row in the menu (`ThemeDialog.tsx`, opened from `MenuSheet`), backed by the `ThemeMode` enum (`Light`/`Dark`/`System`) in `src/types/theme.ts`. It's persisted with its own AsyncStorage key (`StorageService.loadThemeMode`/`.saveThemeMode` in `src/storage/storage.ts`) and round-trips through export/import as `ExportedAppData.themeMode`, defaulting to `ThemeMode.System`.

Unlike every other menu setting, `themeMode` is **not** held in `useAppStore`'s state — it's owned end to end by `ThemeProvider` (`src/theme/ThemeContext.tsx`), since `<ThemeProvider>` is mounted in `App.tsx`, above `MainScreen` (and therefore above the `useAppStore()` call that lives inside it). `src/theme/types.ts` defines the `ThemeColors` interface, and `src/theme/palette.ts` defines `DARK_COLORS`/`LIGHT_COLORS` — every chrome color (surfaces, text, borders, dividers, icons, switches, the bottom bar, dialogs/sheets/menus, the status bar). `ThemeProvider` loads the persisted `ThemeMode` on mount, resolves it against the live OS appearance (via React Native's `useColorScheme()`) into a `resolvedScheme` (`Light`/`Dark`) and the matching `ThemeColors`, and exposes `{ mode, resolvedScheme, colors, setMode }` through context — consumed anywhere in the tree, including `MainScreen` itself, with `const { colors } = useTheme();`. `MainScreen` reads `mode`/`setMode` (aliased to `themeMode`/`onSetThemeMode`) to pass down to `BottomMenu`, and threads `themeMode` into `useAppStore().exportData(themeMode, ...)` and calls `setMode(data.themeMode)` after `applyImport(data)`, since `useAppStore` itself no longer tracks or persists this setting.

Domain/status colors are deliberately **not** theme-dependent and stay as plain constants: the injection-cycle `PointColor` palette (`COLOR_HEX` in `src/logic/constants.ts`) and the toast status colors (`TOAST_*_COLOR`/`TOAST_*_BACKGROUND_COLOR`/`TOAST_TEXT_COLOR` in `constants.ts`) carry fixed semantic meaning (day count, message severity) and are self-contained saturated colors that read fine on either background. `body.png` is likewise reused unchanged in both themes (it's a solid-filled illustration, not linework that depends on the surface behind it). One exception to "domain colors are theme-invariant": the per-zone `accent`/`glow` pair (`ThemeColors.zoneColors`, keyed by `ZoneType`) — `ZoneContainer`'s zone block, `InjectionPoint`'s glow halo, and `HelpSheet`'s zone-legend badge/text all read too faint against the light theme's bright background at `DARK_COLORS.zoneColors`' values, so `LIGHT_COLORS.zoneColors` holds a darker shade of the same per-zone hue instead — see "Zones and points" below. The zone's hue identity is unchanged; only its rendering against theme-dependent chrome gets theme-selected.

---

## Localization

All user-facing text is Russian- and English-localized via **i18next**/**react-i18next** (`src/i18n/`) — see the "All user-facing text goes through i18next" coding-convention bullet above for the per-file authoring rules. This section covers the runtime architecture.

`src/i18n/locales/en.ts` is a single nested object (`common`/`zones`/`toast`/`menu`/`pointMenu`/`markDialog`/`mainScreen`/`help`/`stateMachine`, grouped to mirror the component structure) and is the source of truth for the translation key shape — it exports `AppLocale` (`typeof en`); `ru.ts` imports that type and declares `export const ru: AppLocale = {...}`, so TypeScript rejects `ru.ts` if a key is missing or misshapen. `src/i18n/index.ts` combines both into `resources`, derives and exports `TranslationKey` (a dot-path string-literal union of every leaf key in `en`, via a recursive mapped type — used to type `Record<SomeEnum, TranslationKey>` lookup maps like `ZONE_LABEL_KEY`), and calls `i18next.init()` once at module load with a best-guess initial language read synchronously from `expo-localization`'s `Localization.getLocales()` (avoids a flash of the wrong language before the persisted override loads). `src/i18n/i18next.d.ts` augments `i18next`'s `CustomTypeOptions` so every `t('...')` call app-wide — not just ones going through a lookup map — is checked against `en`'s key shape.

The **"Язык"** row in the menu (`LanguageDialog.tsx`, opened from `MenuSheet`) offers System/Russian/English, backed by the `LanguageMode` enum (`System`/`Russian` = `'ru'`/`English` = `'en'`, the two concrete values doubling as real i18next language codes) in `src/types/language.ts`. It follows the exact same architecture as `ThemeMode`/`ThemeProvider` above: **not** held in `useAppStore`'s state, instead owned end to end by `LanguageProvider` (`src/i18n/LanguageContext.tsx`, mounted in `App.tsx` alongside `ThemeProvider`), with its own AsyncStorage key (`StorageService.loadLanguageMode`/`.saveLanguageMode` in `src/storage/storage.ts`) and export/import round-trip as `ExportedAppData.languageMode`. `LanguageProvider` loads the persisted mode on mount, resolves `System` against the device locale (via `getDeviceLanguage()` in `src/i18n/utils/deviceLanguage.ts`, read once per mode change rather than subscribed to live OS locale changes — unlike light/dark, a mid-session locale change is practically never observed) into a `resolvedLanguage` (`Russian`/`English`), and calls `i18next.changeLanguage()` whenever it changes. `getDeviceLanguage()` only looks at `Localization.getLocales()[0]` (the device's top-priority preferred language), not the whole list — devices/simulators commonly report English as a secondary fallback entry even when the primary system language is Russian, so checking the full list with `.some(...)` would misresolve `System` to English on exactly those devices; `index.ts`'s initial best-guess (before the persisted mode loads) shares this same helper so the two can't drift out of sync — this is what actually drives every `useTranslation()` consumer's re-render, not the `LanguageMode` value itself. `MainScreen` reads `mode`/`setMode` (aliased `languageMode`/`onSetLanguageMode`) from `useLanguage()` the same way it reads `useTheme()`, threads `languageMode` into `exportData`, and calls `setMode(data.languageMode)` after `applyImport(data)`.

Two pure-logic files stay deliberately free of an i18next dependency despite producing locale-sensitive output, per the coding-convention bullet above: `PointService.colorLabel()` returns a `ColorLabelDescriptor` that `HelpSheet.tsx` formats via `t()`, and `formatDateTime.ts`'s `formatDateTime(timestamp, locale)` takes the locale explicitly (backed by `Intl.DateTimeFormat`, so `DD.MM.YYYY` for `ru` vs `MM/DD/YYYY` for `en` falls out automatically) instead of reaching for the i18next singleton itself.

`APP_NAME` (`src/constants.ts`) is the one piece of user-visible text deliberately **not** localized — it's a brand name, not prose.

---

## Point colour state machine

### Days-to-white setting

The number of days it takes an injection point to reach White (fully free) is configurable via the **"Дней до восстановления точки"** row in the menu (`DaysToWhiteDialog.tsx`), range 1–8, default 8 (`MIN_DAYS_TO_WHITE`/`MAX_DAYS_TO_WHITE`/`DEFAULT_DAYS_TO_WHITE` in `src/constants.ts`). It's persisted like `mirrored`/auto-lock (its own AsyncStorage key, round-trips through export/import as `ExportedAppData.daysToWhite`) and threaded into `PointService.computePointColor`/`PointService.onPress` as a third argument (defaults to 8 when omitted, e.g. in older call sites/tests).

At the default of 8, every color below is used, one per day. Lowering the setting compresses the cycle by dropping colors, in this fixed order (first dropped → last dropped): **dark yellow → dark orange → dark green → orange → red → green → yellow**. Maroon (day 0) is never dropped; White is always reached on day `daysToWhite`. See `PointService.activeCycleColors` in `src/logic/PointService.ts` / `COLOR_REMOVAL_ORDER` in `src/logic/constants.ts`. Examples:

- 7: orange on day 3, yellow on day 4, green on day 6, white on day 7 (dark yellow dropped)
- 6: red on day 1, orange on day 2, yellow on day 3, green on day 5, white on day 6 (dark yellow, dark orange dropped)
- 1: white on day 1 (only maroon remains)

Blackout durations (below) stay keyed by color identity regardless of the setting — a color's blackout duration doesn't change just because other colors were dropped from the cycle.

### Normal injection cycle (days since `lastInjectionAt`)

"Days" are local calendar days, not elapsed 24h periods: the color advances at local midnight (device timezone), so a press at 15:30 becomes day 1 as soon as the clock crosses into the next calendar day, not 24h later. Same rule applies to the post-blackout cycle. See `daysBetween`/`localDayIndex` in `src/logic/utils/`.

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

### Re-use (blackout) — point pressed while not white/dark-green/green

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

Every toast (`src/components/common/Toast.tsx`) carries a `ToastStatus` (`src/types/toast.ts`) that drives its background/border color and leading icon (`src/components/icons/Toast{Info,Warn,Success,Error}Icon.tsx`, colors in `src/constants.ts`):

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

## Zones and points

6 zones, 30 points by default. All point positions are fractions (0–1) of the body image container (393.46×621.91, matching `body.png`'s aspect ratio), extracted directly from the Figma "with buttons" frame (node `27:744`, file `grYg39698ogy0nEBd88Fup`). Each point renders as a 25 px knob (state colour fill) inside a 35 px radial-gradient glow halo tinted with its zone's `glow` colour (see `ThemeColors.zoneColors` in `src/theme/types.ts`).

### Configurable point grid

The number of rows and columns is configurable per zone **type** (`Shoulder`/`Belly`/`Thigh` — shared by both zones of a left/right pair, not per individual `ZoneId`) via the **"Точки в зонах"** row in the menu (`ZonePointsDialog`, opened from `MenuSheet`), minimum 1×1 for every type (`MIN_ZONE_ROWS`/`MIN_ZONE_COLS` in `src/constants.ts`) but a per-type maximum (`ZONE_MAX_GRID` in `src/data/zones.ts`: shoulders 3 rows × 2 cols, belly 4×4, thighs 4×3 — not every zone has the same amount of usable space), backed by `ZonePointCounts` (`Record<ZoneType, ZoneGridConfig>`, `src/types/zone.ts`) and defaulting to today's fixed counts (`DEFAULT_ZONE_POINT_COUNTS` in `src/data/zones.ts`: shoulders 3×1, belly 3×3, thighs 3×2). `ZonePointsDialog` builds each type's own row/column `NumberPickerField` options from its own `ZONE_MAX_GRID` entry (`buildRangeOptions` in its `utils/`). It's persisted like `daysToWhite` (its own AsyncStorage key, round-trips through export/import as `ExportedAppData.zonePointCounts`/`ExportSettingKey.ZonePointCounts`) — see "Selective export / merge import" above.

Because the grid size is now dynamic, `ZONE_LAYOUT`/`POINTS`/`POINT_MAP`/`POINTS_BY_ZONE`/`POINT_ADDRESS` are no longer static module-level consts: `data/zones.ts`'s `buildZoneData(zonePointCounts, enabledZones)` computes all of them fresh (bundled as `ZoneRuntimeData`, `src/types/zone.ts`) from the current settings (`enabledZones` — see "Enabling/disabling individual zones" below). `useAppStore` memoizes this as `zoneData` (`useMemo` keyed on `state.zonePointCounts`/`state.enabledZones`) and returns it alongside the rest of its state; `MainScreen` threads `zoneData.zoneLayout`/`zoneData.pointsByZone` into each `ZoneContainer` as props (no longer static imports there) and `zoneData.pointMap`/`zoneData.pointAddress` into `PointContextMenu`'s `address` prop and the `buildPointAddressSuffix`/`buildMarkToastMessage` helpers. Internally, `pressPoint`/`blockPoint`/`unblockPoint`/`markPointAt`/`clearPoint` read the live value through a `zoneDataRef` (same ref-through-render pattern as `onAutoLockFiredRef`) so those `useCallback`s can stay `[]`-stable.

**Layout formula** — each `ZoneLayout` is computed, not stored, from two fixed per-`ZoneId` anchors (`ZONE_ANCHOR`: `centerX`, `centerY`; `ZONE_CELL_SIZE`: `cellWidth`, `cellHeight`, both private to `data/zones.ts`, derived from the original Figma numbers so the default grid renders pixel-identical to before this setting existed): `width = cellWidth * cols`, `height = cellHeight * rows`, `x = centerX - width / 2`, `y = centerY - height / 2`. So resizing grows/shrinks the zone symmetrically around its own fixed center on *both* axes — points never drift toward one side or one neighbor as the grid changes. (An earlier version anchored the top edge instead of `centerY`, growing only downward — that let a zone's box overlap the one below it as rows grew, or open a gap as rows shrank, e.g. Shoulder into Belly; centering the vertical growth the same way as the horizontal keeps a resize's effect on a neighbor roughly half of what pure top-anchoring would cause.)

**Shoulder-zone overlap avoidance.** Widening either the shoulder or belly zone's own columns (both grow symmetrically around a fixed `centerX`, per the formula above) can push the shoulder zone's box far enough right, or the belly zone's box far enough left, that the two start overlapping on screen — the shoulder zone's `centerY` was only ever tuned against `DEFAULT_ZONE_POINT_COUNTS`, so it carries no built-in margin for that. `buildZoneLayout` (`data/zones.ts`) raises both shoulder zones (moves them further up, i.e. lowers their `y`) whenever `shouldRaiseShoulderZones` is true: shoulder `cols` + belly `cols` > 4 (equivalent to, and simplifying, "shoulder `cols > 1` **and** belly `cols > 2`, **or** belly `cols > 3` on its own" — widening the shoulder zone itself only reaches the belly zone once the belly zone is already at least its default width; widening the belly zone alone past its default reaches the shoulder zone regardless of the shoulder zone's own width). When raised, `raisedShoulderCenterY` replaces the shoulder zone's fixed `centerY` with one computed to keep its box's bottom edge `SHOULDER_BELLY_MIN_GAP` above the belly zone's *current* top edge (which itself moves as the belly zone's row count changes) — both belly zones share one `centerY`/`cellHeight`, so either can be read regardless of which shoulder zone is being laid out. At `DEFAULT_ZONE_POINT_COUNTS` the condition is false and the formula above is unchanged.

**Belly-zone overlap avoidance.** The same symmetric-around-`centerX` growth also eventually closes the gap between the belly-right and belly-left zones themselves as belly `cols` grows past its default (3) — their fixed anchors only carry `BELLY_ZONES_MIN_GAP` of margin at that default width. `buildZoneLayout` widens both belly zones' *horizontal* placement whenever `shouldWidenBellyGap` is true (belly `cols > 3`): `widenedBellyCenterX` replaces a belly zone's fixed `centerX` with one placing its inner (toward-midline) edge exactly `BELLY_ZONES_MIN_GAP / 2` from `BELLY_ZONES_MIDLINE_X`, keeping the two zones symmetric around it the same way their fixed anchors already are. `BELLY_ZONES_MIDLINE_X` is the midpoint of the two belly zones' own fixed `centerX` anchors (0.5075) — deliberately *not* the generic `BODY_MIDLINE_X` (0.5, used only to classify which side of the body a zone falls on) — since the belly zones' actual illustrated center (relative to the navel in `body.png`) sits off of `BODY_MIDLINE_X` by design in the original Figma rectangles; widening around `BODY_MIDLINE_X` instead visibly drifted the gap off-navel. `BELLY_ZONES_MIN_GAP` (0.025) isn't an arbitrary new value either — it's the exact gap the two belly zones already have today at `DEFAULT_ZONE_POINT_COUNTS`'s cols (3), so nothing changes below that width. This is independent of, and combinable with, the shoulder-zone raise above — a config can trigger either, both, or neither.

**Shoulder+belly row-height compensation.** A tall combined shoulder+belly row count grows both zones' boxes noticeably taller than at `DEFAULT_ZONE_POINT_COUNTS`, since each grows symmetrically around its own fixed `centerY`. `buildZoneLayout` nudges *both* the shoulder and belly zones' `centerY` down by `SHOULDER_BELLY_ROWS_LOWER_OFFSET` (0.03) whenever `shouldLowerShoulderAndBellyZones` is true (shoulder `rows` + belly `rows` > 6) **and** the shoulder zones are already being raised (`shouldRaiseShoulderZones` above) — the row-height nudge only applies on top of an existing column-driven raise, not on its own. Shoulder rows can only shrink from their default/max (3, per `ZONE_MAX_GRID`), so in practice this only fires at belly `rows` = 4 with shoulder `rows` still at 3 (3 + 4 = 7) — the one grid shape whose combined row count exceeds the default sum (3 + 3 = 6) — and only once the current `cols` also satisfy the raise condition above. This offset is independent of, and combinable with, the belly-zone widen rule below (which is driven by `cols` alone).

**Point identity — and address — survives a resize.** Point ids are keyed by their `(row, column)` slot within the zone's grid (e.g. `br-r2c3`), not a flat sequential index — a flat index's row/col meaning changes whenever `cols` changes, so it can't be stable across a resize. Critically, this `column` *is* the body-relative address column (1 = closest to the body's own midline, `isZoneLeftOfMidline` in `data/zones.ts`) baked in at generation time, not a raw left-to-right position re-flipped against the *current* `cols` on every read — so a given point's own `PointContextMenu` row/place never changes just because some *other* column was added or removed elsewhere in the same row. Resizing only ever adds/removes the outermost (farthest-from-center) column or bottommost row; every nearer-to-center point keeps its exact id and address. `buildZoneData` derives left-to-right rendering order from this same column per zone side (descending for a zone left of the midline, since its closest-to-center column renders rightmost; ascending otherwise) — see its `rowColumns` computation.

Shrinking a zone's grid just stops rendering/using the now-out-of-range slots; their `StoredPointState` is left untouched in AsyncStorage (same "orphaned keys are harmless" philosophy `normalizeStorage` already relied on), so growing the grid back reveals that history again instead of resetting it. `setZonePointCounts` (`useAppStore.ts`) and `applyImport`'s `zonePointCounts` branch both re-run `normalizeStorage` against the new active-points list to backfill default states for newly-in-range slots only, leaving every other point's state as-is. Installs saved before this setting existed have their point ids migrated once, on load, from the old flat-index scheme to the row/col-keyed one (`storage/utils/migrateLegacyPointIds.ts`, run at the top of `normalizeStorage`), reinterpreting each old index against `DEFAULT_ZONE_POINT_COUNTS` — the fixed shape every install had before — and reapplying the same center-relative flip so a migrated point's address matches what it always was.

### Enabling/disabling individual zones

Each of the 6 zones can be individually shown or hidden via the **"Активные зоны"** row in the menu (`ZonesDialog`, opened from `MenuSheet`), one collapsed-by-default `Accordion` per `ZoneType` (Плечи/Живот/Бёдра — the same three groups as `ZonePointsDialog`), each with a bulk header `Checkbox` (built the same way `ImportExportOptions`' "Настройки приложения" accordion is — a `Checkbox` passed directly as `Accordion`'s `label`, bulk-toggling both zones of that type and going indeterminate when only one is checked) plus two per-side `Checkbox` rows (e.g. Левое плечо/Правое плечо, `ZONE_TYPE_ZONE_IDS[type]` in `data/zones.ts`, right then left). It's backed by `EnabledZones` (`Record<ZoneId, boolean>`, `src/types/zone.ts`) and defaults to every zone enabled (`DEFAULT_ENABLED_ZONES` in `src/data/zones.ts`). At least one zone must always stay enabled: `ZonesDialog`'s `toggleZone`/`toggleType` reject (no-op) a toggle that would leave every zone off (`allDisabled` in its `utils/`), and `storage/utils/clampEnabledZones.ts` falls back to `DEFAULT_ENABLED_ZONES` entirely if a stored or imported value somehow has none set — a fully-disabled state would leave the body diagram with nowhere left to mark an injection. It's persisted like `zonePointCounts` (its own AsyncStorage key, round-trips through export/import as `ExportedAppData.enabledZones`/`ExportSettingKey.EnabledZones`) — see "Selective export / merge import" above.

Disabling a zone gets the same treatment `ZonePointsDialog` gives a shrunk grid: `buildZoneData(zonePointCounts, enabledZones)` excludes a disabled zone's points from `points`/`pointMap`/`pointAddress`/`pointsByZone` entirely (so it's left out of `normalizeStorage`'s active-points list and out of the group checkmark indicators, `lastPressedByGroup`), while its `StoredPointState` is left untouched in AsyncStorage — re-enabling the zone reveals that history again, the same "orphaned keys are harmless" philosophy the point-grid setting already relies on. `zoneLayout` is still computed for a disabled zone unconditionally (`buildZoneLayout` has no notion of `enabledZones`); it's `MainScreen` that actually hides it, by filtering `ZONES` down to `state.enabledZones[zone.id]` before mapping to `ZoneContainer`, rather than relying on an empty/missing layout entry. Because `zoneData` now depends on two settings at once, `setZonePointCounts`/`setEnabledZones`/`applyImport`'s combined branch each re-run `normalizeStorage` against the *current* value of whichever setting isn't the one being changed (read from `prev`/`data ?? prev`), so a file that imports only one of the two still backfills correctly against the other's live value instead of a stale one.

Left/right zones of the same body part share one accent/glow colour pair, so the pair itself is keyed by `ZoneType` (`Shoulder`/`Belly`/`Thigh`, `src/types/zone.ts`) rather than duplicated per `ZoneId` — `ZONE_TYPE` (`Record<ZoneId, ZoneType>`, `src/data/zones.ts`) maps each of the 6 zones to its shared type. The colour pair itself lives on `ThemeColors.zoneColors` (`Record<ZoneType, ZoneColorPair>`, `src/theme/types.ts`), since it now varies by theme: `DARK_COLORS.zoneColors` is unchanged from the original Figma design; `LIGHT_COLORS.zoneColors` steps one shade darker per type (`accent`/`glow` share one value there — shoulder/thigh reuse `DARK_COLORS`' own `glow`, belly's green is a further manual step darker) since the original pair reads too faint against the light theme's bright background. `ZoneContainer`'s block (fill + border, both a `${accent}${alpha}` string) and `InjectionPoint`'s glow halo look up `colors.zoneColors[ZONE_TYPE[zoneId]]` via `useTheme()` (both only have a `ZoneId` prop, hence the `ZONE_TYPE` lookup); `HelpSheet`'s zone-legend badge/label text stores a `ZoneType` directly on each `INJECTION_ZONE_INFO` row and reads `colors.zoneColors[zone.type]`, skipping that lookup since it never has a specific `ZoneId` to begin with (left/right share one row). Either way `colors` already resolves to `DARK_COLORS`/`LIGHT_COLORS`, so no separate theme branching is needed for the colour itself. `ZoneContainer` additionally branches on `resolvedScheme` for its own fill/border alpha (`LIGHT_FILL_ALPHA`/`LIGHT_BORDER_ALPHA` vs `DARK_FILL_ALPHA`/`DARK_BORDER_ALPHA`, both in `ZoneContainer.tsx`), since its translucent wash needs a higher alpha in light theme on top of the darker colour; `HelpSheet`'s badge/text render at full opacity already, so no separate alpha is needed there.

### Zone list

Labels below are the Russian copy for reference; the actual lookup is `ZONE_LABEL_KEY[zoneId]` (`src/data/zones.ts`) → `t()` (see "Localization" above) — `Zone` itself no longer carries a `label` field. "Points" is each zone type's *default* grid (`DEFAULT_ZONE_POINT_COUNTS`) — see "Configurable point grid" above for the 1–4 × 1–4 configurable range.

| Zone ID | Label | Group | Points (default) | Accent | Glow |
|---|---|---|---|---|---|
| `shoulder-right` | Правое плечо | shoulders-and-belly | 3 (vertical column) | `#F5D020` | `#C4A800` |
| `shoulder-left` | Левое плечо | shoulders-and-belly | 3 (vertical column) | `#F5D020` | `#C4A800` |
| `belly-right` | Живот справа | shoulders-and-belly | 9 (3×3 grid) | `#36D97A` | `#22A85E` |
| `belly-left` | Живот слева | shoulders-and-belly | 9 (3×3 grid) | `#36D97A` | `#22A85E` |
| `thigh-right` | Правое бедро | thighs | 6 (2×3 grid) | `#FF8C33` | `#CC6800` |
| `thigh-left` | Левое бедро | thighs | 6 (2×3 grid) | `#FF8C33` | `#CC6800` |

### Point address

Each point has a body-relative address — `row` (1-indexed, top to bottom within its zone) and `column` (1-indexed, counted outward from the body's own vertical midline, 1 = closest to center) — shown in `PointContextMenu` (long-press menu, via an `address` prop computed by `MainScreen`) and in the toast shown after marking a point (tap-to-press, or the context menu's "Отметить" dialog — see `buildMarkToastMessage` in `MainScreen.tsx`, which also includes the zone label). Computed by `buildZoneData` in `src/data/zones.ts` directly from each point's generation-time `(row, column)` (the column is flipped to count from center depending on whether the zone's canonical, unmirrored position falls left or right of the body midline `x = 0.5`) — see "Configurable point grid" above. The address is fixed to the point's own anatomy and does **not** change when mirror mode is toggled — mirroring only changes which screen half a zone renders on, never the point's row/center-relative position.

The mark-confirmation toast (`buildMarkToastMessage`) adds two conditional lines on top of the address: it re-runs the pure `PointService.onPress` against the pre-mark point state to detect a `PressResultType.Blackout` outcome (site reused too early) and calls that out along with the triggered `blackoutDurationDays` (via `t('toast.markBlackoutSuffix', { count: days })`, i18next-pluralized — see "Localization" above), and it compares the marked timestamp against `Date.now()` — if it's more than `MARK_BACKDATED_THRESHOLD_MS` (`src/constants.ts`) in the past, the toast also shows the marked date/time via `formatDateTime` (`src/utils/formatDateTime.ts`, shared with `PointContextMenu`'s info lines). A plain tap is never backdated (its timestamp is always "now"); only the context menu's "Отметить" dialog (custom date/time picker) can trigger the backdated line.

### Group indicators

- **thighs** group: checkmark (✓) shown on the most recently used point across both thigh zones.
- **shoulders-and-belly** group: checkmark shown on the most recently used point across shoulders + belly zones.

Derived by scanning `events[]` from newest to oldest, skipping `manual-block` / `manual-unblock` events.

---

## Known limitations / TODO

- [ ] No safe-area handling for devices with home indicator (bottom padding is hardcoded to 28 px)
- [ ] Haptics do not fire on Android Expo Go (native module not available in managed workflow without dev build)
- [ ] Only Russian and English are localized; other languages fall back to Russian
- [ ] `npm audit` reports 10 moderate vulnerabilities in dev dependencies — not production-critical
