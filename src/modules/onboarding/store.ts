import { create } from "zustand";

import { normalizeMemberRole, OnboardingMemberRole } from "@/constants/memberRoles";
import { normalizeAuthProfile } from "@/modules/profile/normalizeProfile";
import { onboardingApi } from "@/modules/onboarding/api";
import { buildProfilePatchFromOnboarding } from "@/modules/onboarding/buildProfilePatch";
import { CompleteOnboardingPayload, OnboardingDraft, OnboardingStep, QuickProfileValues } from "@/modules/onboarding/types";
import { emptyRoleProfile, toRoleProfileData } from "@/modules/profile/schemas";
import { useAuthStore } from "@/modules/auth/store";
import { useToastStore } from "@/store/toastStore";
import { toAppError } from "@/utils/errors";

const emptyQuickProfile = (): QuickProfileValues => ({
  fullName: "",
  headline: "",
  location: "",
  linkedinUrl: "",
  company: "",
  website: "",
  skills: "",
  roleFields: {}
});

type OnboardingState = {
  draft: OnboardingDraft;
  isSubmitting: boolean;
  errorMessage: string | null;
  setStep: (step: OnboardingStep) => void;
  setMemberRole: (role: OnboardingMemberRole) => void;
  toggleGoal: (goal: string) => void;
  setGoals: (goals: string[]) => void;
  setQuickField: (key: keyof QuickProfileValues | string, value: string) => void;
  hydrateFromProfile: () => void;
  saveProgress: () => Promise<boolean>;
  completeOnboarding: () => Promise<boolean>;
};

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  draft: {
    step: "welcome",
    memberRole: null,
    goals: [],
    quickProfile: emptyQuickProfile(),
    roleProfile: null
  },
  isSubmitting: false,
  errorMessage: null,
  setStep: (step) => set((state) => ({ draft: { ...state.draft, step } })),
  setMemberRole: (memberRole) =>
    set((state) => ({
      draft: {
        ...state.draft,
        memberRole,
        roleProfile: toRoleProfileData(memberRole, emptyRoleProfile(memberRole))
      }
    })),
  toggleGoal: (goal) =>
    set((state) => {
      const goals = state.draft.goals.includes(goal)
        ? state.draft.goals.filter((item) => item !== goal)
        : [...state.draft.goals, goal];
      return { draft: { ...state.draft, goals } };
    }),
  setGoals: (goals) => set((state) => ({ draft: { ...state.draft, goals } })),
  setQuickField: (key, value) =>
    set((state) => {
      if (key === "fullName" || key === "headline" || key === "location" || key === "linkedinUrl" || key === "company" || key === "website" || key === "skills") {
        return {
          draft: {
            ...state.draft,
            quickProfile: { ...state.draft.quickProfile, [key]: value }
          }
        };
      }

      return {
        draft: {
          ...state.draft,
          quickProfile: {
            ...state.draft.quickProfile,
            roleFields: { ...state.draft.quickProfile.roleFields, [key]: value }
          }
        }
      };
    }),
  hydrateFromProfile: () => {
    const rawProfile = useAuthStore.getState().user?.profile;
    if (!rawProfile) {
      return;
    }

    const profile = normalizeAuthProfile(rawProfile);

    set({
      draft: {
        step: "welcome",
        memberRole: normalizeMemberRole(profile.role),
        goals: profile.onboardingGoals ?? profile.lookingFor ?? [],
        quickProfile: {
          fullName: profile.fullName,
          headline: profile.headline,
          location: profile.location,
          linkedinUrl: profile.linkedinUrl,
          company: profile.company,
          website: profile.website,
          skills: profile.skills.join(", "),
          roleFields: {}
        },
        roleProfile: profile.roleProfile ?? null
      }
    });
  },
  saveProgress: async () => {
    const { draft } = get();
    if (!draft.memberRole) {
      return false;
    }

    set({ isSubmitting: true, errorMessage: null });

    try {
      const patch = buildProfilePatchFromOnboarding({
        step: draft.step,
        memberRole: draft.memberRole,
        goals: draft.goals,
        quickProfile: draft.quickProfile,
        roleProfile: draft.roleProfile
      });
      // draft.roleProfile is only ever seeded (empty) by setMemberRole and never
      // updated as the user types — patch.roleProfile is the actual merge of
      // quickProfile.roleFields into it, and is what must go over the wire.
      const updated = await onboardingApi.saveProgress({
        step: draft.step,
        memberRole: draft.memberRole,
        goals: draft.goals,
        quickProfile: draft.quickProfile,
        roleProfile: patch.roleProfile ?? draft.roleProfile
      });
      const currentProfile = useAuthStore.getState().user?.profile;

      if (currentProfile) {
        useAuthStore.getState().updateProfile({ ...currentProfile, ...patch, ...updated });
      }

      set({ isSubmitting: false });
      return true;
    } catch (error) {
      const appError = toAppError(error);
      set({ isSubmitting: false, errorMessage: appError.message });
      return false;
    }
  },
  completeOnboarding: async () => {
    const { draft } = get();
    if (!draft.memberRole || !draft.roleProfile) {
      return false;
    }

    set({ isSubmitting: true, errorMessage: null });

    // Same staleness issue as saveProgress: compute the merged roleProfile once
    // and use it both for the outgoing payload and the local optimistic patch,
    // instead of the empty seed still sitting in draft.roleProfile.
    const mergedPatch = buildProfilePatchFromOnboarding({
      step: "matches",
      memberRole: draft.memberRole,
      goals: draft.goals,
      quickProfile: draft.quickProfile,
      roleProfile: draft.roleProfile
    });

    const payload: CompleteOnboardingPayload = {
      memberRole: draft.memberRole,
      goals: draft.goals,
      quickProfile: draft.quickProfile,
      roleProfile: mergedPatch.roleProfile ?? draft.roleProfile
    };

    try {
      const updated = await onboardingApi.complete(payload);
      const authProfile = useAuthStore.getState().user!.profile;

      useAuthStore.getState().updateProfile({
        ...authProfile,
        ...mergedPatch,
        ...updated,
        onboardingCompleted: true
      });

      useToastStore.getState().show({ type: "success", title: "Welcome to Startuphouze!", message: "Your profile is ready." });
      set({ isSubmitting: false });
      return true;
    } catch (error) {
      const appError = toAppError(error);
      set({ isSubmitting: false, errorMessage: appError.message });
      useToastStore.getState().show({ type: "error", title: "Setup failed", message: appError.message });
      return false;
    }
  }
}));
