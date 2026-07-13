import type { AppLocale } from "./en";

// en.ts is the source of truth for every translation key's shape (its
// `AppLocale` type, imported above); typing pt against it means a key
// missing from pt.ts is a compile error (see CLAUDE.md's "Localization"
// section). Brazilian Portuguese only has 2 real plural categories
// (_one/_other) — _few/_many are still defined here (equal to _other)
// purely to satisfy the shape shared with ru; Portuguese's plural rules
// never select them at runtime.
export const pt: AppLocale = {
  common: {
    cancel: "Cancelar",
    save: "Salvar",
    clear: "Limpar",
    mark: "Marcar",
    confirm: "Confirmar",
    daysCount_one: "{{count}} dia",
    daysCount_few: "{{count}} dias",
    daysCount_many: "{{count}} dias",
    daysCount_other: "{{count}} dias",
    minutesAbbrev: "{{count}} min",
    secondsAbbrev: "{{count}} s",
    daysAbbrev: "{{count}} d",
    hoursAbbrev: "{{count}} h",
  },
  zones: {
    shoulderRight: "Ombro direito",
    shoulderLeft: "Ombro esquerdo",
    bellyRight: "Abdômen (direita)",
    bellyLeft: "Abdômen (esquerda)",
    thighRight: "Coxa direita",
    thighLeft: "Coxa esquerda",
    groupShoulder: "Ombros",
    groupBelly: "Abdômen",
    groupThigh: "Coxas",
  },
  toast: {
    blocked: "Este ponto está bloqueado e não pode ser marcado",
    pointUnavailable_one:
      "Este ponto ainda não está disponível para marcação. Disponível em {{count}} dia",
    pointUnavailable_few:
      "Este ponto ainda não está disponível para marcação. Disponível em {{count}} dias",
    pointUnavailable_many:
      "Este ponto ainda não está disponível para marcação. Disponível em {{count}} dias",
    pointUnavailable_other:
      "Este ponto ainda não está disponível para marcação. Disponível em {{count}} dias",
    interfaceLocked:
      "A interface está bloqueada. Para marcar um ponto de injeção, desbloqueie a interface no menu inferior ou use o menu do ponto (toque longo).",
    interfaceLockEnabled: "Interface bloqueada",
    interfaceLockDisabled: "Interface desbloqueada",
    autoLockFired: "Interface bloqueada automaticamente",
    clearSuccess: "Dados apagados",
    undo: "Última ação desfeita",
    exportSuccess: "Dados exportados",
    importSuccess: "Dados importados",
    importFailure:
      "Falha ao importar\nO arquivo selecionado está corrompido ou em formato inválido.",
    mirrorEnabled: "Espelhamento ativado",
    mirrorDisabled: "Espelhamento desativado",
    autoLockEnabled: "Bloqueio automático ativado",
    autoLockDisabled: "Bloqueio automático desativado",
    autoLockUpdated: "Configurações de bloqueio automático atualizadas",
    labeledValue: "{{label}}: {{value}}",
    manualBlockPrefix: "Ponto bloqueado manualmente",
    manualUnblockPrefix: "Ponto desbloqueado manualmente",
    pointClearedPrefix: "Ponto apagado",
    themeUpdatedPrefix: "Tema alterado",
    languageUpdatedPrefix: "Idioma alterado",
    zonePointCountsUpdated: "Disposição de pontos da zona atualizada",
    enabledZonesUpdated: "Zonas ativas atualizadas",
    pointMarked: "Ponto marcado: {{address}}",
    markBlackoutSuffix_one: "\nPonto bloqueado pelo sistema por {{count}} dia",
    markBlackoutSuffix_few:
      "\nPonto bloqueado pelo sistema por {{count}} dias",
    markBlackoutSuffix_many:
      "\nPonto bloqueado pelo sistema por {{count}} dias",
    markBlackoutSuffix_other:
      "\nPonto bloqueado pelo sistema por {{count}} dias",
    markBackdatedSuffix: "\nMarcado às: {{dateTime}}",
    pointAddressSuffix:
      "{{zoneLabel}}, fileira {{row}}, posição {{column}} a partir do centro do corpo",
  },
  menu: {
    title: "Menu",
    settingsRow: "Configurações",
    mirrorRow: "Espelhar exibição",
    autoLockRow: "Bloqueio automático da interface",
    daysToWhiteRow: "Dias até o ponto se recuperar",
    daysToAvailableRow: "Dias até o ponto ficar disponível novamente",
    zonePointsRow: "Disposição de pontos na zona",
    zonesRow: "Zonas ativas",
    themeRow: "Tema",
    languageRow: "Idioma",
    exportRow: "Exportar dados",
    importRow: "Importar dados",
    autoLockEnableConfirm: "Ativar",
    autoLockDialog: {
      message:
        "Você pode ativar o bloqueio automático da interface para evitar tocar acidentalmente em um ponto de injeção. O bloqueio é ativado após um tempo definido depois de tocar em um ponto, ou após um período de inatividade com a interface desbloqueada. Você pode desbloquear a interface novamente pelo botão correspondente no menu inferior.",
      afterMark: "Após marcar",
      afterUnlock: "Após desbloquear",
    },
    daysToWhiteDialog: {
      message:
        "Quantos dias até um ponto de injeção ser considerado totalmente livre (branco) novamente. Um valor menor comprime as cores do ciclo nesse período.",
      fieldLabel: "Dias",
    },
    daysToAvailableDialog: {
      message:
        "Quantos dias após a última marca um ponto permanece desabilitado para uma nova marcação, além do ciclo de cores. Não pode exceder \"Dias até o ponto se recuperar\". Em 0 (padrão), um ponto pode ser marcado novamente a qualquer momento, como antes de esta configuração existir.",
      fieldLabel: "Dias",
    },
    zonePointsDialog: {
      message:
        "Escolha quantas linhas e colunas cada grupo de zonas tem. A zona permanece centralizada em seu próprio centro em ambos os eixos ao ser redimensionada.",
      rowsLabel: "Linhas",
      colsLabel: "Colunas",
    },
    zonesDialog: {
      message:
        "Escolha quais zonas de injeção usar. Uma zona desativada fica totalmente oculta no corpo; seu histórico é mantido e reaparece se você a reativar. Pelo menos uma zona deve permanecer ativa.",
    },
    themeDialog: {
      message: "O tema do sistema segue a configuração de aparência do seu dispositivo.",
      light: "Claro",
      dark: "Escuro",
      system: "Sistema",
    },
    languageDialog: {
      message: "O idioma do sistema segue a configuração de idioma do seu dispositivo.",
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
      title: "Exportar dados",
      message: "Escolha o que exportar para o arquivo.",
      marksLabel: "Marcas dos pontos de injeção",
      activePointsLabel: "Pontos ativos",
      blockedPointsLabel: "Pontos bloqueados manualmente",
      settingsLabel: "Configurações do aplicativo",
      confirmLabel: "Exportar",
      shareDialogTitle: "Exportar dados do {{appName}}",
    },
    importOptionsDialog: {
      title: "Importar dados",
      message:
        "Escolha o que importar do arquivo. Categorias ausentes no arquivo não ficam disponíveis. As categorias selecionadas substituirão os dados atuais — esta ação não pode ser desfeita.",
      confirmLabel: "Importar",
    },
    undoConfirm: {
      title: "Desfazer a última injeção?",
      message:
        "A última injeção registrada será removida. Esta ação não pode ser desfeita novamente.",
      confirmLabel: "Desfazer injeção",
    },
    clearOptionsDialog: {
      title: "Apagar dados",
      message:
        "Escolha o que apagar. As marcas de pontos de injeção e/ou configurações do aplicativo selecionadas serão permanentemente redefinidas para os padrões — esta ação não pode ser desfeita.",
      confirmLabel: "Apagar",
    },
  },
  pointMenu: {
    unblock: "Desbloquear",
    block: "Bloquear",
    titlePrefix: "Ponto · {{zoneLabel}}",
    titleFallback: "Ações do ponto",
    addressSubtitle: "FILEIRA {{row}}, POSIÇÃO {{column}} (a partir do centro do corpo)",
    lastMark: "Última marcação: {{dateTime}}",
    manuallyBlockedAt: "Bloqueado manualmente: {{dateTime}}",
    systemBlockedCountdown: "Bloqueado pelo sistema.\nDesbloqueia em: {{countdown}}",
    availableIn_one: "Disponível para marcar novamente em {{count}} dia",
    availableIn_few: "Disponível para marcar novamente em {{count}} dias",
    availableIn_many: "Disponível para marcar novamente em {{count}} dias",
    availableIn_other: "Disponível para marcar novamente em {{count}} dias",
  },
  markDialog: {
    title: "Marcar injeção",
    message: "Informe a data e a hora em que a injeção foi aplicada.",
  },
  mainScreen: {
    leftSideLabel: "lado\nesquerdo",
    rightSideLabel: "lado\ndireito",
    clearPointConfirm: {
      title: "Apagar este ponto?",
      message:
        "Os dados deste ponto serão removidos e ele ficará branco (livre). Esta ação não pode ser desfeita novamente.",
    },
  },
  help: {
    title: "Ajuda",
    sectionZones: "Zonas de injeção",
    sectionColorScheme: "Esquema de cores",
    sectionRecommendations: "Recomendações",
    sectionControls: "Controles",
    sectionBottomBar: "Barra inferior",
    sectionMenuItems: "Itens do menu",
    sectionSettingsItems: "Itens de configurações",
    zones: {
      shoulder: {
        label: "Ombros",
        location: "terço médio, na parte de trás e lateral",
        description:
          "Absorção moderada. Início em 10 minutos. Pico de ação em 60–90 minutos.",
      },
      belly: {
        label: "Abdômen",
        location: "4 cm das costelas e do umbigo",
        description:
          "Absorção rápida. Início em 5 minutos. Pico de ação em 30–60 minutos.",
      },
      thigh: {
        label: "Coxas",
        location: "superfície lateral externa",
        description:
          "Absorção lenta. Para insulina de ação prolongada. Pico de ação em 90–120 minutos.",
      },
    },
    colorScheme: {
      unavailableExample:
        "Preenchimento cinza no canto — a marcação está bloqueada pela configuração de dias até disponível",
    },
    recommendations: {
      varySpot:
        "Mesmo seguindo o rodízio dos locais, não aplique sempre exatamente no mesmo ponto — varie levemente o ponto exato de injeção também dentro do mesmo local.",
    },
    controls: {
      press: "<bold>Toque</bold> — registra uma injeção.",
      longPress:
        "<bold>Toque longo</bold> (~1 s) — abre o menu de um ponto de injeção.",
      checkmark:
        "<bold>✓ Marca de seleção</bold> — ponto usado mais recentemente no grupo.",
    },
    bottomBar: {
      undo: "<bold>Desfazer</bold> — desfaz a última ação (uma injeção, um bloqueio ou um desbloqueio).",
      menu: "<bold>{{label}}</bold> — abre o menu de configurações e dados.",
      help: "<bold>{{label}}</bold> — abre esta tela.",
      lock: "<bold>Bloqueio</bold> — bloqueia ou desbloqueia a interface para evitar toques acidentais.",
    },
    menuItems: {
      settings: "<bold>{{label}}</bold> — abre a tela de configurações do app.",
      mirror: "<bold>{{label}}</bold> — inverte a silhueta do corpo horizontalmente.",
      autoLock:
        "<bold>{{label}}</bold> — ativa automaticamente o bloqueio após um tempo definido depois de marcar uma injeção e após um desbloqueio manual. Tocar na linha abre as configurações de atraso.",
      daysToWhite:
        "<bold>{{label}}</bold> — quantos dias até um ponto de injeção ser considerado totalmente livre (branco) novamente. Diminuir o valor comprime o esquema de cores nesse período.",
      daysToAvailable:
        "<bold>{{label}}</bold> — quantos dias após a última marca um ponto permanece desabilitado para uma nova marcação, além do ciclo de cores. Não pode exceder a configuração de dias até a recuperação. Em 0 (padrão), um ponto pode ser marcado novamente a qualquer momento.",
      zonePoints:
        "<bold>{{label}}</bold> — escolha quantas linhas e colunas cada grupo de zonas (ombros, abdômen, coxas) tem. Reduzir a grade de uma zona oculta seus pontos fora do intervalo sem perder o histórico; ao aumentá-la, esse histórico reaparece.",
      zones:
        "<bold>{{label}}</bold> — escolha quais zonas individuais (por exemplo, ombro esquerdo/direito) são exibidas no corpo. Desativar uma zona a oculta sem perder seu histórico; ao reativá-la, esse histórico reaparece.",
      theme:
        "<bold>{{label}}</bold> — escolha o tema de aparência claro, escuro ou do sistema do aplicativo.",
      language: "<bold>{{label}}</bold> — escolha o idioma da interface do aplicativo.",
      export:
        "<bold>{{label}}</bold> — escolha o que salvar em um arquivo: marcas de pontos de injeção e/ou configurações do aplicativo (separadamente).",
      import:
        "<bold>{{label}}</bold> — escolha o que aplicar a partir de um arquivo: marcas de pontos de injeção e/ou configurações do aplicativo (separadamente). Categorias ausentes no arquivo não podem ser selecionadas; os demais dados atuais permanecem inalterados.",
      clear:
        "<bold>{{label}}</bold> — escolha o que redefinir: marcas de pontos de injeção e/ou configurações do aplicativo (separadamente), de forma permanente e sem possibilidade de recuperação.",
    },
  },
  stateMachine: {
    colorLabel: {
      white_one: "Livre (sem uso há {{count}}+ dia)",
      white_few: "Livre (sem uso há {{count}}+ dias)",
      white_many: "Livre (sem uso há {{count}}+ dias)",
      white_other: "Livre (sem uso há {{count}}+ dias)",
      maroon: "Agora mesmo (dia 0)",
      black: "Bloqueado pelo sistema por uso frequente",
      gray: "Bloqueado manualmente (lesão/hematoma)",
    },
  },
};
