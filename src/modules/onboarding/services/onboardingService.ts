import { apiClient } from "@/services/api/client";

export const onboardingService = {
  saveProgress: (payload: any) =>
    apiClient.patch("/profiles/me", payload),

  complete: (payload: any) =>
    apiClient.patch("/profiles/me", {
      ...payload,
      onboardingCompleted: true,
    }),

  getProfile: () =>
    apiClient.get("/auth/me"),
};