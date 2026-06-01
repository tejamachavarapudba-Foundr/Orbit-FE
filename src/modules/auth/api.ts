import { apiClient } from "@/services/api/client";
import {
  AuthMeResponse,
  AuthTokenResponse,
  AuthUser,
  ForgotPasswordPayload,
  LoginPayload,
  LogoutResponse,
  RegisterPayload
} from "@/modules/auth/types";

const toAuthUser = (response: AuthMeResponse): AuthUser => ({
  id: response.id,
  email: response.email,
  fullName: response.profile.fullName,
  profile: response.profile
});

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
  me: async () => {
    const response = await apiClient.get<AuthMeResponse>("/auth/me");
    return toAuthUser(response.data);
  },
  logout: async (email: string) => {
    const response = await apiClient.post<LogoutResponse>("/auth/logout", { email });
    return response.data;
  }
};
