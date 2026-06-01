import { appConfig } from "@/constants/config";
import { secureStorage } from "@/services/storage/secureStorage";
import { logger } from "@/utils/logger";

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

let memoryTokens: AuthTokens | null = null;

export const tokenService = {
  get: () => memoryTokens,
  set: async (tokens: AuthTokens) => {
    memoryTokens = tokens;
    await secureStorage.setItem(appConfig.authTokenKey, JSON.stringify(tokens));
  },
  hydrate: async () => {
    const value = await secureStorage.getItem(appConfig.authTokenKey);
    if (!value) {
      memoryTokens = null;
      return null;
    }

    try {
      const parsed = JSON.parse(value) as AuthTokens;
      memoryTokens = parsed;
      return parsed;
    } catch (error) {
      logger.warn("Stored auth token payload could not be parsed", error);
      memoryTokens = null;
      await secureStorage.removeItem(appConfig.authTokenKey);
      return null;
    }
  },
  clear: async () => {
    memoryTokens = null;
    await secureStorage.removeItem(appConfig.authTokenKey);
  }
};
