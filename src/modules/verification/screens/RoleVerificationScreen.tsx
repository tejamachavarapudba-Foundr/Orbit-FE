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
import { UpdateProfilePayload } from "@/modules/profile/types";
import { useToastStore } from "@/store/toastStore";
import { useVerificationStatus } from "@/modules/verification/hooks";

type RoleVerificationRoute = RouteProp<MainStackParamList, "RoleVerification">;

const toCsv = (values: string[]) => values.join(", ");
const fromCsv = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

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
  const [experienceLevel, setExperienceLevel] = useState(
    role === "professional" ? ((roleData as { experienceLevel?: string })?.experienceLevel ?? "") : ""
  );
  const [yearsExperience, setYearsExperience] = useState(
    role === "advisor" ? ((roleData as { yearsExperience?: string })?.yearsExperience ?? "") : ""
  );
  const [certifications, setCertifications] = useState(
    toCsv(((roleData as { certifications?: string[] })?.certifications ?? []) as string[])
  );
  const [spCompany, setSpCompany] = useState((roleData as { company?: string })?.company ?? "");
  const [spWebsite, setSpWebsite] = useState((roleData as { website?: string })?.website ?? "");
  const [spLinkedin, setSpLinkedin] = useState((roleData as { companyLinkedinUrl?: string })?.companyLinkedinUrl ?? "");

  const copy = {
    investor: {
      title: "Investor verification",
      description: "Add your company name and website — this unlocks investor snapshots on startups."
    },
    professional: {
      title: "Professional verification",
      description: "Add your experience and any certifications — this boosts how your profile appears to others. Certifications are optional."
    },
    advisor: {
      title: "Advisor verification",
      description: "Add your experience and any certifications — this boosts how your profile appears to others. Certifications are optional."
    },
    service_provider: {
      title: "Service provider verification",
      description: "Add your company name, website and LinkedIn page."
    }
  }[role];

  const canSubmit =
    role === "investor"
      ? Boolean(company.trim() && website.trim())
      : role === "professional"
        ? Boolean(experienceLevel.trim())
        : role === "advisor"
          ? Boolean(yearsExperience.trim())
          : Boolean(spCompany.trim() && spWebsite.trim() && spLinkedin.trim());

  const submit = async () => {
    if (!normalized) return;

    const basePayload: UpdateProfilePayload = {
      fullName: normalized.fullName,
      headline: normalized.headline,
      bio: normalized.bio,
      role: normalized.role,
      location: normalized.location,
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
                experienceLevel: experienceLevel.trim(),
                certifications: fromCsv(certifications)
              }
            }
          : role === "advisor"
            ? {
                role,
                data: {
                  ...emptyAdvisorProfile(),
                  ...((roleData as object) ?? {}),
                  yearsExperience: yearsExperience.trim(),
                  certifications: fromCsv(certifications)
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

        <View className="mt-5 gap-3">
          {role === "investor" ? (
            <>
              <AppTextInput label="Company name" value={company} onChangeText={setCompany} placeholder="e.g. Orbit Ventures" />
              <AppTextInput
                label="Website"
                value={website}
                onChangeText={setWebsite}
                autoCapitalize="none"
                placeholder="https://..."
              />
            </>
          ) : null}

          {role === "professional" ? (
            <AppTextInput
              label="Experience details"
              value={experienceLevel}
              onChangeText={setExperienceLevel}
              placeholder="e.g. 5 years as a full-stack engineer"
              multiline
            />
          ) : null}

          {role === "advisor" ? (
            <AppTextInput
              label="Experience details"
              value={yearsExperience}
              onChangeText={setYearsExperience}
              placeholder="e.g. 10 years advising early-stage startups"
              multiline
            />
          ) : null}

          {role === "professional" || role === "advisor" ? (
            <AppTextInput
              label="Certifications (optional)"
              value={certifications}
              onChangeText={setCertifications}
              placeholder="Comma-separated, e.g. PMP, AWS Certified"
              multiline
            />
          ) : null}

          {role === "service_provider" ? (
            <>
              <AppTextInput label="Company name" value={spCompany} onChangeText={setSpCompany} />
              <AppTextInput
                label="Website"
                value={spWebsite}
                onChangeText={setSpWebsite}
                autoCapitalize="none"
                placeholder="https://..."
              />
              <AppTextInput
                label="Company LinkedIn"
                value={spLinkedin}
                onChangeText={setSpLinkedin}
                autoCapitalize="none"
                placeholder="https://linkedin.com/company/..."
              />
            </>
          ) : null}
        </View>

        <AppButton label="Save" loading={isSaving} disabled={!canSubmit} onPress={() => void submit()} className="mt-6" />
      </ScrollView>
    </AppScreen>
  );
};
