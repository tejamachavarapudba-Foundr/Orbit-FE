import { View } from "react-native";

import { AppTextInput } from "@/components/ui/AppTextInput";
import { normalizeMemberRole } from "@/constants/memberRoles";
import { RoleProfileData } from "@/modules/profile/schemas";

type RoleProfileSectionProps = {
  role: string;
  roleProfile: RoleProfileData | null | undefined;
  onChange: (roleProfile: RoleProfileData) => void;
};

const toCsv = (values: string[]) => values.join(", ");
const fromCsv = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

export const RoleProfileSection = ({ role, roleProfile, onChange }: RoleProfileSectionProps) => {
  const memberRole = normalizeMemberRole(role);
  if (!memberRole || !roleProfile || roleProfile.role !== memberRole) {
    return null;
  }

  const setField = (key: string, value: string | string[]) => {
    onChange({
      role: roleProfile.role,
      data: { ...roleProfile.data, [key]: value }
    } as RoleProfileData);
  };

  if (memberRole === "founder" && roleProfile.role === "founder") {
    const data = roleProfile.data;
    return (
      <View className="gap-4">
        <AppTextInput label="Startup name" value={data.startupName} onChangeText={(v) => setField("startupName", v)} />
        <AppTextInput label="Stage" value={data.startupStage} onChangeText={(v) => setField("startupStage", v)} />
        <AppTextInput label="Industry" value={data.industry} onChangeText={(v) => setField("industry", v)} />
        <AppTextInput label="Pitch" value={data.pitch} multiline onChangeText={(v) => setField("pitch", v)} className="h-24 py-3" />
        <AppTextInput label="Funding needed" value={data.fundingNeeded} onChangeText={(v) => setField("fundingNeeded", v)} />
        <AppTextInput label="Team size" value={data.teamSize} onChangeText={(v) => setField("teamSize", v)} />
      </View>
    );
  }

  if (memberRole === "investor" && roleProfile.role === "investor") {
    const data = roleProfile.data;
    return (
      <View className="gap-4">
        <AppTextInput label="Fund name" value={data.fundName} onChangeText={(v) => setField("fundName", v)} />
        <AppTextInput label="Investment range" value={data.investmentRange} onChangeText={(v) => setField("investmentRange", v)} />
        <AppTextInput label="Industries" value={toCsv(data.industries)} onChangeText={(v) => setField("industries", fromCsv(v))} />
        <AppTextInput label="Portfolio" value={data.portfolio} onChangeText={(v) => setField("portfolio", v)} />
        <AppTextInput label="Geography" value={data.geography} onChangeText={(v) => setField("geography", v)} />
      </View>
    );
  }

  if (memberRole === "advisor" && roleProfile.role === "advisor") {
    const data = roleProfile.data;
    return (
      <View className="gap-4">
        <AppTextInput label="Expertise" value={toCsv(data.expertise)} onChangeText={(v) => setField("expertise", fromCsv(v))} />
        <AppTextInput label="Years experience" value={data.yearsExperience} onChangeText={(v) => setField("yearsExperience", v)} />
        <AppTextInput label="Industries" value={toCsv(data.industries)} onChangeText={(v) => setField("industries", fromCsv(v))} />
        <AppTextInput
          label="Mentorship areas"
          value={toCsv(data.mentorshipAreas)}
          onChangeText={(v) => setField("mentorshipAreas", fromCsv(v))}
        />
      </View>
    );
  }

  if (memberRole === "professional" && roleProfile.role === "professional") {
    const data = roleProfile.data;
    return (
      <View className="gap-4">
        <AppTextInput label="Skills" value={toCsv(data.skills)} onChangeText={(v) => setField("skills", fromCsv(v))} />
        <AppTextInput label="Experience level" value={data.experienceLevel} onChangeText={(v) => setField("experienceLevel", v)} />
        <AppTextInput label="Portfolio" value={data.portfolio} onChangeText={(v) => setField("portfolio", v)} />
        <AppTextInput label="Resume link" value={data.resume} onChangeText={(v) => setField("resume", v)} />
      </View>
    );
  }

  if (memberRole === "service_provider" && roleProfile.role === "service_provider") {
    const data = roleProfile.data;
    return (
      <View className="gap-4">
        <AppTextInput label="Company" value={data.company} onChangeText={(v) => setField("company", v)} />
        <AppTextInput label="Services" value={toCsv(data.services)} onChangeText={(v) => setField("services", fromCsv(v))} />
        <AppTextInput
          label="Client industries"
          value={toCsv(data.clientIndustries)}
          onChangeText={(v) => setField("clientIndustries", fromCsv(v))}
        />
      </View>
    );
  }

  return null;
};
