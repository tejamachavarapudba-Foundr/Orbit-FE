export const appConfig = {
  appName: "Orbit",
  apiBaseUrl: "https://orbit-be-production-e16c.up.railway.app/api",
  authRefreshPath: "/auth/refresh",
  authTokenKey: "startuphouze.auth.tokens",
  themeKey: "startuphouze.theme.preference",
  viewedStartupsKey: "startuphouze.viewed.startups",
  // sentry.io > Projects > (this project) > Settings > Client Keys (DSN).
  // A DSN isn't a secret — it's meant to ship in client bundles — so it's
  // fine hardcoded here like apiBaseUrl above. Left empty until set: Sentry
  // is only initialized in App.tsx when this is non-empty.
  sentryDsn: "",
} as const;
