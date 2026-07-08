import { create } from "zustand";

import { Profile, UpdateAvatarPayload, UpdateProfilePayload, UpdateResumePayload } from "@/modules/profile/types";
import { profileApi } from "@/modules/profile/api";
import { toAppError } from "@/utils/errors";


type ProfileState = {
  isSaving: boolean;
  isAvatarSaving: boolean;
  errorMessage: string | null;
  savedProfile: Profile | null;
  isResumeSaving: boolean;
  updateProfile: (payload: UpdateProfilePayload) => Promise<Profile | null>;
  updateAvatar: (payload: UpdateAvatarPayload) => Promise<Profile | null>;
  deleteResume: () => Promise<Profile | null>;
  updateResume: (
    payload: UpdateResumePayload,
  ) => Promise<Profile | null>;
  
  clearError: () => void;
};

export const useProfileStore = create<ProfileState>((set) => ({
  isSaving: false,
  isAvatarSaving: false,
  errorMessage: null,
  savedProfile: null,
  isResumeSaving: false,
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
  clearError: () => set({ errorMessage: null }),

  updateResume: async (
    payload,
  ) => {
    set({
      isResumeSaving: true,
      errorMessage: null,
    });
  
    try {
      const profile =
        await profileApi.updateResume(
          payload,
        );
  
      set({
        savedProfile: profile,
        isResumeSaving: false,
      });
  
      return profile;
    } catch (error) {
      const appError =
        toAppError(error);
  
      set({
        errorMessage: appError.message,
        isResumeSaving: false,
      });
  
      return null;
    }
  },

  deleteResume: async () => {
    set({
      isResumeSaving: true,
      errorMessage: null,
    });
  
    try {
      const profile =
        await profileApi.deleteResume();
  
      set({
        savedProfile: profile,
        isResumeSaving: false,
      });
  
      return profile;
    } catch (error) {
      const appError = toAppError(error);
  
      set({
        errorMessage: appError.message,
        isResumeSaving: false,
      });
  
      return null;
    }
  },
}));
