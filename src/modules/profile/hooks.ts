import { useCallback, useMemo, useState } from "react";

import { normalizeMemberRole } from "@/constants/memberRoles";
import { AuthProfile } from "@/modules/auth/types";
import { useAuthStore } from "@/modules/auth/store";
import { calculateProfileCompletion } from "@/modules/profile/completion";
import { emptyRoleProfile, RoleProfileData } from "@/modules/profile/schemas";
import { UpdateProfilePayload } from "@/modules/profile/types";
import { useProfileStore } from "@/modules/profile/store";
import { useToastStore } from "@/store/toastStore";

type ProfileFormValues = {
  fullName: string;
  headline: string;
  bio: string;
  role: string;
  location: string;
  company: string;
  website: string;
  linkedinUrl: string;
  skills: string;
  lookingFor: string;
  openToConnect: boolean;
  avatarUrl: string;
  roleProfile: RoleProfileData | null;
};

const toCsv = (values: string[]) => values.join(", ");
const fromCsv = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const fromProfile = (profile: AuthProfile | undefined): ProfileFormValues => ({
  fullName: profile?.fullName ?? "",
  headline: profile?.headline ?? "",
  bio: profile?.bio ?? "",
  role: profile?.role ?? "other",
  location: profile?.location ?? "",
  company: profile?.company ?? "",
  website: profile?.website ?? "",
  linkedinUrl: profile?.linkedinUrl ?? "",
  skills: toCsv(profile?.skills ?? []),
  lookingFor: toCsv(profile?.lookingFor ?? []),
  openToConnect: profile?.openToConnect ?? true,
  avatarUrl: profile?.avatarUrl ?? "",
  roleProfile: profile?.roleProfile ?? null
});

const toPayload = (values: ProfileFormValues): UpdateProfilePayload => {
  const memberRole = normalizeMemberRole(values.role.trim() || "other");
  const draftProfile: AuthProfile = {
    id: "",
    fullName: values.fullName.trim(),
    headline: values.headline.trim(),
    bio: values.bio.trim(),
    role: values.role.trim() || "other",
    location: values.location.trim(),
    company: values.company.trim(),
    website: values.website.trim(),
    linkedinUrl: values.linkedinUrl.trim(),
    skills: fromCsv(values.skills),
    lookingFor: fromCsv(values.lookingFor),
    openToConnect: values.openToConnect,
    avatarUrl: values.avatarUrl.trim(),
    onboardingGoals: fromCsv(values.lookingFor),
    roleProfile: values.roleProfile,
    createdAt: "",
    updatedAt: ""
  };

  return {
    fullName: values.fullName.trim(),
    headline: values.headline.trim(),
    bio: values.bio.trim(),
    role: values.role.trim() || "other",
    location: values.location.trim(),
    company: values.company.trim(),
    website: values.website.trim(),
    linkedinUrl: values.linkedinUrl.trim(),
    skills: fromCsv(values.skills),
    lookingFor: fromCsv(values.lookingFor),
    openToConnect: values.openToConnect,
    onboardingGoals: fromCsv(values.lookingFor),
    roleProfile: values.roleProfile,
    profileCompletion: memberRole ? calculateProfileCompletion(draftProfile, memberRole) : 0
  };
};

export const useProfileForm = () => {
  const profile = useAuthStore((state) => state.user?.profile);
  const updateAuthProfile = useAuthStore((state) => state.updateProfile);
  const updateProfile = useProfileStore((state) => state.updateProfile);
  const updateAvatar = useProfileStore((state) => state.updateAvatar);
  const isSaving = useProfileStore((state) => state.isSaving);
  const isAvatarSaving = useProfileStore((state) => state.isAvatarSaving);
  const errorMessage = useProfileStore((state) => state.errorMessage);
  const showToast = useToastStore((state) => state.show);
  const [values, setValues] = useState<ProfileFormValues>(() => fromProfile(profile));

  const setValue = useCallback(<K extends keyof ProfileFormValues>(key: K, value: ProfileFormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
  }, []);

  const setRoleProfile = useCallback((roleProfile: RoleProfileData) => {
    setValues((current) => ({ ...current, roleProfile }));
  }, []);

  const ensureRoleProfile = useCallback(() => {
    const memberRole = normalizeMemberRole(values.role);
    if (!memberRole) {
      return;
    }
    if (values.roleProfile?.role === memberRole) {
      return;
    }
    setRoleProfile({ role: memberRole, data: emptyRoleProfile(memberRole) } as RoleProfileData);
  }, [setRoleProfile, values.role, values.roleProfile]);

  const submit = useCallback(async () => {
    const updated = await updateProfile(toPayload(values));
    if (!updated) {
      return false;
    }

    updateAuthProfile(updated);
    setValues(fromProfile(updated));
    showToast({ type: "success", title: "Profile saved", message: "Your profile is up to date." });
    return true;
  }, [showToast, updateAuthProfile, updateProfile, values]);

  const submitAvatar = useCallback(async () => {
    const updated = await updateAvatar({ avatarUrl: values.avatarUrl.trim() });
    if (!updated) {
      return false;
    }

    updateAuthProfile(updated);
    setValues(fromProfile(updated));
    showToast({ type: "success", title: "Avatar updated" });
    return true;
  }, [showToast, updateAuthProfile, updateAvatar, values.avatarUrl]);

  const memberRole = normalizeMemberRole(values.role);
  const profileCompletion = memberRole
    ? calculateProfileCompletion(
        {
          ...values,
          id: profile?.id ?? "",
          skills: fromCsv(values.skills),
          lookingFor: fromCsv(values.lookingFor),
          createdAt: profile?.createdAt ?? "",
          updatedAt: profile?.updatedAt ?? "",
          onboardingGoals: fromCsv(values.lookingFor),
          roleProfile: values.roleProfile
        },
        memberRole
      )
    : 0;

  return useMemo(
    () => ({
      values,
      memberRole,
      profileCompletion,
      errorMessage,
      isSaving,
      isAvatarSaving,
      setValue,
      setRoleProfile,
      ensureRoleProfile,
      submit,
      submitAvatar
    }),
    [
      ensureRoleProfile,
      errorMessage,
      isAvatarSaving,
      isSaving,
      memberRole,
      profileCompletion,
      setRoleProfile,
      setValue,
      submit,
      submitAvatar,
      values
    ]
  );
};
