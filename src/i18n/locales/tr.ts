import type { AppLocale } from "./en";

// en.ts is the source of truth for every translation key's shape (its
// `AppLocale` type, imported above); typing tr against it means a key
// missing from tr.ts is a compile error (see CLAUDE.md's "Localization"
// section). Turkish only has 2 real plural categories (_one/_other) —
// _few/_many are still defined here (equal to _other) purely to satisfy the
// shape shared with ru; Turkish's plural rules never select them at runtime.
export const tr: AppLocale = {
  common: {
    cancel: "İptal",
    save: "Kaydet",
    clear: "Temizle",
    mark: "İşaretle",
    confirm: "Onayla",
    daysCount_one: "{{count}} gün",
    daysCount_few: "{{count}} gün",
    daysCount_many: "{{count}} gün",
    daysCount_other: "{{count}} gün",
    minutesAbbrev: "{{count}} dk",
    secondsAbbrev: "{{count}} sn",
    daysAbbrev: "{{count}} g",
    hoursAbbrev: "{{count}} sa",
  },
  zones: {
    shoulderRight: "Sağ omuz",
    shoulderLeft: "Sol omuz",
    bellyRight: "Karın (sağ)",
    bellyLeft: "Karın (sol)",
    thighRight: "Sağ uyluk",
    thighLeft: "Sol uyluk",
    groupShoulder: "Omuzlar",
    groupBelly: "Karın",
    groupThigh: "Uyluklar",
  },
  toast: {
    blocked: "Bu nokta engellendi ve işaretlenemez",
    interfaceLocked:
      "Arayüz kilitli. Bir enjeksiyon noktasını işaretlemek için arayüzü alt menüden kilidini açın veya noktanın açılır menüsünü kullanın (uzun basma).",
    interfaceLockEnabled: "Arayüz kilitlendi",
    interfaceLockDisabled: "Arayüz kilidi açıldı",
    autoLockFired: "Arayüz otomatik olarak kilitlendi",
    clearSuccess: "Veriler temizlendi",
    undo: "Son işlem geri alındı",
    exportSuccess: "Veriler dışa aktarıldı",
    importSuccess: "Veriler içe aktarıldı",
    importFailure:
      "İçe aktarma başarısız\nSeçilen dosya bozuk veya geçersiz biçimde.",
    mirrorEnabled: "Ayna görünümü etkin",
    mirrorDisabled: "Ayna görünümü kapalı",
    autoLockEnabled: "Otomatik kilit etkin",
    autoLockDisabled: "Otomatik kilit kapalı",
    autoLockUpdated: "Otomatik kilit ayarları güncellendi",
    labeledValue: "{{label}}: {{value}}",
    manualBlockPrefix: "Nokta elle engellendi",
    manualUnblockPrefix: "Nokta elle engeli kaldırıldı",
    pointClearedPrefix: "Nokta temizlendi",
    themeUpdatedPrefix: "Tema değiştirildi",
    languageUpdatedPrefix: "Dil değiştirildi",
    zonePointCountsUpdated: "Bölge nokta düzeni güncellendi",
    enabledZonesUpdated: "Etkin bölgeler güncellendi",
    pointMarked: "Nokta işaretlendi: {{address}}",
    markBlackoutSuffix_one:
      "\nNokta sistem tarafından {{count}} gün boyunca engellendi",
    markBlackoutSuffix_few:
      "\nNokta sistem tarafından {{count}} gün boyunca engellendi",
    markBlackoutSuffix_many:
      "\nNokta sistem tarafından {{count}} gün boyunca engellendi",
    markBlackoutSuffix_other:
      "\nNokta sistem tarafından {{count}} gün boyunca engellendi",
    markBackdatedSuffix: "\nİşaretlenme zamanı: {{dateTime}}",
    pointAddressSuffix:
      "{{zoneLabel}}, sıra {{row}}, vücut merkezinden {{column}}. nokta",
  },
  menu: {
    title: "Menü",
    mirrorRow: "Görünümü aynala",
    autoLockRow: "Arayüzü otomatik kilitle",
    daysToWhiteRow: "Noktanın iyileşmesine kalan gün sayısı",
    zonePointsRow: "Bölge nokta düzeni",
    zonesRow: "Etkin bölgeler",
    themeRow: "Tema",
    languageRow: "Dil",
    exportRow: "Verileri dışa aktar",
    importRow: "Verileri içe aktar",
    autoLockEnableConfirm: "Etkinleştir",
    autoLockDialog: {
      message:
        "Bir enjeksiyon noktasına yanlışlıkla dokunmayı önlemek için arayüzün otomatik kilitlenmesini etkinleştirebilirsiniz. Kilitleme, bir noktaya dokunulduktan belirli bir süre sonra veya kilit açıkken bir süre işlem yapılmadığında devreye girer. Arayüzün kilidini alt menüdeki ilgili düğmeden tekrar açabilirsiniz.",
      afterMark: "İşaretlemeden sonra",
      afterUnlock: "Kilidi açtıktan sonra",
    },
    daysToWhiteDialog: {
      message:
        "Bir enjeksiyon noktasının tekrar tamamen serbest (beyaz) sayılması için kaç gün geçmesi gerektiği. Daha düşük bir değer, döngünün renklerini bu süreye sıkıştırır.",
      fieldLabel: "Gün",
    },
    zonePointsDialog: {
      message:
        "Her bölge grubunun kaç satır ve sütuna sahip olacağını seçin. Boyutlandırma sırasında bölge, her iki eksende de kendi merkezine göre ortalanmış kalır.",
      rowsLabel: "Satır",
      colsLabel: "Sütun",
    },
    zonesDialog: {
      message:
        "Hangi enjeksiyon bölgelerinin kullanılacağını seçin. Devre dışı bırakılan bir bölge vücuttan tamamen gizlenir; geçmişi saklanır ve yeniden etkinleştirdiğinizde tekrar görünür. En az bir bölge etkin kalmalıdır.",
    },
    themeDialog: {
      message: "Sistem teması, cihazınızın görünüm ayarını izler.",
      light: "Açık",
      dark: "Koyu",
      system: "Sistem",
    },
    languageDialog: {
      message: "Sistem dili, cihazınızın dil ayarını izler.",
      system: "Sistem",
      russian: "Русский",
      english: "English",
      german: "Deutsch",
      spanish: "Español",
      french: "Français",
      turkish: "Türkçe",
      portuguese: "Português (Brasil)",
    },
    exportOptionsDialog: {
      title: "Verileri dışa aktar",
      message: "Dosyaya nelerin aktarılacağını seçin.",
      marksLabel: "Enjeksiyon noktası işaretleri",
      activePointsLabel: "Etkin noktalar",
      blockedPointsLabel: "Elle engellenen noktalar",
      settingsLabel: "Uygulama ayarları",
      confirmLabel: "Dışa aktar",
      shareDialogTitle: "{{appName}} verilerini dışa aktar",
    },
    importOptionsDialog: {
      title: "Verileri içe aktar",
      message:
        "Dosyadan nelerin içe aktarılacağını seçin. Dosyada bulunmayan kategoriler kullanılamaz. Seçilen kategoriler mevcut verilerin yerini alacak — bu işlem geri alınamaz.",
      confirmLabel: "İçe aktar",
    },
    undoConfirm: {
      title: "Son enjeksiyon geri alınsın mı?",
      message:
        "Kaydedilen son enjeksiyon kaldırılacak. Bu işlem tekrar geri alınamaz.",
      confirmLabel: "Enjeksiyonu geri al",
    },
    clearOptionsDialog: {
      title: "Verileri temizle",
      message:
        "Neyin temizleneceğini seçin. Seçilen enjeksiyon noktası işaretleri ve/veya uygulama ayarları kalıcı olarak varsayılan değerlerine sıfırlanacak — bu işlem geri alınamaz.",
      confirmLabel: "Temizle",
    },
  },
  pointMenu: {
    unblock: "Engeli kaldır",
    block: "Engelle",
    titlePrefix: "Nokta · {{zoneLabel}}",
    titleFallback: "Nokta işlemleri",
    addressSubtitle: "SIRA {{row}}, VÜCUT MERKEZİNDEN {{column}}. NOKTA",
    lastMark: "Son işaretleme: {{dateTime}}",
    manuallyBlockedAt: "Elle engellendi: {{dateTime}}",
    systemBlockedCountdown: "Sistem tarafından engellendi.\nKilit açılıyor: {{countdown}}",
  },
  markDialog: {
    title: "Enjeksiyonu işaretle",
    message: "Enjeksiyonun yapıldığı tarih ve saati belirtin.",
  },
  mainScreen: {
    leftSideLabel: "sol\ntaraf",
    rightSideLabel: "sağ\ntaraf",
    clearPointConfirm: {
      title: "Bu nokta temizlensin mi?",
      message:
        "Bu noktanın verileri kaldırılacak ve beyaza (serbest) dönecek. Bu işlem tekrar geri alınamaz.",
    },
  },
  help: {
    title: "Yardım",
    sectionZones: "Enjeksiyon bölgeleri",
    sectionColorScheme: "Renk şeması",
    sectionRecommendations: "Öneriler",
    sectionControls: "Kontroller",
    sectionBottomBar: "Alt çubuk",
    sectionMenuItems: "Menü öğeleri",
    zones: {
      shoulder: {
        label: "Omuzlar",
        location: "orta üçte bir, arka ve yan taraf",
        description:
          "Orta düzeyde emilim. Etki başlangıcı 10 dakika. Etki zirvesi 60–90 dakika.",
      },
      belly: {
        label: "Karın",
        location: "kaburgalardan ve göbekten 4 cm uzakta",
        description:
          "Hızlı emilim. Etki başlangıcı 5 dakika. Etki zirvesi 30–60 dakika.",
      },
      thigh: {
        label: "Uyluklar",
        location: "dış yan yüzey",
        description:
          "Yavaş emilim. Uzun etkili insülin için. Etki zirvesi 90–120 dakika.",
      },
    },
    recommendations: {
      varySpot:
        "Bölge rotasyonuna uysanız bile, her seferinde tam olarak aynı noktaya enjeksiyon yapmayın — aynı bölge içinde de tam enjeksiyon noktasını hafifçe değiştirin.",
    },
    controls: {
      press: "<bold>Dokunma</bold> — bir enjeksiyonu kaydeder.",
      longPress:
        "<bold>Uzun basma</bold> (~1 sn) — bir enjeksiyon noktası için menüyü açar.",
      checkmark:
        "<bold>✓ Onay işareti</bold> — gruptaki en son kullanılan nokta.",
    },
    bottomBar: {
      undo: "<bold>Geri al</bold> — son işlemi geri alır (bir enjeksiyon, engelleme veya engel kaldırma).",
      menu: "<bold>{{label}}</bold> — ayarlar ve veri menüsünü açar.",
      help: "<bold>{{label}}</bold> — bu ekranı açar.",
      lock: "<bold>Kilit</bold> — yanlışlıkla dokunmaları önlemek için arayüzü kilitler veya kilidini açar.",
    },
    menuItems: {
      mirror: "<bold>{{label}}</bold> — vücut silüetini yatay olarak çevirir.",
      autoLock:
        "<bold>{{label}}</bold> — bir enjeksiyon işaretlendikten belirli bir süre sonra ve elle kilit açıldıktan sonra kilitlemeyi otomatik olarak etkinleştirir. Satıra dokunmak gecikme ayarlarını açar.",
      daysToWhite:
        "<bold>{{label}}</bold> — bir enjeksiyon noktasının tekrar tamamen serbest (beyaz) sayılması için kaç gün geçmesi gerektiği. Değeri düşürmek renk şemasını bu süreye sıkıştırır.",
      zonePoints:
        "<bold>{{label}}</bold> — her bölge grubunun (omuzlar, karın, uyluklar) kaç satır ve sütuna sahip olacağını seçin. Bir bölgenin ızgarasını küçültmek, geçmişini kaybetmeden aralık dışı kalan noktalarını gizler; büyütüldüğünde bu geçmiş tekrar görünür.",
      zones:
        "<bold>{{label}}</bold> — vücutta hangi tek tek bölgelerin (örneğin sol/sağ omuz) gösterileceğini seçin. Bir bölgeyi devre dışı bırakmak, geçmişini kaybetmeden onu gizler; yeniden etkinleştirildiğinde bu geçmiş tekrar görünür.",
      theme:
        "<bold>{{label}}</bold> — uygulamanın açık, koyu veya sistem görünüm temasını seçin.",
      language: "<bold>{{label}}</bold> — uygulama arayüzünün dilini seçin.",
      export:
        "<bold>{{label}}</bold> — bir dosyaya nelerin kaydedileceğini seçin: enjeksiyon noktası işaretleri ve/veya uygulama ayarları (ayrı ayrı).",
      import:
        "<bold>{{label}}</bold> — bir dosyadan nelerin uygulanacağını seçin: enjeksiyon noktası işaretleri ve/veya uygulama ayarları (ayrı ayrı). Dosyada bulunmayan kategoriler seçilemez; diğer mevcut veriler değiştirilmez.",
      clear:
        "<bold>{{label}}</bold> — nelerin sıfırlanacağını seçin: enjeksiyon noktası işaretleri ve/veya uygulama ayarları (ayrı ayrı), kalıcı olarak ve geri kazanma imkânı olmadan.",
    },
  },
  stateMachine: {
    colorLabel: {
      white_one: "Serbest ({{count}}+ gündür kullanılmadı)",
      white_few: "Serbest ({{count}}+ gündür kullanılmadı)",
      white_many: "Serbest ({{count}}+ gündür kullanılmadı)",
      white_other: "Serbest ({{count}}+ gündür kullanılmadı)",
      maroon: "Az önce (gün 0)",
      black: "Sık kullanım nedeniyle sistem tarafından engellendi",
      gray: "Elle engellendi (yaralanma/morluk)",
    },
  },
};
