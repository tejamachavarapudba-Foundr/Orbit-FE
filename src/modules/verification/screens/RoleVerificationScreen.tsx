import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";

import { AppButton } from "@/components/ui/AppButton";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { AppTextInput } from "@/components/ui/AppTextInput";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { iconSize } from "@/theme/designTokens";
import { MainStackParamList } from "@/app/navigation/types";
import { useAuthStore } from "@/modules/auth/store";
import { useProfileStore } from "@/modules/profile/store";
import { normalizeAuthProfile } from "@/modules/profile/normalizeProfile";
import {
  emptyAdvisorProfile,
  emptyInvestorProfile,
  emptyProfessionalProfile,
  emptyServiceProviderProfile
} from "@/modules/profile/schemas";
import { Certification, emptyWorkExperience, WorkExperience } from "@/modules/profile/schemas/experience";
import { CertificationEditor, ExperienceEditor } from "@/modules/profile/components/ExperienceCertificationEditors";
import { UpdateProfilePayload } from "@/modules/profile/types";
import { useToastStore } from "@/store/toastStore";
import { useVerificationStatus } from "@/modules/verification/hooks";
import { isValidLinkedInUrl, isValidUrl } from "@/utils/validation";

type RoleVerificationRoute = RouteProp<MainStackParamList, "RoleVerification">;

