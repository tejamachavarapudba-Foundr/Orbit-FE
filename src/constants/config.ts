export const appConfig = {
  appName: "Orbit",
  apiBaseUrl: "https://orbit-be-production-e16c.up.railway.app/api",
  authRefreshPath: "/auth/refresh",
  authTokenKey: "startuphouze.auth.tokens",
  themeKey: "startuphouze.theme.preference",
  viewedStartupsKey: "startuphouze.viewed.startups",
} as const;
