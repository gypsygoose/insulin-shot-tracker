// App chrome theme — System resolves to the OS appearance at render time
// (see src/theme/ThemeContext.tsx); Light/Dark pin a specific palette.
export enum ThemeMode {
  Light = 'light',
  Dark = 'dark',
  System = 'system',
}
