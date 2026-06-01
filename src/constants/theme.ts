export const themeColors = {
  light: {
    primary: "rgb(59, 130, 246)",
    onPrimary: "rgb(255, 255, 255)",
    background: "rgb(248, 250, 252)",
    surface: "rgb(255, 255, 255)",
    text: "rgb(15, 23, 42)",
    muted: "rgb(71, 85, 105)",
    border: "rgb(213, 221, 231)",
    danger: "rgb(196, 43, 43)",
    success: "rgb(20, 145, 80)"
  },
  dark: {
    primary: "rgb(112, 181, 249)",
    onPrimary: "rgb(15, 23, 42)",
    background: "rgb(15, 18, 23)",
    surface: "rgb(25, 29, 35)",
    text: "rgb(244, 246, 248)",
    muted: "rgb(166, 176, 189)",
    border: "rgb(55, 65, 81)",
    danger: "rgb(255, 125, 125)",
    success: "rgb(91, 214, 142)"
  }
} as const;

export type AppColorScheme = keyof typeof themeColors;
