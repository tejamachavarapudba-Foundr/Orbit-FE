export const appConfig = {
  appName: "Startuphouze",
  apiBaseUrl: "https://foundr-production-ce83.up.railway.app/api",
  authRefreshPath: "/auth/refresh",
  authTokenKey: "startuphouze.auth.tokens",
  themeKey: "startuphouze.theme.preference",
  viewedStartupsKey: "startuphouze.viewed.startups",
} as const;
