import { useCallback, useMemo, useState } from "react";

import { AuthProfile } from "@/modules/auth/types";
import { useAuthStore } from "@/modules/auth/store";
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
  avatarUrl: profile?.avatarUrl ?? ""
});

const toPayload = (values: ProfileFormValues): UpdateProfilePayload => ({
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
  openToConnect: values.openToConnect
});

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

  return useMemo(
    () => ({ values, errorMessage, isSaving, isAvatarSaving, setValue, submit, submitAvatar }),
    [errorMessage, isAvatarSaving, isSaving, setValue, submit, submitAvatar, values]
  );
};
