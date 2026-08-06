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
  console.log("========== REQUEST ==========");
  console.log("BASE URL:", config.baseURL);
  console.log("URL:", config.url);
  console.log("FULL URL:", `${config.baseURL}${config.url}`);
  console.log("METHOD:", config.method);

  const tokens = tokenService.get();

  if (tokens?.accessToken) {
    config.headers.Authorization = `Bearer ${tokens.accessToken}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    console.log("SUCCESS RESPONSE");
    console.log(response.config.url);
    console.log(response.status);
    console.log(response.data);

    return response;
  },

  async (error: AxiosError) => {

    console.log("========== ERROR ==========");

    console.log("MESSAGE:", error.message);

    console.log("CODE:", error.code);

    console.log("STATUS:", error.response?.status);

    console.log("DATA:", error.response?.data);

    console.log("REQUEST URL:", error.config?.url);

    console.log("BASE URL:", error.config?.baseURL);

    console.log("FULL URL:",
      `${error.config?.baseURL}${error.config?.url}`
    );

    const originalRequest = error.config as RetryableRequest | undefined;

    const tokens = tokenService.get();

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      !tokens?.refreshToken
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {

      const refreshedTokens = await refreshTokens(tokens.refreshToken);

      await tokenService.set(refreshedTokens);

      originalRequest.headers.Authorization =
        `Bearer ${refreshedTokens.accessToken}`;

      return apiClient(originalRequest);

    } catch (refreshError) {

      console.log("REFRESH FAILED");

      console.log(refreshError);

      await tokenService.clear();

      return Promise.reject(refreshError);
    }
  }
);
