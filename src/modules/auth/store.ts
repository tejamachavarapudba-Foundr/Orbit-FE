import { create } from "zustand";
import { useProjectStore } from "@/modules/project/store";
import { authApi } from "@/modules/auth/api";
import { stopPushNotifications } from "@/modules/notifications/pushNotifications";
import { withTrace } from "@/utils/perfTrace";
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
  markEmailVerified: () => void;
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
        set({
          isHydrated: true,
          status: "unauthenticated",
          user: null,
        });

        return;
      }

      const user = await authApi.me();

      set({
        isHydrated: true,
        status: "authenticated",
        user,
      });
    } catch (e) {
      logger.error("Auth bootstrap failed", e);

      await tokenService.clear();

      set({
        isHydrated: true,
        status: "unauthenticated",
        user: null,
      });
    }
  },
    
  login: async (payload) => {
    set({ isSubmitting: true, errorMessage: null });

    try {
      const response = await withTrace("auth_login", () => authApi.login(payload));
      await tokenService.set({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken
      });
      const user = response.user ?? (await authApi.me());
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
      const response = await withTrace("auth_register", () => authApi.register(payload));
      await tokenService.set({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken
      });
      const user = response.user ?? (await authApi.me());
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

    await stopPushNotifications();

    try {
      if (email) {
        await authApi.logout(email);
      }
    } catch (error) {
      logger.warn(
        "Logout endpoint failed",
        error
      );
    } finally {
      await tokenService.clear();
  
      useProjectStore.setState({
        savedStartupIds: [],
        savedStartups: [],
      });
  
      set({
        status: "unauthenticated",
        user: null,
      });
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
  markEmailVerified: () =>
    set((state) => ({
      user: state.user ? { ...state.user, emailVerified: true } : state.user
    })),
  clearError: () => set({ errorMessage: null }),
}));
