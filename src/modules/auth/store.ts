import { create } from "zustand";

import { authApi } from "@/modules/auth/api";
import { AuthProfile, AuthUser, LoginPayload, RegisterPayload } from "@/modules/auth/types";
import { tokenService } from "@/services/api/tokenService";
import { toAppError } from "@/utils/errors";
import { logger } from "@/utils/logger";

type AuthStatus = "idle" | "authenticated" | "unauthenticated";

type AuthState = {
  isHydrated: boolean;
  status: AuthStatus;
  user: AuthUser | null;
  errorMessage: string | null;
  isSubmitting: boolean;
  bootstrap: () => Promise<void>;
  login: (payload: LoginPayload) => Promise<boolean>;
  register: (payload: RegisterPayload) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (profile: AuthProfile) => void;
  clearError: () => void;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  isHydrated: false,
  status: "idle",
  user: null,
  errorMessage: null,
  isSubmitting: false,
  bootstrap: async () => {
    try {
      const tokens = await tokenService.hydrate();

      if (!tokens) {
        set({ isHydrated: true, status: "unauthenticated", user: null });
        return;
      }

      const user = await authApi.me();
      set({ isHydrated: true, status: "authenticated", user });
    } catch (error) {
      logger.warn("Auth bootstrap failed", error);
      await tokenService.clear();
      set({ isHydrated: true, status: "unauthenticated", user: null });
    }
  },
  login: async (payload) => {
    set({ isSubmitting: true, errorMessage: null });

    try {
      const response = await authApi.login(payload);
      await tokenService.set({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken
      });
      const user = await authApi.me();
      set({ isSubmitting: false, status: "authenticated", user });
      return true;
    } catch (error) {
      const appError = toAppError(error);
      set({ isSubmitting: false, errorMessage: appError.message, status: "unauthenticated" });
      return false;
    }
  },
  register: async (payload) => {
    set({ isSubmitting: true, errorMessage: null });

    try {
      const response = await authApi.register(payload);
      await tokenService.set({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken
      });
      const user = await authApi.me();
      set({ isSubmitting: false, status: "authenticated", user });
      return true;
    } catch (error) {
      const appError = toAppError(error);
      set({ isSubmitting: false, errorMessage: appError.message, status: "unauthenticated" });
      return false;
    }
  },
  logout: async () => {
    const email = get().user?.email;

    try {
      if (email) {
        await authApi.logout(email);
      }
    } catch (error) {
      logger.warn("Logout endpoint failed", error);
    } finally {
      await tokenService.clear();
      set({ status: "unauthenticated", user: null });
    }
  },
  updateProfile: (profile) =>
    set((state) => ({
      user: state.user
        ? {
            ...state.user,
            fullName: profile.fullName,
            profile
          }
        : state.user
    })),
  clearError: () => set({ errorMessage: null })
}));
