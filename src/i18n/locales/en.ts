// Source of truth for every translation key's shape — see the exported
// `AppLocale` type below. ru.ts imports that type and is checked against it
// (`ru: AppLocale`), so a key missing from ru.ts is a compile error. ru
// needs 4 plural forms (_one/_few/_many/_other) while English only has 2
// real categories (_one/_other) — _few/_many are still defined here (equal
// to _other) purely to satisfy the shape shared with ru; English's plural
// rules never select them at runtime.
export const en = {
  common: {
    cancel: "Cancel",
    save: "Save",
    clear: "Clear",
    mark: "Mark",
    confirm: "Confirm",
    daysCount_one: "{{count}} day",
    daysCount_few: "{{count}} days",
    daysCount_many: "{{count}} days",
    daysCount_other: "{{count}} days",
    minutesAbbrev: "{{count}} min",
    secondsAbbrev: "{{count}} sec",
    daysAbbrev: "{{count}} d",
    hoursAbbrev: "{{count}} h",
  },
  zones: {
    shoulderRight: "Right shoulder",
    shoulderLeft: "Left shoulder",
    bellyRight: "Belly (right)",
    bellyLeft: "Belly (left)",
    thighRight: "Right thigh",
    thighLeft: "Left thigh",
    groupShoulder: "Shoulders",
    groupBelly: "Belly",
    groupThigh: "Thighs",
  },
  toast: {
    blocked: "This point is blocked and can't be marked",
    interfaceLocked:
      "The interface is locked. To mark an injection point, unlock the interface from the bottom menu, or use the point's popup menu (long press).",
    interfaceLockEnabled: "Interface locked",
    interfaceLockDisabled: "Interface unlocked",
    autoLockFired: "Interface locked automatically",
    clearSuccess: "Data cleared",
    undo: "Last action undone",
    exportSuccess: "Data exported",
    importSuccess: "Data imported",
    importFailure:
      "Import failed\nThe selected file is corrupted or has an invalid format.",
    mirrorEnabled: "Mirroring enabled",
    mirrorDisabled: "Mirroring disabled",
    autoLockEnabled: "Auto-lock enabled",
    autoLockDisabled: "Auto-lock disabled",
    autoLockUpdated: "Auto-lock settings updated",
    labeledValue: "{{label}}: {{value}}",
    manualBlockPrefix: "Point manually blocked",
    manualUnblockPrefix: "Point manually unblocked",
    pointClearedPrefix: "Point cleared",
    themeUpdatedPrefix: "Theme changed",
    languageUpdatedPrefix: "Language changed",
    zonePointCountsUpdated: "Zone point layout updated",
    enabledZonesUpdated: "Active zones updated",
    pointMarked: "Point marked: {{address}}",
    markBlackoutSuffix_one: "\nPoint blocked by the system for {{count}} day",
    markBlackoutSuffix_few: "\nPoint blocked by the system for {{count}} days",
    markBlackoutSuffix_many: "\nPoint blocked by the system for {{count}} days",
    markBlackoutSuffix_other:
      "\nPoint blocked by the system for {{count}} days",
    markBackdatedSuffix: "\nMarked at: {{dateTime}}",
    pointAddressSuffix:
      "{{zoneLabel}}, row {{row}}, spot {{column}} from body center",
  },
  menu: {
    title: "Menu",
    mirrorRow: "Mirror display",
    autoLockRow: "Auto-lock interface",
    daysToWhiteRow: "Days until point recovers",
    zonePointsRow: "Zone point layout",
    zonesRow: "Active zones",
    themeRow: "Theme",
    languageRow: "Language",
    exportRow: "Export data",
    importRow: "Import data",
    autoLockEnableConfirm: "Enable",
    autoLockDialog: {
      message:
        "You can enable automatic interface locking to avoid accidentally tapping an injection point. Locking triggers after a set time following a point tap, or after idle time while unlocked. You can unlock the interface again from the corresponding button in the bottom menu.",
      afterMark: "After mark",
      afterUnlock: "After unlock",
    },
    daysToWhiteDialog: {
      message:
        "How many days until an injection point is considered fully free (white) again. A lower value compresses the cycle's colors into that timeframe.",
      fieldLabel: "Days",
    },
    zonePointsDialog: {
      message:
        "Choose how many rows and columns each zone group has. The zone stays centered around its own middle on both axes as it resizes.",
      rowsLabel: "Rows",
      colsLabel: "Columns",
    },
    zonesDialog: {
      message:
        "Choose which injection zones to use. A disabled zone is hidden from the body entirely; its history is kept and reappears if you re-enable it. At least one zone must stay enabled.",
    },
    themeDialog: {
      message: "The system theme follows your device's appearance setting.",
      light: "Light",
      dark: "Dark",
      system: "System",
    },
    languageDialog: {
      message: "The system language follows your device's language setting.",
      system: "System",
      russian: "Русский",
      english: "English",
      german: "Deutsch",
      spanish: "Español",
      french: "Français",
      turkish: "Türkçe",
      portuguese: "Português (Brasil)",
    },
    exportOptionsDialog: {
      title: "Export data",
      message: "Choose what to export to the file.",
      marksLabel: "Injection point marks",
      activePointsLabel: "Active points",
      blockedPointsLabel: "Manually blocked points",
      settingsLabel: "App settings",
      confirmLabel: "Export",
      shareDialogTitle: "Export {{appName}} data",
    },
    importOptionsDialog: {
      title: "Import data",
      message:
        "Choose what to import from the file. Categories not present in the file are unavailable. Selected categories will replace the current data — this action can't be undone.",
      confirmLabel: "Import",
    },
    undoConfirm: {
      title: "Undo last injection?",
      message:
        "The last recorded injection will be removed. This action can't be undone again.",
      confirmLabel: "Undo injection",
    },
    clearOptionsDialog: {
      title: "Clear data",
      message:
        "Choose what to clear. Selected injection point marks and/or app settings will be permanently reset to their defaults — this action can't be undone.",
      confirmLabel: "Clear",
    },
  },
  pointMenu: {
    unblock: "Unblock",
    block: "Block",
    titlePrefix: "Point · {{zoneLabel}}",
    titleFallback: "Point actions",
    addressSubtitle: "ROW {{row}}, SPOT {{column}} (from body center)",
    lastMark: "Last marked: {{dateTime}}",
    manuallyBlockedAt: "Manually blocked: {{dateTime}}",
    systemBlockedCountdown: "Blocked by the system.\nUnlocks in: {{countdown}}",
  },
  markDialog: {
    title: "Mark injection",
    message: "Specify the date and time the injection was given.",
  },
  mainScreen: {
    leftSideLabel: "left\nside",
    rightSideLabel: "right\nside",
    clearPointConfirm: {
      title: "Clear this point?",
      message:
        "This point's data will be removed and it will turn white (free). This action can't be undone again.",
    },
  },
  help: {
    title: "Help",
    sectionZones: "Injection zones",
    sectionColorScheme: "Color scheme",
    sectionRecommendations: "Recommendations",
    sectionControls: "Controls",
    sectionBottomBar: "Bottom bar",
    sectionMenuItems: "Menu items",
    zones: {
      shoulder: {
        label: "Shoulders",
        location: "middle third, back and side",
        description:
          "Moderate absorption. Onset in 10 minutes. Peak effect in 60–90 minutes.",
      },
      belly: {
        label: "Belly",
        location: "4 cm from ribs and navel",
        description:
          "Fast absorption. Onset in 5 minutes. Peak effect in 30–60 minutes.",
      },
      thigh: {
        label: "Thighs",
        location: "outer lateral surface",
        description:
          "Slow absorption. For long-acting insulin. Peak effect in 90–120 minutes.",
      },
    },
    recommendations: {
      varySpot:
        "Even when following the site rotation, don't inject into the exact same spot every time — vary the precise injection point slightly within the same site as well.",
    },
    controls: {
      press: "<bold>Tap</bold> — record an injection.",
      longPress:
        "<bold>Long press</bold> (~1 s) — open the menu for an injection point.",
      checkmark:
        "<bold>✓ Checkmark</bold> — most recently used point in the group.",
    },
    bottomBar: {
      undo: "<bold>Undo</bold> — undo the last action (an injection, a block, or an unblock).",
      menu: "<bold>{{label}}</bold> — open the settings and data menu.",
      help: "<bold>{{label}}</bold> — open this screen.",
      lock: "<bold>Lock</bold> — lock or unlock the interface to avoid accidental taps.",
    },
    menuItems: {
      mirror: "<bold>{{label}}</bold> — flip the body silhouette horizontally.",
      autoLock:
        "<bold>{{label}}</bold> — automatically enable locking after a set time following an injection mark, and after a manual unlock. Tapping the row opens the delay settings.",
      daysToWhite:
        "<bold>{{label}}</bold> — how many days until an injection point is considered fully free (white) again. Lowering the value compresses the color scheme into that timeframe.",
      zonePoints:
        "<bold>{{label}}</bold> — choose how many rows and columns each zone group (shoulders, belly, thighs) has. Shrinking a zone's grid hides its out-of-range points without losing their history; growing it back reveals that history again.",
      zones:
        "<bold>{{label}}</bold> — choose which individual zones (e.g. left/right shoulder) are shown on the body. Disabling a zone hides it without losing its history; re-enabling it reveals that history again.",
      theme:
        "<bold>{{label}}</bold> — choose the app's light, dark, or system appearance theme.",
      language: "<bold>{{label}}</bold> — choose the app's interface language.",
      export:
        "<bold>{{label}}</bold> — choose what to save to a file: injection point marks and/or app settings (individually).",
      import:
        "<bold>{{label}}</bold> — choose what to apply from a file: injection point marks and/or app settings (individually). Categories not present in the file are unavailable to select; other current data is left untouched.",
      clear:
        "<bold>{{label}}</bold> — choose what to reset: injection point marks and/or app settings (individually), permanently and with no way to recover them.",
    },
  },
  stateMachine: {
    colorLabel: {
      white_one: "Free (unused for {{count}}+ day)",
      white_few: "Free (unused for {{count}}+ days)",
      white_many: "Free (unused for {{count}}+ days)",
      white_other: "Free (unused for {{count}}+ days)",
      maroon: "Just now (day 0)",
      black: "Blocked by the system due to frequent use",
      gray: "Manually blocked (injury/bruise)",
    },
  },
};

export type AppLocale = typeof en;
