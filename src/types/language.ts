// App interface language — System resolves to the device locale at render
// time (see src/i18n/LanguageContext.tsx); Russian/English/Spanish/German/
// French/Turkish/Portuguese pin a specific language. Values double as the
// corresponding i18next language codes.
export enum LanguageMode {
  System = 'system',
  Russian = 'ru',
  English = 'en',
  Spanish = 'es',
  German = 'de',
  French = 'fr',
  Turkish = 'tr',
  Portuguese = 'pt',
}
