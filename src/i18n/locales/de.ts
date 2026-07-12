import type { AppLocale } from "./en";

// en.ts is the source of truth for every translation key's shape (its
// `AppLocale` type, imported above); typing de against it means a key
// missing from de.ts is a compile error (see CLAUDE.md's "Localization"
// section). German only has 2 real plural categories (_one/_other) —
// _few/_many are still defined here (equal to _other) purely to satisfy the
// shape shared with ru; German's plural rules never select them at runtime.
export const de: AppLocale = {
  common: {
    cancel: "Abbrechen",
    save: "Speichern",
    clear: "Löschen",
    mark: "Markieren",
    confirm: "Bestätigen",
    daysCount_one: "{{count}} Tag",
    daysCount_few: "{{count}} Tage",
    daysCount_many: "{{count}} Tage",
    daysCount_other: "{{count}} Tage",
    minutesAbbrev: "{{count}} Min",
    secondsAbbrev: "{{count}} Sek",
    daysAbbrev: "{{count}} T",
    hoursAbbrev: "{{count}} Std",
  },
  zones: {
    shoulderRight: "Rechte Schulter",
    shoulderLeft: "Linke Schulter",
    bellyRight: "Bauch (rechts)",
    bellyLeft: "Bauch (links)",
    thighRight: "Rechter Oberschenkel",
    thighLeft: "Linker Oberschenkel",
    groupShoulder: "Schultern",
    groupBelly: "Bauch",
    groupThigh: "Oberschenkel",
  },
  toast: {
    blocked: "Dieser Punkt ist gesperrt und kann nicht markiert werden",
    interfaceLocked:
      "Die Oberfläche ist gesperrt. Um eine Injektionsstelle zu markieren, entsperre die Oberfläche über das untere Menü oder nutze das Kontextmenü des Punkts (langes Drücken).",
    interfaceLockEnabled: "Oberfläche gesperrt",
    interfaceLockDisabled: "Oberfläche entsperrt",
    autoLockFired: "Oberfläche automatisch gesperrt",
    clearSuccess: "Daten gelöscht",
    undo: "Letzte Aktion rückgängig gemacht",
    exportSuccess: "Daten exportiert",
    importSuccess: "Daten importiert",
    importFailure:
      "Import fehlgeschlagen\nDie ausgewählte Datei ist beschädigt oder hat ein ungültiges Format.",
    mirrorEnabled: "Spiegelung aktiviert",
    mirrorDisabled: "Spiegelung deaktiviert",
    autoLockEnabled: "Automatische Sperre aktiviert",
    autoLockDisabled: "Automatische Sperre deaktiviert",
    autoLockUpdated: "Einstellungen der automatischen Sperre aktualisiert",
    labeledValue: "{{label}}: {{value}}",
    manualBlockPrefix: "Punkt manuell gesperrt",
    manualUnblockPrefix: "Punkt manuell entsperrt",
    pointClearedPrefix: "Punkt gelöscht",
    themeUpdatedPrefix: "Design geändert",
    languageUpdatedPrefix: "Sprache geändert",
    zonePointCountsUpdated: "Punktraster der Zonen aktualisiert",
    enabledZonesUpdated: "Aktive Zonen aktualisiert",
    pointMarked: "Punkt markiert: {{address}}",
    markBlackoutSuffix_one: "\nPunkt vom System für {{count}} Tag gesperrt",
    markBlackoutSuffix_few: "\nPunkt vom System für {{count}} Tage gesperrt",
    markBlackoutSuffix_many: "\nPunkt vom System für {{count}} Tage gesperrt",
    markBlackoutSuffix_other: "\nPunkt vom System für {{count}} Tage gesperrt",
    markBackdatedSuffix: "\nMarkiert um: {{dateTime}}",
    pointAddressSuffix:
      "{{zoneLabel}}, Reihe {{row}}, Position {{column}} von der Körpermitte",
  },
  menu: {
    title: "Menü",
    mirrorRow: "Anzeige spiegeln",
    autoLockRow: "Oberfläche automatisch sperren",
    daysToWhiteRow: "Tage bis zur Erholung des Punkts",
    zonePointsRow: "Punktraster der Zonen",
    zonesRow: "Aktive Zonen",
    themeRow: "Design",
    languageRow: "Sprache",
    exportRow: "Daten exportieren",
    importRow: "Daten importieren",
    autoLockEnableConfirm: "Aktivieren",
    autoLockDialog: {
      message:
        "Du kannst die automatische Sperre der Oberfläche aktivieren, um versehentliches Antippen einer Injektionsstelle zu vermeiden. Die Sperre greift nach einer festgelegten Zeit nach dem Antippen eines Punkts oder nach einer Inaktivitätszeit im entsperrten Zustand. Du kannst die Oberfläche über die entsprechende Schaltfläche im unteren Menü wieder entsperren.",
      afterMark: "Nach dem Markieren",
      afterUnlock: "Nach dem Entsperren",
    },
    daysToWhiteDialog: {
      message:
        "Wie viele Tage vergehen, bis eine Injektionsstelle wieder als vollständig frei (weiß) gilt. Ein niedrigerer Wert komprimiert die Farben des Zyklus auf diesen Zeitraum.",
      fieldLabel: "Tage",
    },
    zonePointsDialog: {
      message:
        "Wähle, wie viele Reihen und Spalten jede Zonengruppe hat. Die Zone bleibt bei der Größenänderung auf beiden Achsen um ihre eigene Mitte zentriert.",
      rowsLabel: "Reihen",
      colsLabel: "Spalten",
    },
    zonesDialog: {
      message:
        "Wähle, welche Injektionszonen verwendet werden sollen. Eine deaktivierte Zone wird vollständig vom Körper ausgeblendet; ihr Verlauf bleibt erhalten und erscheint bei erneuter Aktivierung wieder. Mindestens eine Zone muss aktiviert bleiben.",
    },
    themeDialog: {
      message: "Das Systemdesign folgt der Erscheinungsbild-Einstellung deines Geräts.",
      light: "Hell",
      dark: "Dunkel",
      system: "System",
    },
    languageDialog: {
      message: "Die Systemsprache folgt der Spracheinstellung deines Geräts.",
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
      title: "Daten exportieren",
      message: "Wähle, was in die Datei exportiert werden soll.",
      marksLabel: "Injektionspunkt-Markierungen",
      activePointsLabel: "Aktive Punkte",
      blockedPointsLabel: "Manuell gesperrte Punkte",
      settingsLabel: "App-Einstellungen",
      confirmLabel: "Exportieren",
      shareDialogTitle: "{{appName}}-Daten exportieren",
    },
    importOptionsDialog: {
      title: "Daten importieren",
      message:
        "Wähle, was aus der Datei importiert werden soll. Kategorien, die nicht in der Datei enthalten sind, stehen nicht zur Verfügung. Ausgewählte Kategorien ersetzen die aktuellen Daten — diese Aktion kann nicht rückgängig gemacht werden.",
      confirmLabel: "Importieren",
    },
    undoConfirm: {
      title: "Letzte Injektion rückgängig machen?",
      message:
        "Die zuletzt erfasste Injektion wird entfernt. Diese Aktion kann nicht erneut rückgängig gemacht werden.",
      confirmLabel: "Injektion rückgängig machen",
    },
    clearOptionsDialog: {
      title: "Daten löschen",
      message:
        "Wähle, was gelöscht werden soll. Ausgewählte Injektionspunkt-Markierungen und/oder App-Einstellungen werden dauerhaft auf ihre Standardwerte zurückgesetzt — diese Aktion kann nicht rückgängig gemacht werden.",
      confirmLabel: "Löschen",
    },
  },
  pointMenu: {
    unblock: "Entsperren",
    block: "Sperren",
    titlePrefix: "Punkt · {{zoneLabel}}",
    titleFallback: "Punktaktionen",
    addressSubtitle: "REIHE {{row}}, POSITION {{column}} (von der Körpermitte)",
    lastMark: "Letzte Markierung: {{dateTime}}",
    manuallyBlockedAt: "Manuell gesperrt: {{dateTime}}",
    systemBlockedCountdown: "Vom System gesperrt.\nEntsperrung in: {{countdown}}",
  },
  markDialog: {
    title: "Injektion markieren",
    message: "Gib das Datum und die Uhrzeit der Injektion an.",
  },
  mainScreen: {
    leftSideLabel: "linke\nSeite",
    rightSideLabel: "rechte\nSeite",
    clearPointConfirm: {
      title: "Diesen Punkt löschen?",
      message:
        "Die Daten dieses Punkts werden entfernt und er wird weiß (frei). Diese Aktion kann nicht erneut rückgängig gemacht werden.",
    },
  },
  help: {
    title: "Hilfe",
    sectionZones: "Injektionszonen",
    sectionColorScheme: "Farbschema",
    sectionRecommendations: "Empfehlungen",
    sectionControls: "Bedienung",
    sectionBottomBar: "Untere Leiste",
    sectionMenuItems: "Menüpunkte",
    zones: {
      shoulder: {
        label: "Schultern",
        location: "mittleres Drittel, hinten und seitlich",
        description:
          "Mäßige Aufnahme. Wirkungseintritt nach 10 Minuten. Wirkungsspitze nach 60–90 Minuten.",
      },
      belly: {
        label: "Bauch",
        location: "4 cm Abstand von Rippen und Bauchnabel",
        description:
          "Schnelle Aufnahme. Wirkungseintritt nach 5 Minuten. Wirkungsspitze nach 30–60 Minuten.",
      },
      thigh: {
        label: "Oberschenkel",
        location: "äußere seitliche Fläche",
        description:
          "Langsame Aufnahme. Für lang wirkendes Insulin. Wirkungsspitze nach 90–120 Minuten.",
      },
    },
    recommendations: {
      varySpot:
        "Auch wenn du die Rotation der Injektionsstellen einhältst, spritze nicht jedes Mal genau in denselben Punkt — variiere die genaue Injektionsstelle auch innerhalb derselben Zone leicht.",
    },
    controls: {
      press: "<bold>Antippen</bold> — eine Injektion erfassen.",
      longPress:
        "<bold>Langes Drücken</bold> (~1 s) — das Menü für eine Injektionsstelle öffnen.",
      checkmark:
        "<bold>✓ Häkchen</bold> — zuletzt verwendeter Punkt in der Gruppe.",
    },
    bottomBar: {
      undo: "<bold>Rückgängig</bold> — die letzte Aktion rückgängig machen (eine Injektion, eine Sperrung oder eine Entsperrung).",
      menu: "<bold>{{label}}</bold> — das Einstellungs- und Datenmenü öffnen.",
      help: "<bold>{{label}}</bold> — diesen Bildschirm öffnen.",
      lock: "<bold>Sperre</bold> — die Oberfläche sperren oder entsperren, um versehentliches Antippen zu vermeiden.",
    },
    menuItems: {
      mirror: "<bold>{{label}}</bold> — die Körpersilhouette horizontal spiegeln.",
      autoLock:
        "<bold>{{label}}</bold> — die Sperre automatisch nach einer festgelegten Zeit nach dem Markieren einer Injektion und nach manueller Entsperrung aktivieren. Antippen der Zeile öffnet die Verzögerungseinstellungen.",
      daysToWhite:
        "<bold>{{label}}</bold> — wie viele Tage vergehen, bis eine Injektionsstelle wieder als vollständig frei (weiß) gilt. Ein niedrigerer Wert komprimiert das Farbschema auf diesen Zeitraum.",
      zonePoints:
        "<bold>{{label}}</bold> — wähle, wie viele Reihen und Spalten jede Zonengruppe (Schultern, Bauch, Oberschenkel) hat. Eine Verkleinerung des Rasters einer Zone blendet ihre außerhalb liegenden Punkte aus, ohne deren Verlauf zu verlieren; bei Vergrößerung erscheint dieser Verlauf wieder.",
      zones:
        "<bold>{{label}}</bold> — wähle, welche einzelnen Zonen (z. B. linke/rechte Schulter) am Körper angezeigt werden. Das Deaktivieren einer Zone blendet sie aus, ohne ihren Verlauf zu verlieren; bei erneuter Aktivierung erscheint dieser Verlauf wieder.",
      theme:
        "<bold>{{label}}</bold> — wähle das helle, dunkle oder systemweite Erscheinungsbild der App.",
      language: "<bold>{{label}}</bold> — wähle die Sprache der App-Oberfläche.",
      export:
        "<bold>{{label}}</bold> — wähle, was in eine Datei gespeichert werden soll: Injektionspunkt-Markierungen und/oder App-Einstellungen (einzeln).",
      import:
        "<bold>{{label}}</bold> — wähle, was aus einer Datei übernommen werden soll: Injektionspunkt-Markierungen und/oder App-Einstellungen (einzeln). Kategorien, die nicht in der Datei enthalten sind, können nicht ausgewählt werden; die übrigen aktuellen Daten bleiben unverändert.",
      clear:
        "<bold>{{label}}</bold> — wähle, was zurückgesetzt werden soll: Injektionspunkt-Markierungen und/oder App-Einstellungen (einzeln), dauerhaft und ohne Wiederherstellungsmöglichkeit.",
    },
  },
  stateMachine: {
    colorLabel: {
      white_one: "Frei (seit {{count}}+ Tag ungenutzt)",
      white_few: "Frei (seit {{count}}+ Tagen ungenutzt)",
      white_many: "Frei (seit {{count}}+ Tagen ungenutzt)",
      white_other: "Frei (seit {{count}}+ Tagen ungenutzt)",
      maroon: "Gerade eben (Tag 0)",
      black: "Vom System wegen häufiger Nutzung gesperrt",
      gray: "Manuell gesperrt (Verletzung/Bluterguss)",
    },
  },
};
