import { useCallback, useEffect, useMemo, useState } from "react";

import { normalizeMemberRole } from "@/constants/memberRoles";
import { AuthProfile } from "@/modules/auth/types";
import { useAuthStore } from "@/modules/auth/store";
import { calculateProfileCompletion } from "@/modules/profile/completion";
import { normalizeAuthProfile } from "@/modules/profile/normalizeProfile";
import { emptyRoleProfile, RoleProfileData, toRoleProfileData } from "@/modules/profile/schemas";
import { UpdateProfilePayload } from "@/modules/profile/types";
import { useProfileStore } from "@/modules/profile/store";
import { useToastStore } from "@/store/toastStore";
import { withTrace } from "@/utils/perfTrace";

type ProfileFormValues = {
  fullName: string;
  headline: string;
  bio: string;
  role: string;
  location: string;
  language: string;
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

const fromProfile = (profile: AuthProfile | undefined): ProfileFormValues => {
  const normalized = profile ? normalizeAuthProfile(profile) : undefined;

  return {
    fullName: normalized?.fullName ?? "",
    headline: normalized?.headline ?? "",
    bio: normalized?.bio ?? "",
    role: normalized?.role ?? "other",
    location: normalized?.location ?? "",
    language: toCsv(normalized?.language ?? []),
    company: normalized?.company ?? "",
    website: normalized?.website ?? "",
    linkedinUrl: normalized?.linkedinUrl ?? "",
    skills: toCsv(normalized?.skills ?? []),
    lookingFor: toCsv(normalized?.lookingFor ?? []),
    openToConnect: normalized?.openToConnect ?? true,
    avatarUrl: normalized?.avatarUrl ?? "",
    roleProfile: normalized?.roleProfile ?? null
  };
};

const toPayload = (values: ProfileFormValues): UpdateProfilePayload => {
  const memberRole = normalizeMemberRole(values.role.trim() || "other");
  const draftProfile: AuthProfile = {
    id: "",
    fullName: values.fullName.trim(),
    headline: values.headline.trim(),
    bio: values.bio.trim(),
    role: values.role.trim() || "other",
    location: values.location.trim(),
    language: fromCsv(values.language),
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
    language: fromCsv(values.language),
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
  const updateResume = useProfileStore((state) => state.updateResume);
  const deleteResume = useProfileStore((state) => state.deleteResume);
  const isResumeSaving = useProfileStore((state) => state.isResumeSaving);
  const isSaving = useProfileStore((state) => state.isSaving);
  const isAvatarSaving = useProfileStore((state) => state.isAvatarSaving);
  const errorMessage = useProfileStore((state) => state.errorMessage);
  const showToast = useToastStore((state) => state.show);
  const [values, setValues] = useState<ProfileFormValues>(() => fromProfile(profile));
  useEffect(() => {
    if (!profile) {
      return;
    }

    setValues(fromProfile(profile));
  }, [profile]);

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

    const hydrated = profile ? normalizeAuthProfile(profile).roleProfile : null;
    if (hydrated?.role === memberRole) {
      setRoleProfile(hydrated);
      return;
    }

    setRoleProfile(toRoleProfileData(memberRole, emptyRoleProfile(memberRole)));
  }, [profile, setRoleProfile, values.role, values.roleProfile]);

  const submit = useCallback(async () => {
    const payload = toPayload(values);
    const updated = await withTrace("profile_save", () => updateProfile(payload));

    if (!updated) {
      const message = useProfileStore.getState().errorMessage ?? "Something went wrong. Please try again.";
      showToast({ type: "error", title: "Couldn't save profile", message });
      return false;
    }

    const normalized = normalizeAuthProfile({
      ...updated,
      roleProfile: updated.roleProfile ?? payload.roleProfile ?? null
    });

    updateAuthProfile(normalized);
    setValues(fromProfile(normalized));
    showToast({ type: "success", title: "Profile saved", message: "Your profile is up to date." });
    return true;
  }, [showToast, updateAuthProfile, updateProfile, values]);

  const submitAvatar = useCallback(
    async (formData: FormData) => {
      const updated = await updateAvatar(formData);
      if (!updated) {
        return false;
      }

      updateAuthProfile(updated);
      setValues(fromProfile(updated));
      showToast({ type: "success", title: "Avatar updated" });
      return true;
    },
    [showToast, updateAuthProfile, updateAvatar]
  );

  const submitResume = useCallback(
    async (payload: FormData) => {
      const updated = await updateResume(payload);
  
      if (!updated) {
        return false;
      }
  
      updateAuthProfile(updated);
  
      setValues(fromProfile(updated));
  
      showToast({
        type: "success",
        title: "Resume uploaded",
      });
  
      return true;
    },
    [
      showToast,
      updateAuthProfile,
      updateResume,
    ],
  );

  const submitResumeDelete = useCallback(async () => {
    const updated = await deleteResume();
  
    if (!updated) {
      return false;
    }
  
    updateAuthProfile(updated);
  
    setValues(fromProfile(updated));
  
    showToast({
      type: "success",
      title: "Resume deleted",
    });
  
    return true;
  }, [
    deleteResume,
    updateAuthProfile,
    showToast,
  ]);

  const memberRole = normalizeMemberRole(values.role);
  const profileCompletion = memberRole
    ? calculateProfileCompletion(
        {
          ...values,
          id: profile?.id ?? "",
          language: fromCsv(values.language),
          skills: fromCsv(values.skills),
          lookingFor: fromCsv(values.lookingFor),
          createdAt: profile?.createdAt ?? "",
          updatedAt: profile?.updatedAt ?? "",
          onboardingGoals: fromCsv(values.lookingFor),
          roleProfile: values.roleProfile,
          resumeKey: profile?.resumeKey ?? ""
        },
        memberRole
      )
    : 0;

  return useMemo(
    () => ({
      profile,
      values,
      memberRole,
      profileCompletion,
      errorMessage,
      isSaving,
      isAvatarSaving,
      isResumeSaving,
      setValue,
      setRoleProfile,
      ensureRoleProfile,
      submit,
      submitAvatar,
      submitResume,
      submitResumeDelete,
    }),
    [
      profile,
      ensureRoleProfile,
      errorMessage,
      isAvatarSaving,
      isResumeSaving,
      isSaving,
      memberRole,
      profileCompletion,
      setRoleProfile,
      setValue,
      submit,
      submitAvatar,
      submitResume,
      values,
      submitResumeDelete,
    ]
  );
};
