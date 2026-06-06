import { useEffect, useMemo } from "react";

import { ONBOARDING_ROLES, ROLE_GOALS, ROLE_GOAL_TITLES } from "@/constants/memberRoles";
import { isQuickProfileValid, QUICK_PROFILE_FIELDS } from "@/modules/onboarding/quickProfileConfig";
import { useOnboardingStore } from "@/modules/onboarding/store";
import { useAuthStore } from "@/modules/auth/store";

export const useOnboarding = () => {
  const draft = useOnboardingStore((state) => state.draft);
  const isSubmitting = useOnboardingStore((state) => state.isSubmitting);
  const errorMessage = useOnboardingStore((state) => state.errorMessage);
  const setStep = useOnboardingStore((state) => state.setStep);
  const setMemberRole = useOnboardingStore((state) => state.setMemberRole);
  const toggleGoal = useOnboardingStore((state) => state.toggleGoal);
  const setQuickField = useOnboardingStore((state) => state.setQuickField);
  const hydrateFromProfile = useOnboardingStore((state) => state.hydrateFromProfile);
  const saveProgress = useOnboardingStore((state) => state.saveProgress);
  const completeOnboarding = useOnboardingStore((state) => state.completeOnboarding);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!user?.id) {
      return;
    }
    if (!draft.memberRole) {
      hydrateFromProfile();
    }
  }, [draft.memberRole, hydrateFromProfile, user?.id]);

  const goalOptions = useMemo(() => {
    if (!draft.memberRole) {
      return [];
    }
    return ROLE_GOALS[draft.memberRole];
  }, [draft.memberRole]);

  const goalTitle = draft.memberRole ? ROLE_GOAL_TITLES[draft.memberRole] : "";

  const quickFields = draft.memberRole ? QUICK_PROFILE_FIELDS[draft.memberRole] : [];

  const canContinueWelcome = Boolean(draft.memberRole);
  const canContinueGoals = draft.goals.length > 0;
  const canContinueQuickProfile = draft.memberRole ? isQuickProfileValid(draft.memberRole, draft.quickProfile) : false;

  return {
    roles: ONBOARDING_ROLES,
    draft,
    goalOptions,
    goalTitle,
    quickFields,
    isSubmitting,
    errorMessage,
    canContinueWelcome,
    canContinueGoals,
    canContinueQuickProfile,
    setStep,
    setMemberRole,
    toggleGoal,
    setQuickField,
    saveProgress,
    completeOnboarding
  };
};
