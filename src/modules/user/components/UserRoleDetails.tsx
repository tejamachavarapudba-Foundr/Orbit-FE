import { ReactNode } from "react";
import { Linking, Pressable, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { AppText } from "@/components/ui/AppText";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { ROLE_LABEL, normalizeMemberRole } from "@/constants/memberRoles";
import { AuthProfile } from "@/modules/auth/types";
import { Certification, formatExperienceTimeline, WorkExperience } from "@/modules/profile/schemas/experience";
import { iconSize } from "@/theme/designTokens";

type UserRoleDetailsProps = {
  profile: AuthProfile;
};

const DetailRow = ({ label, value }: { label: string; value: string }) => {
  if (!value.trim()) {
    return null;
  }

  return (
    <View className="flex-row justify-between gap-4 border-b border-border py-3">
      <AppText tone="muted" size="sm">
        {label}
      </AppText>
      <AppText size="sm" className="flex-1 text-right">
        {value}
      </AppText>
    </View>
  );
};

const toCsv = (values: string[] | undefined) => (values?.length ? values.join(", ") : "");

const ExperienceList = ({ experiences }: { experiences: WorkExperience[] | undefined }) => {
  const items = (experiences ?? []).filter((entry) => entry.company.trim() || entry.designation.trim());
  if (!items.length) {
    return null;
  }

  return (
    <View className="gap-3 border-b border-border py-3">
      <AppText tone="muted" size="sm">
        Experience
      </AppText>
      {items.map((entry, index) => (
        <View key={index}>
          <AppText weight="semibold" size="sm">
            {entry.designation || "—"} {entry.company ? `at ${entry.company}` : ""}
          </AppText>
          <AppText tone="muted" size="xs" className="mt-0.5">
            {[formatExperienceTimeline(entry), entry.location].filter(Boolean).join(" · ")}
          </AppText>
        </View>
      ))}
    </View>
  );
};

const CertificationList = ({ certifications }: { certifications: Certification[] | undefined }) => {
  const colors = useThemeTokens();
  const items = (certifications ?? []).filter((entry) => entry.name.trim());
  if (!items.length) {
    return null;
  }

  return (
    <View className="gap-2 py-3">
      <AppText tone="muted" size="sm">
        Certifications
      </AppText>
      {items.map((entry, index) => (
        <Pressable
          key={index}
          accessibilityRole="button"
          disabled={!entry.fileUrl}
          onPress={() => (entry.fileUrl ? Linking.openURL(entry.fileUrl) : undefined)}
          className="flex-row items-center gap-2"
        >
          <Feather name="award" size={iconSize.sm} color={colors.primary} />
          <AppText size="sm" tone={entry.fileUrl ? "primary" : "default"} className="flex-1">
            {entry.name}
          </AppText>
        </Pressable>
      ))}
    </View>
  );
};

export const UserRoleDetails = ({ profile }: UserRoleDetailsProps) => {
  const memberRole = normalizeMemberRole(profile.role);
  const roleProfile = profile.roleProfile;

  if (!memberRole || !roleProfile || roleProfile.role !== memberRole) {
    return null;
  }

  const title = `${ROLE_LABEL[memberRole]} details`;

  if (memberRole === "founder" && roleProfile.role === "founder") {
    const data = roleProfile.data;
    return (
      <ProfileSection title={title}>
        <DetailRow label="Startup" value={data.startupName || profile.company} />
        <DetailRow label="Stage" value={data.startupStage} />
        <DetailRow label="Industry" value={data.industry} />
        <DetailRow label="Funding" value={data.fundingNeeded} />
        <DetailRow label="Team size" value={data.teamSize} />
      </ProfileSection>
    );
  }

  if (memberRole === "investor" && roleProfile.role === "investor") {
    const data = roleProfile.data;
    return (
      <ProfileSection title={title}>
        <DetailRow label="Fund" value={data.fundName || profile.company} />
        <DetailRow label="Investment range" value={data.investmentRange} />
        <DetailRow label="Industries" value={toCsv(data.industries)} />
        <DetailRow label="Portfolio" value={data.portfolio} />
        <DetailRow label="Geography" value={data.geography} />
      </ProfileSection>
    );
  }

  if (memberRole === "advisor" && roleProfile.role === "advisor") {
    const data = roleProfile.data;
    return (
      <ProfileSection title={title}>
        <DetailRow label="Expertise" value={toCsv(data.expertise)} />
        <DetailRow label="Experience" value={data.yearsExperience} />
        <DetailRow label="Industries" value={toCsv(data.industries)} />
        <DetailRow label="Mentorship" value={toCsv(data.mentorshipAreas)} />
        <ExperienceList experiences={data.experiences} />
        <CertificationList certifications={data.certifications} />
      </ProfileSection>
    );
  }

  if (memberRole === "professional" && roleProfile.role === "professional") {
    const data = roleProfile.data;
    return (
      <ProfileSection title={title}>
        <DetailRow label="Skills" value={toCsv(data.skills.length ? data.skills : profile.skills)} />
        <DetailRow label="Level" value={data.experienceLevel} />
        <DetailRow label="Portfolio" value={data.portfolio} />
        <ExperienceList experiences={data.experiences} />
        <CertificationList certifications={data.certifications} />
      </ProfileSection>
    );
  }

  if (memberRole === "service_provider" && roleProfile.role === "service_provider") {
    const data = roleProfile.data;
    return (
      <ProfileSection title={title}>
        <DetailRow label="Company" value={data.company || profile.company} />
        <DetailRow label="Services" value={toCsv(data.services)} />
        <DetailRow label="Client industries" value={toCsv(data.clientIndustries)} />
      </ProfileSection>
    );
  }

  return null;
};

const ProfileSection = ({ title, children }: { title: string; children: ReactNode }) => (
  <View className="rounded-md border border-border bg-surface p-4">
    <AppText weight="bold">{title}</AppText>
    <View className="mt-2">{children}</View>
  </View>
);
