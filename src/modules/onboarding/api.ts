import { apiClient } from "@/services/api/client";
import { AuthProfile } from "@/modules/auth/types";
import {
  CompleteOnboardingPayload,
  OnboardingProfileResponse,
  SaveOnboardingPayload
} from "@/modules/onboarding/types";
import { buildProfilePatchFromOnboarding } from "@/modules/onboarding/buildProfilePatch";

export const onboardingApi = {
  saveProgress: async (payload: SaveOnboardingPayload) => {
    try {
      const response = await apiClient.patch<OnboardingProfileResponse & AuthProfile>("/profiles/me/onboarding", payload);
      return response.data;
    } catch {
      const patch = buildProfilePatchFromOnboarding(payload);
      const response = await apiClient.patch<AuthProfile>("/profiles/me", patch);
      return response.data;
    }
  },
  complete: async (payload: CompleteOnboardingPayload) => {
    try {
      const response = await apiClient.post<OnboardingProfileResponse & AuthProfile>(
        "/profiles/me/onboarding/complete",
        payload
      );
      return response.data;
    } catch {
      const patch = buildProfilePatchFromOnboarding({
        step: "matches",
        memberRole: payload.memberRole,
        goals: payload.goals,
        quickProfile: payload.quickProfile,
        roleProfile: payload.roleProfile
      });
      const response = await apiClient.patch<AuthProfile>("/profiles/me", {
        ...patch,
        onboardingCompleted: true
      });
      return response.data;
    }
  }
};
