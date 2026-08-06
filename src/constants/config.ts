import { Platform } from "react-native";

console.log("EXPO_PUBLIC_API_BASE_URL =", process.env.EXPO_PUBLIC_API_BASE_URL);
 
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

  return "http://192.168.1.11:3000/api";
};

console.log("ENV =", process.env.EXPO_PUBLIC_API_BASE_URL);
console.log("Resolved =", resolveApiBaseUrl());

export const appConfig = {
  appName: "Foundr",
  apiBaseUrl: "https://foundr-production.up.railway.app/api",
  authRefreshPath: "/auth/refresh",
  authTokenKey: "startuphouze.auth.tokens",
  themeKey: "startuphouze.theme.preference",
  viewedStartupsKey: "startuphouze.viewed.startups",
} as const;

console.log("APP CONFIG =", appConfig.apiBaseUrl);