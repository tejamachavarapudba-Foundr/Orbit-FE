import { ReactNode } from "react";
import { View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { ROLE_LABEL, normalizeMemberRole } from "@/constants/memberRoles";
import { AuthProfile } from "@/modules/auth/types";

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
