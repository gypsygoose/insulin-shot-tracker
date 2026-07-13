import type { AppLocale } from "./en";

// en.ts is the source of truth for every translation key's shape (its
// `AppLocale` type, imported above); typing fr against it means a key
// missing from fr.ts is a compile error (see CLAUDE.md's "Localization"
// section). French only has 2 real plural categories (_one/_other) —
// _few/_many are still defined here (equal to _other) purely to satisfy the
// shape shared with ru; French's plural rules never select them at runtime.
export const fr: AppLocale = {
  common: {
    cancel: "Annuler",
    save: "Enregistrer",
    clear: "Effacer",
    mark: "Marquer",
    confirm: "Confirmer",
    daysCount_one: "{{count}} jour",
    daysCount_few: "{{count}} jours",
    daysCount_many: "{{count}} jours",
    daysCount_other: "{{count}} jours",
    minutesAbbrev: "{{count}} min",
    secondsAbbrev: "{{count}} s",
    daysAbbrev: "{{count}} j",
    hoursAbbrev: "{{count}} h",
  },
  zones: {
    shoulderRight: "Épaule droite",
    shoulderLeft: "Épaule gauche",
    bellyRight: "Ventre (droite)",
    bellyLeft: "Ventre (gauche)",
    thighRight: "Cuisse droite",
    thighLeft: "Cuisse gauche",
    groupShoulder: "Épaules",
    groupBelly: "Ventre",
    groupThigh: "Cuisses",
  },
  toast: {
    blocked: "Ce point est bloqué et ne peut pas être marqué",
    pointUnavailable_one:
      "Ce point n'est pas encore disponible pour être marqué. Disponible dans {{count}} jour",
    pointUnavailable_few:
      "Ce point n'est pas encore disponible pour être marqué. Disponible dans {{count}} jours",
    pointUnavailable_many:
      "Ce point n'est pas encore disponible pour être marqué. Disponible dans {{count}} jours",
    pointUnavailable_other:
      "Ce point n'est pas encore disponible pour être marqué. Disponible dans {{count}} jours",
    interfaceLocked:
      "L'interface est verrouillée. Pour marquer un point d'injection, déverrouillez l'interface depuis le menu du bas, ou utilisez le menu contextuel du point (appui long).",
    interfaceLockEnabled: "Interface verrouillée",
    interfaceLockDisabled: "Interface déverrouillée",
    autoLockFired: "Interface verrouillée automatiquement",
    clearSuccess: "Données effacées",
    undo: "Dernière action annulée",
    exportSuccess: "Données exportées",
    importSuccess: "Données importées",
    importFailure:
      "Échec de l'importation\nLe fichier sélectionné est corrompu ou dans un format non valide.",
    mirrorEnabled: "Miroir activé",
    mirrorDisabled: "Miroir désactivé",
    autoLockEnabled: "Verrouillage automatique activé",
    autoLockDisabled: "Verrouillage automatique désactivé",
    autoLockUpdated: "Paramètres de verrouillage automatique mis à jour",
    labeledValue: "{{label}} : {{value}}",
    manualBlockPrefix: "Point bloqué manuellement",
    manualUnblockPrefix: "Point débloqué manuellement",
    pointClearedPrefix: "Point effacé",
    themeUpdatedPrefix: "Thème modifié",
    languageUpdatedPrefix: "Langue modifiée",
    zonePointCountsUpdated: "Disposition des points de zone mise à jour",
    enabledZonesUpdated: "Zones actives mises à jour",
    pointMarked: "Point marqué : {{address}}",
    markBlackoutSuffix_one:
      "\nPoint bloqué par le système pendant {{count}} jour",
    markBlackoutSuffix_few:
      "\nPoint bloqué par le système pendant {{count}} jours",
    markBlackoutSuffix_many:
      "\nPoint bloqué par le système pendant {{count}} jours",
    markBlackoutSuffix_other:
      "\nPoint bloqué par le système pendant {{count}} jours",
    markBackdatedSuffix: "\nMarqué à : {{dateTime}}",
    pointAddressSuffix:
      "{{zoneLabel}}, rangée {{row}}, position {{column}} depuis le centre du corps",
  },
  menu: {
    title: "Menu",
    settingsRow: "Paramètres",
    mirrorRow: "Affichage en miroir",
    autoLockRow: "Verrouillage automatique de l'interface",
    daysToWhiteRow: "Jours avant récupération du point",
    daysToAvailableRow: "Jours avant que le point soit à nouveau disponible",
    zonePointsRow: "Disposition des points de zone",
    zonesRow: "Zones actives",
    themeRow: "Thème",
    languageRow: "Langue",
    exportRow: "Exporter les données",
    importRow: "Importer les données",
    autoLockEnableConfirm: "Activer",
    autoLockDialog: {
      message:
        "Vous pouvez activer le verrouillage automatique de l'interface pour éviter d'appuyer accidentellement sur un point d'injection. Le verrouillage se déclenche après un délai défini suivant l'appui sur un point, ou après une période d'inactivité en mode déverrouillé. Vous pouvez à nouveau déverrouiller l'interface via le bouton correspondant dans le menu du bas.",
      afterMark: "Après le marquage",
      afterUnlock: "Après le déverrouillage",
    },
    daysToWhiteDialog: {
      message:
        "Nombre de jours avant qu'un point d'injection soit à nouveau considéré comme totalement libre (blanc). Une valeur plus faible comprime les couleurs du cycle sur cette période.",
      fieldLabel: "Jours",
    },
    daysToAvailableDialog: {
      message:
        "Nombre de jours après la dernière marque pendant lesquels un point reste désactivé pour un nouveau marquage, en plus du cycle de couleurs. Ne peut pas dépasser « Jours avant récupération du point ». À 0 (par défaut), un point peut être marqué à nouveau à tout moment, comme avant l'existence de ce paramètre.",
      fieldLabel: "Jours",
    },
    zonePointsDialog: {
      message:
        "Choisissez le nombre de rangées et de colonnes de chaque groupe de zones. La zone reste centrée sur son propre centre sur les deux axes lors du redimensionnement.",
      rowsLabel: "Rangées",
      colsLabel: "Colonnes",
    },
    zonesDialog: {
      message:
        "Choisissez les zones d'injection à utiliser. Une zone désactivée est entièrement masquée du corps ; son historique est conservé et réapparaît si vous la réactivez. Au moins une zone doit rester activée.",
    },
    themeDialog: {
      message: "Le thème système suit le réglage d'apparence de votre appareil.",
      light: "Clair",
      dark: "Sombre",
      system: "Système",
    },
    languageDialog: {
      message: "La langue système suit le réglage de langue de votre appareil.",
      system: "Système",
      russian: "Русский",
      english: "English",
      german: "Deutsch",
      spanish: "Español",
      french: "Français",
      turkish: "Türkçe",
      portuguese: "Português (Brasil)",
    },
    exportOptionsDialog: {
      title: "Exporter les données",
      message: "Choisissez ce qu'il faut exporter dans le fichier.",
      marksLabel: "Marques des points d'injection",
      activePointsLabel: "Points actifs",
      blockedPointsLabel: "Points bloqués manuellement",
      settingsLabel: "Paramètres de l'application",
      confirmLabel: "Exporter",
      shareDialogTitle: "Exporter les données de {{appName}}",
    },
    importOptionsDialog: {
      title: "Importer les données",
      message:
        "Choisissez ce qu'il faut importer depuis le fichier. Les catégories absentes du fichier ne sont pas disponibles. Les catégories sélectionnées remplaceront les données actuelles — cette action est irréversible.",
      confirmLabel: "Importer",
    },
    undoConfirm: {
      title: "Annuler la dernière injection ?",
      message:
        "La dernière injection enregistrée sera supprimée. Cette action ne peut plus être annulée par la suite.",
      confirmLabel: "Annuler l'injection",
    },
    clearOptionsDialog: {
      title: "Effacer les données",
      message:
        "Choisissez ce qu'il faut effacer. Les marques de points d'injection et/ou les paramètres de l'application sélectionnés seront définitivement réinitialisés à leurs valeurs par défaut — cette action est irréversible.",
      confirmLabel: "Effacer",
    },
  },
  pointMenu: {
    unblock: "Débloquer",
    block: "Bloquer",
    titlePrefix: "Point · {{zoneLabel}}",
    titleFallback: "Actions du point",
    addressSubtitle: "RANGÉE {{row}}, POSITION {{column}} (depuis le centre du corps)",
    lastMark: "Dernière marque : {{dateTime}}",
    manuallyBlockedAt: "Bloqué manuellement : {{dateTime}}",
    systemBlockedCountdown: "Bloqué par le système.\nDéverrouillage dans : {{countdown}}",
    availableIn_one: "De nouveau disponible pour un marquage dans {{count}} jour",
    availableIn_few: "De nouveau disponible pour un marquage dans {{count}} jours",
    availableIn_many: "De nouveau disponible pour un marquage dans {{count}} jours",
    availableIn_other: "De nouveau disponible pour un marquage dans {{count}} jours",
  },
  markDialog: {
    title: "Marquer une injection",
    message: "Indiquez la date et l'heure de l'injection.",
  },
  mainScreen: {
    leftSideLabel: "côté\ngauche",
    rightSideLabel: "côté\ndroit",
    clearPointConfirm: {
      title: "Effacer ce point ?",
      message:
        "Les données de ce point seront supprimées et il deviendra blanc (libre). Cette action ne peut plus être annulée par la suite.",
    },
  },
  help: {
    title: "Aide",
    sectionZones: "Zones d'injection",
    sectionColorScheme: "Code couleur",
    sectionRecommendations: "Recommandations",
    sectionControls: "Contrôles",
    sectionBottomBar: "Barre du bas",
    sectionMenuItems: "Éléments du menu",
    sectionSettingsItems: "Éléments des paramètres",
    zones: {
      shoulder: {
        label: "Épaules",
        location: "tiers moyen, à l'arrière et sur le côté",
        description:
          "Absorption modérée. Début d'action en 10 minutes. Pic d'action en 60–90 minutes.",
      },
      belly: {
        label: "Ventre",
        location: "4 cm des côtes et du nombril",
        description:
          "Absorption rapide. Début d'action en 5 minutes. Pic d'action en 30–60 minutes.",
      },
      thigh: {
        label: "Cuisses",
        location: "surface latérale externe",
        description:
          "Absorption lente. Pour les insulines à action prolongée. Pic d'action en 90–120 minutes.",
      },
    },
    colorScheme: {
      unavailableExample:
        "Remplissage gris dans le coin — le marquage est bloqué par le réglage des jours avant disponibilité",
    },
    recommendations: {
      varySpot:
        "Même en respectant la rotation des sites, n'injectez pas toujours exactement au même endroit — variez légèrement le point précis d'injection au sein d'un même site également.",
    },
    controls: {
      press: "<bold>Appui</bold> — enregistrer une injection.",
      longPress:
        "<bold>Appui long</bold> (~1 s) — ouvrir le menu d'un point d'injection.",
      checkmark:
        "<bold>✓ Coche</bold> — point le plus récemment utilisé du groupe.",
    },
    bottomBar: {
      undo: "<bold>Annuler</bold> — annuler la dernière action (une injection, un blocage ou un déblocage).",
      menu: "<bold>{{label}}</bold> — ouvrir le menu des paramètres et des données.",
      help: "<bold>{{label}}</bold> — ouvrir cet écran.",
      lock: "<bold>Verrou</bold> — verrouiller ou déverrouiller l'interface pour éviter les appuis accidentels.",
    },
    menuItems: {
      settings: "<bold>{{label}}</bold> — ouvrir l'écran des paramètres de l'application.",
      mirror: "<bold>{{label}}</bold> — retourner horizontalement la silhouette du corps.",
      autoLock:
        "<bold>{{label}}</bold> — activer automatiquement le verrouillage après un délai défini suivant le marquage d'une injection, et après un déverrouillage manuel. Appuyer sur la ligne ouvre les réglages de délai.",
      daysToWhite:
        "<bold>{{label}}</bold> — nombre de jours avant qu'un point d'injection soit à nouveau considéré comme totalement libre (blanc). Diminuer la valeur comprime le code couleur sur cette période.",
      daysToAvailable:
        "<bold>{{label}}</bold> — nombre de jours après la dernière marque pendant lesquels un point reste désactivé pour un nouveau marquage, en plus du cycle de couleurs. Ne peut pas dépasser le réglage des jours avant récupération. À 0 (par défaut), un point peut être marqué à nouveau à tout moment.",
      zonePoints:
        "<bold>{{label}}</bold> — choisissez le nombre de rangées et de colonnes de chaque groupe de zones (épaules, ventre, cuisses). Réduire la grille d'une zone masque ses points hors plage sans perdre leur historique ; en l'agrandissant, cet historique réapparaît.",
      zones:
        "<bold>{{label}}</bold> — choisissez les zones individuelles (par exemple épaule gauche/droite) affichées sur le corps. Désactiver une zone la masque sans perdre son historique ; en la réactivant, cet historique réapparaît.",
      theme:
        "<bold>{{label}}</bold> — choisissez l'apparence claire, sombre ou système de l'application.",
      language: "<bold>{{label}}</bold> — choisissez la langue de l'interface de l'application.",
      export:
        "<bold>{{label}}</bold> — choisissez ce qu'il faut enregistrer dans un fichier : marques de points d'injection et/ou paramètres de l'application (séparément).",
      import:
        "<bold>{{label}}</bold> — choisissez ce qu'il faut appliquer depuis un fichier : marques de points d'injection et/ou paramètres de l'application (séparément). Les catégories absentes du fichier ne peuvent pas être sélectionnées ; les autres données actuelles ne sont pas modifiées.",
      clear:
        "<bold>{{label}}</bold> — choisissez ce qu'il faut réinitialiser : marques de points d'injection et/ou paramètres de l'application (séparément), de façon permanente et sans possibilité de récupération.",
    },
  },
  stateMachine: {
    colorLabel: {
      white_one: "Libre (inutilisé depuis {{count}}+ jour)",
      white_few: "Libre (inutilisé depuis {{count}}+ jours)",
      white_many: "Libre (inutilisé depuis {{count}}+ jours)",
      white_other: "Libre (inutilisé depuis {{count}}+ jours)",
      maroon: "À l'instant (jour 0)",
      black: "Bloqué par le système en raison d'une utilisation fréquente",
      gray: "Bloqué manuellement (blessure/bleu)",
    },
  },
};
