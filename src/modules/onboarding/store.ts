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
        roleProfile: toRoleProfileData(memberRole, emptyRoleProfile(memberRole)),
        // Pre-fill "Founder" as the visible default in the quick-profile
        // bottom sheet — without this, the picker sits on its blank
        // placeholder even though emptyFounderProfile() defaults to
        // "founder" behind the scenes, which only ever showed up after save.
        quickProfile:
          memberRole === "founder" && !state.draft.quickProfile.roleFields.founderStatus
            ? {
                ...state.draft.quickProfile,
                roleFields: { ...state.draft.quickProfile.roleFields, founderStatus: "founder" }
              }
            : state.draft.quickProfile
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
    const memberRole = normalizeMemberRole(profile.role);

    // profile.roleProfile is only populated once a role-specific profile row exists
    // (created by completeOnboarding). For any account that hasn't finished onboarding
    // yet — including brand-new accounts, whose role defaults to "other" and normalizes
    // to "professional" via LEGACY_ROLE_ALIASES, making it the only role pre-selected on
    // the Welcome screen — falling back to null here left draft.roleProfile null even
    // though a role was already chosen. completeOnboarding() then silently no-ops on
    // that null check, so "Enter Startuphouze" did nothing for anyone who never had to
    // tap a RoleCard (i.e. everyone landing on the pre-selected "professional" role).
    const roleProfile = profile.roleProfile ?? (memberRole ? toRoleProfileData(memberRole, emptyRoleProfile(memberRole)) : null);

    set({
      draft: {
        step: "welcome",
        memberRole,
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
        roleProfile
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
    if (!draft.memberRole) {
      set({ errorMessage: "Choose a role before continuing." });
      return false;
    }
    // roleProfile can still be null here if a role was selected without ever going
    // through setMemberRole (see hydrateFromProfile) — fall back to an empty seed
    // instead of silently no-opping, so the button always does *something*.
    const roleProfile = draft.roleProfile ?? toRoleProfileData(draft.memberRole, emptyRoleProfile(draft.memberRole));

    set({ isSubmitting: true, errorMessage: null });

    // Same staleness issue as saveProgress: compute the merged roleProfile once
    // and use it both for the outgoing payload and the local optimistic patch,
    // instead of the empty seed still sitting in draft.roleProfile.
    const mergedPatch = buildProfilePatchFromOnboarding({
      step: "matches",
      memberRole: draft.memberRole,
      goals: draft.goals,
      quickProfile: draft.quickProfile,
      roleProfile
    });

    const payload: CompleteOnboardingPayload = {
      memberRole: draft.memberRole,
      goals: draft.goals,
      quickProfile: draft.quickProfile,
      roleProfile: mergedPatch.roleProfile ?? roleProfile
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
