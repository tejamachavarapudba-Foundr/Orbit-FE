import { Platform } from "react-native";

const resolveApiBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_API_BASE_URL;
  }

  if (
    typeof window !== "undefined" &&
    window.location &&
    window.location.hostname &&
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1"
  ) {
    return `http://${window.location.hostname}:3000/api`;
  }

  return "http://192.168.1.10:3000/api";
};

export const appConfig = {
  appName: "Foundr",
  apiBaseUrl: resolveApiBaseUrl(),
  authRefreshPath:
    process.env.EXPO_PUBLIC_AUTH_REFRESH_PATH ?? "/auth/refresh",
  authTokenKey: "startuphouze.auth.tokens",
  themeKey: "startuphouze.theme.preference",
} as const;