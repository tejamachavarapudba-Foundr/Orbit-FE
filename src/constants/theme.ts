export const themeColors = {
  light: {
    primary: "rgb(59, 130, 246)",
    onPrimary: "rgb(255, 255, 255)",
    primaryMuted: "rgb(232, 240, 254)",
    background: "rgb(252, 252, 253)",
    foreground: "rgb(30, 41, 59)",
    surface: "rgb(247, 248, 250)",
    surfaceElevated: "rgb(255, 255, 255)",
    card: "rgb(255, 255, 255)",
    text: "rgb(30, 41, 59)",
    muted: "rgb(100, 116, 139)",
    border: "rgb(226, 232, 240)",
    input: "rgb(226, 232, 240)",
    ring: "rgb(59, 130, 246)",
    accent: "rgb(230, 238, 252)",
    secondary: "rgb(241, 243, 246)",
    danger: "rgb(220, 38, 38)",
    success: "rgb(22, 163, 74)"
  },
  dark: {
    primary: "rgb(112, 181, 249)",
    onPrimary: "rgb(15, 23, 42)",
    primaryMuted: "rgb(30, 58, 95)",
    background: "rgb(15, 18, 23)",
    foreground: "rgb(244, 246, 248)",
    surface: "rgb(25, 29, 35)",
    surfaceElevated: "rgb(32, 37, 44)",
    card: "rgb(25, 29, 35)",
    text: "rgb(244, 246, 248)",
    muted: "rgb(166, 176, 189)",
    border: "rgb(55, 65, 81)",
    input: "rgb(55, 65, 81)",
    ring: "rgb(112, 181, 249)",
    accent: "rgb(38, 54, 78)",
    secondary: "rgb(38, 44, 54)",
    danger: "rgb(255, 125, 125)",
    success: "rgb(91, 214, 142)"
  }
} as const;

export type AppColorScheme = keyof typeof themeColors;
