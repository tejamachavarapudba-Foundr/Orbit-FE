import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

import { appConfig } from "@/constants/config";
import { logger } from "@/utils/logger";
import { AuthTokens, tokenService } from "@/services/api/tokenService";

type RetryableRequest = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

let refreshPromise: Promise<AuthTokens> | null = null;

const refreshTokens = (refreshToken: string) => {
  refreshPromise ??= axios
    .post<AuthTokens>(`${appConfig.apiBaseUrl}${appConfig.authRefreshPath}`, { refreshToken })
    .then((response) => response.data)
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
};

export const apiClient = axios.create({
  baseURL: appConfig.apiBaseUrl,
  timeout: 20_000,
  headers: {
    "Content-Type": "application/json"
  }
});

apiClient.interceptors.request.use((config) => {
  const tokens = tokenService.get();

  if (tokens?.accessToken) {
    config.headers.Authorization = `Bearer ${tokens.accessToken}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequest | undefined;
    const tokens = tokenService.get();

    if (error.response?.status !== 401 || !originalRequest || originalRequest._retry || !tokens?.refreshToken) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const refreshedTokens = await refreshTokens(tokens.refreshToken);

      await tokenService.set(refreshedTokens);
      originalRequest.headers.Authorization = `Bearer ${refreshedTokens.accessToken}`;

      return apiClient(originalRequest);
    } catch (refreshError) {
      logger.warn("Refresh token failed", refreshError);
      await tokenService.clear();
      return Promise.reject(refreshError);
    }
  }
);
