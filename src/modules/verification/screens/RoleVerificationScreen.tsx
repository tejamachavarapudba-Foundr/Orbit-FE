import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import * as DocumentPicker from "expo-document-picker";

import { AppButton } from "@/components/ui/AppButton";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { AppTextInput } from "@/components/ui/AppTextInput";
import { Card, CardContent } from "@/components/ui/Card";
import { Dropdown } from "@/components/ui/Dropdown";
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
import {
  Certification,
  emptyCertification,
  emptyWorkExperience,
  MONTH_OPTIONS,
  WorkExperience,
  YEAR_OPTIONS
} from "@/modules/profile/schemas/experience";
import { UpdateProfilePayload } from "@/modules/profile/types";
import { useToastStore } from "@/store/toastStore";
import { useVerificationStatus } from "@/modules/verification/hooks";
import { verificationApi } from "@/modules/verification/api";

type RoleVerificationRoute = RouteProp<MainStackParamList, "RoleVerification">;

const MonthYearPicker = ({
  label,
  value,
  onChange
}: {
  label: string;
  value: string; // "YYYY-MM"
  onChange: (value: string) => void;
}) => {
  const [year, month] = value.split("-");

  return (
    <View className="gap-2">
      <AppText size="sm" weight="medium">
        {label}
      </AppText>
      <View className="flex-row gap-2">
        <View className="flex-1">
          <Dropdown
            value={month ?? ""}
            options={MONTH_OPTIONS}
            placeholder="Month"
            onChange={(m) => onChange(`${year ?? ""}-${m}`)}
          />
        </View>
        <View className="flex-1">
          <Dropdown
            value={year ?? ""}
            options={YEAR_OPTIONS}
            placeholder="Year"
            onChange={(y) => onChange(`${y}-${month ?? ""}`)}
          />
        </View>
      </View>
    </View>
  );
};

const ExperienceEditor = ({
  experiences,
  onChange
}: {
  experiences: WorkExperience[];
  onChange: (experiences: WorkExperience[]) => void;
}) => {
  const colors = useThemeTokens();

  const updateEntry = (index: number, patch: Partial<WorkExperience>) => {
    onChange(experiences.map((entry, i) => (i === index ? { ...entry, ...patch } : entry)));
  };

  const removeEntry = (index: number) => {
    onChange(experiences.filter((_, i) => i !== index));
  };

  return (
    <View className="gap-3">
      <AppText size="sm" weight="medium">
        Work experience
      </AppText>

      {experiences.map((entry, index) => (
        <Card key={index}>
          <CardContent className="gap-3 p-4">
            <View className="flex-row items-center justify-between">
              <AppText size="sm" tone="muted">
                {index === 0 ? "Current / most recent" : `Experience ${index + 1}`}
              </AppText>
              <Pressable accessibilityRole="button" onPress={() => removeEntry(index)} hitSlop={8}>
                <Feather name="trash-2" size={iconSize.md} color={colors.muted} />
              </Pressable>
            </View>
            <AppTextInput
              label="Company name"
              value={entry.company}
              onChangeText={(v) => updateEntry(index, { company: v })}
            />
            <AppTextInput
              label="Designation"
              value={entry.designation}
              onChangeText={(v) => updateEntry(index, { designation: v })}
              placeholder="e.g. Senior Software Engineer"
            />
            <AppTextInput
              label="Location"
              value={entry.location}
              onChangeText={(v) => updateEntry(index, { location: v })}
            />
            <MonthYearPicker
              label="Start date"
              value={entry.startDate}
              onChange={(v) => updateEntry(index, { startDate: v })}
            />
            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: entry.isCurrent }}
              onPress={() => updateEntry(index, { isCurrent: !entry.isCurrent, endDate: "" })}
              className="flex-row items-center gap-2"
            >
              <Feather
                name={entry.isCurrent ? "check-square" : "square"}
                size={iconSize.md}
                color={entry.isCurrent ? colors.primary : colors.muted}
              />
              <AppText size="sm">I currently work here</AppText>
            </Pressable>
            {!entry.isCurrent ? (
              <MonthYearPicker
                label="End date"
                value={entry.endDate}
                onChange={(v) => updateEntry(index, { endDate: v })}
              />
            ) : null}
          </CardContent>
        </Card>
      ))}

      <AppButton
        label="+ Add experience"
        variant="outline"
        onPress={() => onChange([...experiences, emptyWorkExperience()])}
      />
    </View>
  );
};

