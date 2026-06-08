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

const toAuthUser = (response: AuthMeResponse): AuthUser => {
  const profile: any = { ...response.profile };

  if (profile.founderProfile) {
    profile.roleProfile = {
      role: "founder",
      data: profile.founderProfile,
    };
  } else if (profile.investorProfile) {
    profile.roleProfile = {
      role: "investor",
      data: profile.investorProfile,
    };
  } else if (profile.advisorProfile) {
    profile.roleProfile = {
      role: "advisor",
      data: profile.advisorProfile,
    };
  } else if (profile.professionalProfile) {
    profile.roleProfile = {
      role: "professional",
      data: profile.professionalProfile,
    };
  } else if (profile.serviceProviderProfile) {
    profile.roleProfile = {
      role: "service_provider",
      data: profile.serviceProviderProfile,
    };
  }

  return {
    id: response.id,
    email: response.email,
    fullName: profile.fullName,
    profile,
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
  me: async () => {
    const response = await apiClient.get<AuthMeResponse>("/auth/me");
    return toAuthUser(response.data);
  },
  logout: async (email: string) => {
    const response = await apiClient.post<LogoutResponse>("/auth/logout", { email });
    return response.data;
  }
};
