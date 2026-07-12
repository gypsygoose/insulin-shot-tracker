import type { AppLocale } from "./en";

// en.ts is the source of truth for every translation key's shape (its
// `AppLocale` type, imported above); typing es against it means a key
// missing from es.ts is a compile error (see CLAUDE.md's "Localization"
// section). Spanish only has 2 real plural categories (_one/_other) —
// _few/_many are still defined here (equal to _other) purely to satisfy the
// shape shared with ru; Spanish's plural rules never select them at runtime.
export const es: AppLocale = {
  common: {
    cancel: "Cancelar",
    save: "Guardar",
    clear: "Borrar",
    mark: "Marcar",
    confirm: "Confirmar",
    daysCount_one: "{{count}} día",
    daysCount_few: "{{count}} días",
    daysCount_many: "{{count}} días",
    daysCount_other: "{{count}} días",
    minutesAbbrev: "{{count}} min",
    secondsAbbrev: "{{count}} s",
    daysAbbrev: "{{count}} d",
    hoursAbbrev: "{{count}} h",
  },
  zones: {
    shoulderRight: "Hombro derecho",
    shoulderLeft: "Hombro izquierdo",
    bellyRight: "Abdomen (derecha)",
    bellyLeft: "Abdomen (izquierda)",
    thighRight: "Muslo derecho",
    thighLeft: "Muslo izquierdo",
    groupShoulder: "Hombros",
    groupBelly: "Abdomen",
    groupThigh: "Muslos",
  },
  toast: {
    blocked: "Este punto está bloqueado y no se puede marcar",
    interfaceLocked:
      "La interfaz está bloqueada. Para marcar un punto de inyección, desbloquea la interfaz desde el menú inferior o usa el menú emergente del punto (pulsación larga).",
    interfaceLockEnabled: "Interfaz bloqueada",
    interfaceLockDisabled: "Interfaz desbloqueada",
    autoLockFired: "Interfaz bloqueada automáticamente",
    clearSuccess: "Datos borrados",
    undo: "Última acción deshecha",
    exportSuccess: "Datos exportados",
    importSuccess: "Datos importados",
    importFailure:
      "Error al importar\nEl archivo seleccionado está dañado o tiene un formato no válido.",
    mirrorEnabled: "Reflejo activado",
    mirrorDisabled: "Reflejo desactivado",
    autoLockEnabled: "Bloqueo automático activado",
    autoLockDisabled: "Bloqueo automático desactivado",
    autoLockUpdated: "Ajustes de bloqueo automático actualizados",
    labeledValue: "{{label}}: {{value}}",
    manualBlockPrefix: "Punto bloqueado manualmente",
    manualUnblockPrefix: "Punto desbloqueado manualmente",
    pointClearedPrefix: "Punto borrado",
    themeUpdatedPrefix: "Tema cambiado",
    languageUpdatedPrefix: "Idioma cambiado",
    zonePointCountsUpdated: "Disposición de puntos de zona actualizada",
    enabledZonesUpdated: "Zonas activas actualizadas",
    pointMarked: "Punto marcado: {{address}}",
    markBlackoutSuffix_one:
      "\nPunto bloqueado por el sistema durante {{count}} día",
    markBlackoutSuffix_few:
      "\nPunto bloqueado por el sistema durante {{count}} días",
    markBlackoutSuffix_many:
      "\nPunto bloqueado por el sistema durante {{count}} días",
    markBlackoutSuffix_other:
      "\nPunto bloqueado por el sistema durante {{count}} días",
    markBackdatedSuffix: "\nMarcado a las: {{dateTime}}",
    pointAddressSuffix:
      "{{zoneLabel}}, fila {{row}}, posición {{column}} desde el centro del cuerpo",
  },
  menu: {
    title: "Menú",
    mirrorRow: "Reflejar vista",
    autoLockRow: "Bloqueo automático de la interfaz",
    daysToWhiteRow: "Días hasta que el punto se recupera",
    zonePointsRow: "Disposición de puntos en zonas",
    zonesRow: "Zonas activas",
    themeRow: "Tema",
    languageRow: "Idioma",
    exportRow: "Exportar datos",
    importRow: "Importar datos",
    autoLockEnableConfirm: "Activar",
    autoLockDialog: {
      message:
        "Puedes activar el bloqueo automático de la interfaz para evitar tocar accidentalmente un punto de inyección. El bloqueo se activa tras un tiempo determinado después de tocar un punto, o tras un periodo de inactividad estando desbloqueado. Puedes volver a desbloquear la interfaz desde el botón correspondiente en el menú inferior.",
      afterMark: "Después de marcar",
      afterUnlock: "Después de desbloquear",
    },
    daysToWhiteDialog: {
      message:
        "Cuántos días deben pasar para que un punto de inyección se considere completamente libre (blanco) de nuevo. Un valor menor comprime los colores del ciclo en ese periodo.",
      fieldLabel: "Días",
    },
    zonePointsDialog: {
      message:
        "Elige cuántas filas y columnas tiene cada grupo de zonas. La zona permanece centrada en torno a su propio centro en ambos ejes al cambiar de tamaño.",
      rowsLabel: "Filas",
      colsLabel: "Columnas",
    },
    zonesDialog: {
      message:
        "Elige qué zonas de inyección usar. Una zona desactivada se oculta por completo del cuerpo; su historial se conserva y reaparece si vuelves a activarla. Al menos una zona debe permanecer activa.",
    },
    themeDialog: {
      message: "El tema del sistema sigue el ajuste de apariencia de tu dispositivo.",
      light: "Claro",
      dark: "Oscuro",
      system: "Sistema",
    },
    languageDialog: {
      message: "El idioma del sistema sigue el ajuste de idioma de tu dispositivo.",
      system: "Sistema",
      russian: "Русский",
      english: "English",
      german: "Deutsch",
      spanish: "Español",
      french: "Français",
      turkish: "Türkçe",
      portuguese: "Português (Brasil)",
    },
    exportOptionsDialog: {
      title: "Exportar datos",
      message: "Elige qué exportar al archivo.",
      marksLabel: "Marcas de puntos de inyección",
      activePointsLabel: "Puntos activos",
      blockedPointsLabel: "Puntos bloqueados manualmente",
      settingsLabel: "Ajustes de la aplicación",
      confirmLabel: "Exportar",
      shareDialogTitle: "Exportar datos de {{appName}}",
    },
    importOptionsDialog: {
      title: "Importar datos",
      message:
        "Elige qué importar del archivo. Las categorías que no están en el archivo no están disponibles. Las categorías seleccionadas reemplazarán los datos actuales — esta acción no se puede deshacer.",
      confirmLabel: "Importar",
    },
    undoConfirm: {
      title: "¿Deshacer la última inyección?",
      message:
        "Se eliminará la última inyección registrada. Esta acción no se puede deshacer de nuevo.",
      confirmLabel: "Deshacer inyección",
    },
    clearOptionsDialog: {
      title: "Borrar datos",
      message:
        "Elige qué borrar. Las marcas de puntos de inyección y/o los ajustes de la aplicación seleccionados se restablecerán permanentemente a sus valores predeterminados — esta acción no se puede deshacer.",
      confirmLabel: "Borrar",
    },
  },
  pointMenu: {
    unblock: "Desbloquear",
    block: "Bloquear",
    titlePrefix: "Punto · {{zoneLabel}}",
    titleFallback: "Acciones del punto",
    addressSubtitle: "FILA {{row}}, POSICIÓN {{column}} (desde el centro del cuerpo)",
    lastMark: "Última marca: {{dateTime}}",
    manuallyBlockedAt: "Bloqueado manualmente: {{dateTime}}",
    systemBlockedCountdown: "Bloqueado por el sistema.\nSe desbloquea en: {{countdown}}",
  },
  markDialog: {
    title: "Marcar inyección",
    message: "Indica la fecha y hora en que se administró la inyección.",
  },
  mainScreen: {
    leftSideLabel: "lado\nizquierdo",
    rightSideLabel: "lado\nderecho",
    clearPointConfirm: {
      title: "¿Borrar este punto?",
      message:
        "Se eliminarán los datos de este punto y se volverá blanco (libre). Esta acción no se puede deshacer de nuevo.",
    },
  },
  help: {
    title: "Ayuda",
    sectionZones: "Zonas de inyección",
    sectionColorScheme: "Esquema de colores",
    sectionRecommendations: "Recomendaciones",
    sectionControls: "Controles",
    sectionBottomBar: "Barra inferior",
    sectionMenuItems: "Elementos del menú",
    zones: {
      shoulder: {
        label: "Hombros",
        location: "tercio medio, parte posterior y lateral",
        description:
          "Absorción moderada. Inicio en 10 minutos. Efecto máximo en 60–90 minutos.",
      },
      belly: {
        label: "Abdomen",
        location: "4 cm de las costillas y el ombligo",
        description:
          "Absorción rápida. Inicio en 5 minutos. Efecto máximo en 30–60 minutos.",
      },
      thigh: {
        label: "Muslos",
        location: "superficie lateral externa",
        description:
          "Absorción lenta. Para insulina de acción prolongada. Efecto máximo en 90–120 minutos.",
      },
    },
    recommendations: {
      varySpot:
        "Aunque sigas la rotación de zonas, no inyectes siempre exactamente en el mismo punto — varía también ligeramente el punto exacto de inyección dentro de la misma zona.",
    },
    controls: {
      press: "<bold>Toque</bold> — registrar una inyección.",
      longPress:
        "<bold>Pulsación larga</bold> (~1 s) — abrir el menú de un punto de inyección.",
      checkmark:
        "<bold>✓ Marca de verificación</bold> — punto usado más recientemente en el grupo.",
    },
    bottomBar: {
      undo: "<bold>Deshacer</bold> — deshacer la última acción (una inyección, un bloqueo o un desbloqueo).",
      menu: "<bold>{{label}}</bold> — abrir el menú de ajustes y datos.",
      help: "<bold>{{label}}</bold> — abrir esta pantalla.",
      lock: "<bold>Bloqueo</bold> — bloquear o desbloquear la interfaz para evitar toques accidentales.",
    },
    menuItems: {
      mirror: "<bold>{{label}}</bold> — voltear la silueta del cuerpo horizontalmente.",
      autoLock:
        "<bold>{{label}}</bold> — activar automáticamente el bloqueo tras un tiempo determinado después de marcar una inyección y tras un desbloqueo manual. Tocar la fila abre los ajustes de retardo.",
      daysToWhite:
        "<bold>{{label}}</bold> — cuántos días deben pasar para que un punto de inyección se considere completamente libre (blanco) de nuevo. Reducir el valor comprime el esquema de colores en ese periodo.",
      zonePoints:
        "<bold>{{label}}</bold> — elige cuántas filas y columnas tiene cada grupo de zonas (hombros, abdomen, muslos). Reducir la cuadrícula de una zona oculta sus puntos fuera de rango sin perder su historial; al aumentarla, ese historial vuelve a aparecer.",
      zones:
        "<bold>{{label}}</bold> — elige qué zonas individuales (por ejemplo, hombro izquierdo/derecho) se muestran en el cuerpo. Desactivar una zona la oculta sin perder su historial; al reactivarla, ese historial vuelve a aparecer.",
      theme:
        "<bold>{{label}}</bold> — elige el tema de apariencia de la aplicación: claro, oscuro o del sistema.",
      language: "<bold>{{label}}</bold> — elige el idioma de la interfaz de la aplicación.",
      export:
        "<bold>{{label}}</bold> — elige qué guardar en un archivo: marcas de puntos de inyección y/o ajustes de la aplicación (por separado).",
      import:
        "<bold>{{label}}</bold> — elige qué aplicar desde un archivo: marcas de puntos de inyección y/o ajustes de la aplicación (por separado). Las categorías no presentes en el archivo no se pueden seleccionar; el resto de los datos actuales no se modifica.",
      clear:
        "<bold>{{label}}</bold> — elige qué restablecer: marcas de puntos de inyección y/o ajustes de la aplicación (por separado), de forma permanente y sin posibilidad de recuperación.",
    },
  },
  stateMachine: {
    colorLabel: {
      white_one: "Libre (sin usar durante {{count}}+ día)",
      white_few: "Libre (sin usar durante {{count}}+ días)",
      white_many: "Libre (sin usar durante {{count}}+ días)",
      white_other: "Libre (sin usar durante {{count}}+ días)",
      maroon: "Recién ahora (día 0)",
      black: "Bloqueado por el sistema por uso frecuente",
      gray: "Bloqueado manualmente (lesión/hematoma)",
    },
  },
};
