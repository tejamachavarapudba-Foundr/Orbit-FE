import { apiClient } from "@/services/api/client";
import {
  AuthMeResponse,
  AuthTokenResponse,
  AuthUser,
  ForgotPasswordPayload,
  LoginPayload,
  LogoutResponse,
  RegisterPayload,
  ResetPasswordPayload,
  VerifyEmailPayload
} from "@/modules/auth/types";
import { normalizeAuthProfile } from "@/modules/profile/normalizeProfile";

const toAuthUser = (response: AuthMeResponse): AuthUser => {
  const profile = normalizeAuthProfile(response.profile);

  return {
    id: response.id,
    email: response.email,
    fullName: profile.fullName,
    profile
  };
};

export const authApi = {
  login: async (payload: LoginPayload) => {
    const response = await apiClient.post<AuthTokenResponse>("/auth/login", payload);
    return response.data;
  },
  register: async (payload: RegisterPayload) => {
    const response = await apiClient.post<AuthTokenResponse>("/auth/register", payload);
    return response.data;
  },
  forgotPassword: async (payload: ForgotPasswordPayload) => {
    const response = await apiClient.post<{ message: string }>("/auth/forgot-password", payload);
    return response.data;
  },
  resetPassword: async (payload: ResetPasswordPayload) => {
    const response = await apiClient.post<{ message: string }>("/auth/reset-password", payload);
    return response.data;
  },
  verifyEmail: async (payload: VerifyEmailPayload) => {
    const response = await apiClient.post<{ message: string }>("/auth/verify-email", payload);
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
