// NativeWind's dark: variants on native are driven by RN's Appearance API
// round-tripping through the OS, which is unreliable on some devices/OS
// versions. These mirror global.css's :root / .dark blocks exactly and are
// applied directly via nativewind's vars() from our own theme store state,
// so dark mode doesn't depend on the native color-scheme machinery at all.
export const lightThemeVars = {
  "--color-primary": "59 130 246",
  "--color-on-primary": "255 255 255",
  "--color-primary-muted": "232 240 254",
  "--color-background": "252 252 253",
  "--color-foreground": "30 41 59",
  "--color-text": "30 41 59",
  "--color-card": "255 255 255",
  "--color-card-foreground": "30 41 59",
  "--color-surface": "247 248 250",
  "--color-surface-elevated": "255 255 255",
  "--color-secondary": "241 243 246",
  "--color-secondary-foreground": "34 44 63",
  "--color-muted-bg": "245 246 248",
  "--color-muted": "100 116 139",
  "--color-accent": "230 238 252",
  "--color-accent-foreground": "42 54 78",
  "--color-border": "226 232 240",
  "--color-input": "226 232 240",
  "--color-ring": "59 130 246",
  "--color-danger": "220 38 38",
  "--color-danger-foreground": "255 255 255",
  "--color-success": "22 163 74",
  "--color-success-foreground": "255 255 255"
};

export const darkThemeVars = {
  "--color-primary": "112 181 249",
  "--color-on-primary": "15 23 42",
  "--color-primary-muted": "30 58 95",
  "--color-background": "15 18 23",
  "--color-foreground": "244 246 248",
  "--color-text": "244 246 248",
  "--color-card": "25 29 35",
  "--color-card-foreground": "244 246 248",
  "--color-surface": "25 29 35",
  "--color-surface-elevated": "32 37 44",
  "--color-secondary": "38 44 54",
  "--color-secondary-foreground": "226 232 240",
  "--color-muted-bg": "32 37 44",
  "--color-muted": "166 176 189",
  "--color-accent": "38 54 78",
  "--color-accent-foreground": "226 232 240",
  "--color-border": "55 65 81",
  "--color-input": "55 65 81",
  "--color-ring": "112 181 249",
  "--color-danger": "255 125 125",
  "--color-danger-foreground": "15 23 42",
  "--color-success": "91 214 142",
  "--color-success-foreground": "15 23 42"
};
