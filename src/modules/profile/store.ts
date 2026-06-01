import { create } from "zustand";

import { Profile, UpdateAvatarPayload, UpdateProfilePayload } from "@/modules/profile/types";
import { profileApi } from "@/modules/profile/api";
import { toAppError } from "@/utils/errors";

type ProfileState = {
  isSaving: boolean;
  isAvatarSaving: boolean;
  errorMessage: string | null;
  savedProfile: Profile | null;
  updateProfile: (payload: UpdateProfilePayload) => Promise<Profile | null>;
  updateAvatar: (payload: UpdateAvatarPayload) => Promise<Profile | null>;
  clearError: () => void;
};

export const useProfileStore = create<ProfileState>((set) => ({
  isSaving: false,
  isAvatarSaving: false,
  errorMessage: null,
  savedProfile: null,
  updateProfile: async (payload) => {
    set({ isSaving: true, errorMessage: null });

    try {
      const profile = await profileApi.updateMe(payload);
      set({ savedProfile: profile, isSaving: false });
      return profile;
    } catch (error) {
      const appError = toAppError(error);
      set({ errorMessage: appError.message, isSaving: false });
      return null;
    }
  },
  updateAvatar: async (payload) => {
    set({ isAvatarSaving: true, errorMessage: null });

    try {
      const profile = await profileApi.updateAvatar(payload);
      set({ savedProfile: profile, isAvatarSaving: false });
      return profile;
    } catch (error) {
      const appError = toAppError(error);
      set({ errorMessage: appError.message, isAvatarSaving: false });
      return null;
    }
  },
  clearError: () => set({ errorMessage: null })
}));
