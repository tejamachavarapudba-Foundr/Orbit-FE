import { normalizeMemberRole } from "@/constants/memberRoles";
import { AuthProfile } from "@/modules/auth/types";

const hasBasics = (profile: AuthProfile) =>
  Boolean(profile.fullName?.trim() && profile.headline?.trim() && profile.location?.trim());

/** Existing users created before onboarding — skip wizard when profile looks complete. */
export const isLegacyProfileComplete = (profile: AuthProfile | undefined): boolean => {
  if (!profile) {
    return false;
  }

  if (profile.onboardingCompleted === true) {
    return true;
  }

  if (profile.onboardingCompleted === false) {
    return false;
  }

  const role = profile.role?.trim();
  return Boolean(role && role !== "other" && hasBasics(profile));
};

export const needsOnboarding = (profile: AuthProfile | undefined): boolean => {
  if (!profile) {
    return false;
  }

  if (profile.onboardingCompleted === true) {
    return false;
  }

  if (isLegacyProfileComplete(profile)) {
    return false;
  }

  return true;
};