const CertificationEditor = ({
  certifications,
  onChange
}: {
  certifications: Certification[];
  onChange: (certifications: Certification[]) => void;
}) => {
  const colors = useThemeTokens();
  const showToast = useToastStore((state) => state.show);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  const updateEntry = (index: number, patch: Partial<Certification>) => {
    onChange(certifications.map((entry, i) => (i === index ? { ...entry, ...patch } : entry)));
  };

  const removeEntry = (index: number) => {
    onChange(certifications.filter((_, i) => i !== index));
  };

  const uploadFile = async (index: number) => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["application/pdf", "image/*"],
      copyToCacheDirectory: true,
      multiple: false
    });

    const asset = result.assets?.[0];
    if (result.canceled || !asset) return;

    setUploadingIndex(index);
    try {
      const formData = new FormData();
      formData.append("type", "document");
      formData.append(
        "file",
        {
          uri: asset.uri,
          name: asset.name,
          type: asset.mimeType || "application/octet-stream"
        } as any
      );

      const upload = await verificationApi.uploadDocument(formData);
      updateEntry(index, { fileUrl: upload.url, fileKey: upload.path });
    } catch {
      showToast({ type: "error", title: "Upload failed" });
    } finally {
      setUploadingIndex(null);
    }
  };

  return (
    <View className="gap-3">
      <AppText size="sm" weight="medium">
        Certifications (optional)
      </AppText>

      {certifications.map((entry, index) => (
        <Card key={index}>
          <CardContent className="gap-3 p-4">
            <View className="flex-row items-center justify-between">
              <AppText size="sm" tone="muted">
                Certification {index + 1}
              </AppText>
              <Pressable accessibilityRole="button" onPress={() => removeEntry(index)} hitSlop={8}>
                <Feather name="trash-2" size={iconSize.md} color={colors.muted} />
              </Pressable>
            </View>
            <AppTextInput
              label="Certification name"
              value={entry.name}
              onChangeText={(v) => updateEntry(index, { name: v })}
              placeholder="e.g. AWS Certified Solutions Architect"
            />
            <Pressable
              accessibilityRole="button"
              onPress={() => void uploadFile(index)}
              className="flex-row items-center justify-between rounded-md border border-input bg-background px-3 py-3"
            >
              <AppText size="sm" tone={entry.fileUrl ? "default" : "muted"} numberOfLines={1} className="flex-1 pr-2">
                {uploadingIndex === index
                  ? "Uploading..."
                  : entry.fileUrl
                    ? "File attached — tap to replace"
                    : "Upload certificate file (PDF or image)"}
              </AppText>
              <Feather name="upload" size={iconSize.md} color={colors.muted} />
            </Pressable>
          </CardContent>
        </Card>
      ))}

      <AppButton
        label="+ Add certification"
        variant="outline"
        onPress={() => onChange([...certifications, emptyCertification()])}
      />
    </View>
  );
};

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
              />
              <AppTextInput
                label="Company LinkedIn"
                value={spLinkedin}
                onChangeText={setSpLinkedin}
                autoCapitalize="none"
                placeholder="https://linkedin.com/company/..."
              />
            </View>
          ) : null}
        </View>

        <AppButton label="Save" loading={isSaving} disabled={!canSubmit} onPress={() => void submit()} className="mb-8 mt-6" />
      </ScrollView>
    </AppScreen>
  );
};