export const RoleVerificationScreen = () => {
  const colors = useThemeTokens();
  const navigation = useNavigation<any>();
  const { role } = useRoute<RoleVerificationRoute>().params;
  const profile = useAuthStore((state) => state.user?.profile);
  const updateAuthProfile = useAuthStore((state) => state.updateProfile);
  const updateProfile = useProfileStore((state) => state.updateProfile);
  const isSaving = useProfileStore((state) => state.isSaving);
  const showToast = useToastStore((state) => state.show);
  const { loadStatus } = useVerificationStatus();

  const normalized = profile ? normalizeAuthProfile(profile) : undefined;
  const roleData = normalized?.roleProfile?.role === role ? normalized.roleProfile.data : undefined;

  const [company, setCompany] = useState(normalized?.company ?? "");
  const [website, setWebsite] = useState(normalized?.website ?? "");
  const [experiences, setExperiences] = useState<WorkExperience[]>(() => {
    const existing = ((roleData as { experiences?: WorkExperience[] })?.experiences ?? []) as WorkExperience[];
    return existing.length ? existing : [emptyWorkExperience()];
  });
  const [certifications, setCertifications] = useState<Certification[]>(
    ((roleData as { certifications?: Certification[] })?.certifications ?? []) as Certification[]
  );
  // Onboarding's Quick Profile step already collects company/website/LinkedIn
  // for service providers (mapped to the shared profile fields) — falling
  // back to those here means this screen isn't asking the user to re-enter
  // the same details a second time from blank, which looked like "onboarding
  // details aren't carrying over" even though they were saved correctly.
  const [spCompany, setSpCompany] = useState((roleData as { company?: string })?.company || normalized?.company || "");
  const [spWebsite, setSpWebsite] = useState((roleData as { website?: string })?.website || normalized?.website || "");
  const [spLinkedin, setSpLinkedin] = useState(
    (roleData as { companyLinkedinUrl?: string })?.companyLinkedinUrl || normalized?.linkedinUrl || ""
  );

  const copy = {
    investor: {
      title: "Investor verification",
      description: "Add your company name and website — this unlocks investor snapshots on startups."
    },
    professional: {
      title: "Professional verification",
      description: "Add your work experience and any certifications — this boosts how your profile appears to others. Certifications are optional."
    },
    advisor: {
      title: "Advisor verification",
      description: "Add your work experience and any certifications — this boosts how your profile appears to others. Certifications are optional."
    },
    service_provider: {
      title: "Service provider verification",
      description: "Add your company name, website and LinkedIn page."
    }
  }[role];

  const hasValidExperience = experiences.some((entry) => entry.company.trim() && entry.designation.trim());

  const canSubmit =
    role === "investor"
      ? Boolean(company.trim() && website.trim())
      : role === "professional" || role === "advisor"
        ? hasValidExperience
        : Boolean(spCompany.trim() && spWebsite.trim() && spLinkedin.trim());

  const submit = async () => {
    if (!normalized) return;

    const cleanedExperiences = experiences.filter((entry) => entry.company.trim() || entry.designation.trim());
    const cleanedCertifications = certifications.filter((entry) => entry.name.trim() && entry.fileUrl);

    const basePayload: UpdateProfilePayload = {
      fullName: normalized.fullName,
      headline: normalized.headline,
      bio: normalized.bio,
      role: normalized.role,
      location: normalized.location,
      language: normalized.language,
      company: role === "investor" ? company.trim() : normalized.company,
      website: role === "investor" ? website.trim() : normalized.website,
      linkedinUrl: normalized.linkedinUrl,
      skills: normalized.skills,
      lookingFor: normalized.lookingFor,
      openToConnect: normalized.openToConnect,
      onboardingGoals: normalized.onboardingGoals ?? [],
      roleProfile:
        role === "professional"
          ? {
              role,
              data: {
                ...emptyProfessionalProfile(),
                ...((roleData as object) ?? {}),
                experiences: cleanedExperiences,
                certifications: cleanedCertifications
              }
            }
          : role === "advisor"
            ? {
                role,
                data: {
                  ...emptyAdvisorProfile(),
                  ...((roleData as object) ?? {}),
                  experiences: cleanedExperiences,
                  certifications: cleanedCertifications
                }
              }
            : role === "service_provider"
              ? {
                  role,
                  data: {
                    ...emptyServiceProviderProfile(),
                    ...((roleData as object) ?? {}),
                    company: spCompany.trim(),
                    website: spWebsite.trim(),
                    companyLinkedinUrl: spLinkedin.trim()
                  }
                }
              : normalized.roleProfile ?? { role: "investor", data: emptyInvestorProfile() }
    };

    const updated = await updateProfile(basePayload);
    if (!updated) return;

    updateAuthProfile(updated);
    await loadStatus();
    showToast({ type: "success", title: "Saved" });
    navigation.goBack();
  };

  return (
    <AppScreen>
      <View className="flex-row items-center gap-2 pb-2 pt-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={() => navigation.goBack()}
          className="h-9 w-9 items-center justify-center rounded-md"
        >
          <Feather name="arrow-left" size={iconSize.md} color={colors.text} />
        </Pressable>
        <AppText weight="bold" size="lg">
          {copy.title}
        </AppText>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <AppText tone="muted" size="sm" className="mt-2">
          {copy.description}
        </AppText>

        <View className="mt-5 gap-5">
          {role === "investor" ? (
            <View className="gap-3">
              <AppTextInput label="Company name" value={company} onChangeText={setCompany} placeholder="e.g. Orbit Ventures" />
              <AppTextInput
                label="Website"
                value={website}
                onChangeText={setWebsite}
                autoCapitalize="none"
                placeholder="https://..."
                error={website.trim() && !isValidUrl(website) ? "Enter a valid website URL" : undefined}
              />
            </View>
          ) : null}

          {role === "professional" || role === "advisor" ? (
            <ExperienceEditor experiences={experiences} onChange={setExperiences} />
          ) : null}

          {role === "professional" || role === "advisor" ? (
            <CertificationEditor certifications={certifications} onChange={setCertifications} />
          ) : null}

          {role === "service_provider" ? (
            <View className="gap-3">
              <AppTextInput label="Company name" value={spCompany} onChangeText={setSpCompany} />
              <AppTextInput
                label="Website"
                value={spWebsite}
                onChangeText={setSpWebsite}
                autoCapitalize="none"
                placeholder="https://..."
                error={spWebsite.trim() && !isValidUrl(spWebsite) ? "Enter a valid website URL" : undefined}
              />
              <AppTextInput
                label="Company LinkedIn"
                value={spLinkedin}
                onChangeText={setSpLinkedin}
                autoCapitalize="none"
                placeholder="https://linkedin.com/company/..."
                error={spLinkedin.trim() && !isValidLinkedInUrl(spLinkedin) ? "Enter a valid LinkedIn URL" : undefined}
              />
            </View>
          ) : null}
        </View>

        <AppButton label="Save" loading={isSaving} disabled={!canSubmit} onPress={() => void submit()} className="mb-8 mt-6" />
      </ScrollView>
    </AppScreen>
  );
};
