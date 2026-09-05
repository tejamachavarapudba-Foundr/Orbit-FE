import { apiClient } from "@/services/api/client";
import {
  AuthMeResponse,
  AuthTokenWithUserResponse,
  AuthUser,
  ForgotPasswordPayload,
  LoginPayload,
  LogoutResponse,
  RegisterPayload,
  ResetPasswordPayload,
  VerifyEmailOtpPayload
} from "@/modules/auth/types";
import { normalizeAuthProfile } from "@/modules/profile/normalizeProfile";

const toAuthUser = (response: AuthMeResponse): AuthUser => {
  const profile = normalizeAuthProfile(response.profile);

  return {
    id: response.id,
    email: response.email,
    fullName: profile.fullName,
    emailVerified: response.emailVerified ?? false,
    profile
  };
};

export const authApi = {
  // user is left undefined here (rather than fetched via a fallback me()
  // call right away) when the backend hasn't deployed the merged response
  // yet — a me() call needs the access token already in secure storage,
  // which the caller only writes *after* this resolves, so the store
  // handles the fallback itself once tokens are actually persisted.
  login: async (payload: LoginPayload) => {
    const response = await apiClient.post<AuthTokenWithUserResponse>("/auth/login", payload);
    return { ...response.data, user: response.data.user ? toAuthUser(response.data.user) : undefined };
  },
  register: async (payload: RegisterPayload) => {
    const response = await apiClient.post<AuthTokenWithUserResponse>("/auth/register", payload);
    return { ...response.data, user: response.data.user ? toAuthUser(response.data.user) : undefined };
  },
  forgotPassword: async (payload: ForgotPasswordPayload) => {
    const response = await apiClient.post<{ message: string }>("/auth/forgot-password", payload);
    return response.data;
  },
  resetPassword: async (payload: ResetPasswordPayload) => {
    const response = await apiClient.post<{ message: string }>("/auth/reset-password", payload);
    return response.data;
  },
  verifyEmailOtp: async (payload: VerifyEmailOtpPayload) => {
    const response = await apiClient.post<{ success: boolean; message: string }>("/auth/verify-email-otp", payload);
    return response.data;
  },
  resendVerification: async (payload: ForgotPasswordPayload) => {
    const response = await apiClient.post<{ message: string }>("/auth/resend-verification", payload);
    return response.data;
  },
  me: async () => {
    const response = await apiClient.get<AuthMeResponse>("/auth/me");
    return toAuthUser(response.data);
  },
  logout: async (email: string) => {
    const response = await apiClient.post<LogoutResponse>("/auth/logout", { email });
    return response.data;
  }
};
