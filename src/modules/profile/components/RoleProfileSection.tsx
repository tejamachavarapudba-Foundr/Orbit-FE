import { View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { AppTextInput } from "@/components/ui/AppTextInput";
import { BottomSheetMultiSelect } from "@/components/ui/BottomSheetMultiSelect";
import { BottomSheetPicker } from "@/components/ui/BottomSheetPicker";
import { ExperiencePeriodsEditor } from "@/components/ui/ExperiencePeriodsEditor";
import { PortfolioNamesBottomSheet } from "@/components/ui/PortfolioNamesBottomSheet";
import { normalizeMemberRole } from "@/constants/memberRoles";
import { RoleProfileData } from "@/modules/profile/schemas";
import {
  EXPERTISE_OPTIONS,
  INDUSTRY_EXPERIENCE_OPTIONS,
  MENTORSHIP_AREAS_OPTIONS,
  MENTORSHIP_EXPERIENCE_OPTIONS,
  PROFESSIONAL_EXPERIENCE_OPTIONS
} from "@/modules/profile/schemas/advisor";
import {
  CURRENT_ROLE_OPTIONS,
  FOUNDER_INDUSTRY_OPTIONS,
  FOUNDER_STATUS_OPTIONS,
  STARTUP_STAGE_OPTIONS
} from "@/modules/profile/schemas/founder";
import { calculateTotalExperienceLabel, ExperiencePeriod } from "@/modules/profile/schemas/experience";
import { ENGINEER_SPECIALIZATIONS } from "@/modules/profile/schemas/professional";
import {
  CLIENT_INDUSTRIES_OPTIONS,
  SERVICES_OFFERED_OPTIONS
} from "@/modules/profile/schemas/serviceProvider";
import {
  INDUSTRY_OPTIONS,
  INVESTING_AS_OPTIONS,
  INVESTMENT_EXPERIENCE_OPTIONS,
  INVESTMENT_GEOGRAPHY_OPTIONS,
  INVESTMENT_RANGE_OPTIONS,
  INVESTMENT_STAGE_OPTIONS,
  INVESTOR_TYPE_OPTIONS
} from "@/modules/profile/schemas/investor";

type RoleProfileSectionProps = {
  role: string;
  roleProfile: RoleProfileData | null | undefined;
  onChange: (roleProfile: RoleProfileData) => void;
};

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
        {/* "Startup name" removed — duplicated the "Company / startup" field
            already on the main profile form, which is the field this
            actually saves to during onboarding (see FOUNDER_QUICK_FIELDS'
            mapsTo: "company"). Editing here never fed back into it, so the
            two could silently drift out of sync. */}
        <View className="gap-2">
          <AppText size="sm" weight="medium" tone="muted">
            Founder status
          </AppText>
          <BottomSheetPicker
            value={data.founderStatus}
            options={FOUNDER_STATUS_OPTIONS}
            onChange={(v) => setField("founderStatus", v)}
            placeholder="Select founder status"
            title="Founder status"
          />
        </View>
        <View className="gap-2">
          <AppText size="sm" weight="medium" tone="muted">
            Current role
          </AppText>
          <BottomSheetPicker
            value={data.currentRole}
            options={CURRENT_ROLE_OPTIONS}
            onChange={(v) => setField("currentRole", v)}
            placeholder="Select current role"
            title="Current role"
          />
        </View>
        <View className="gap-2">
          <AppText size="sm" weight="medium" tone="muted">
            Startup stage
          </AppText>
          <BottomSheetPicker
            value={data.startupStage}
            options={STARTUP_STAGE_OPTIONS}
            onChange={(v) => setField("startupStage", v)}
            placeholder="Select startup stage"
            title="Startup stage"
          />
        </View>
        <View className="gap-2">
          <AppText size="sm" weight="medium" tone="muted">
            Industry (select up to 5)
          </AppText>
          <BottomSheetMultiSelect
            value={data.industry}
            options={FOUNDER_INDUSTRY_OPTIONS}
            onChange={(v) => setField("industry", v)}
            placeholder="Select industry"
            title="Industry"
            max={5}
          />
        </View>
        <AppTextInput
          label="Team size"
          value={data.teamSize}
          keyboardType="numeric"
          onChangeText={(v) => setField("teamSize", v)}
        />
        <View className="gap-2">
          <AppText size="sm" weight="medium" tone="muted">
            Portfolio
          </AppText>
          <PortfolioNamesBottomSheet value={data.portfolio} onChange={(v) => setField("portfolio", v)} />
        </View>
      </View>
    );
  }

  if (memberRole === "investor" && roleProfile.role === "investor") {
    const data = roleProfile.data;
    return (
      <View className="gap-4">
        <AppTextInput label="Company name" value={data.fundName} onChangeText={(v) => setField("fundName", v)} />
        <View className="gap-2">
          <AppText size="sm" weight="medium" tone="muted">
            Investing as
          </AppText>
          <BottomSheetPicker
            value={data.investingAs}
            options={INVESTING_AS_OPTIONS}
            onChange={(v) => setField("investingAs", v)}
            placeholder="Select investing as"
            title="Investing as"
          />
        </View>
        <View className="gap-2">
          <AppText size="sm" weight="medium" tone="muted">
            Investor type
          </AppText>
          <BottomSheetPicker
            value={data.investorType}
            options={INVESTOR_TYPE_OPTIONS}
            onChange={(v) => setField("investorType", v)}
            placeholder="Select investor type"
            title="Investor type"
          />
        </View>
        <View className="gap-2">
          <AppText size="sm" weight="medium" tone="muted">
            Investment range
          </AppText>
          <BottomSheetPicker
            value={data.investmentRange}
            options={INVESTMENT_RANGE_OPTIONS}
            onChange={(v) => setField("investmentRange", v)}
            placeholder="Select investment range"
            title="Investment range"
          />
        </View>
        <View className="gap-2">
          <AppText size="sm" weight="medium" tone="muted">
            Investment stage
          </AppText>
          <BottomSheetMultiSelect
            value={data.investmentStage}
            options={INVESTMENT_STAGE_OPTIONS}
            onChange={(v) => setField("investmentStage", v)}
            placeholder="Select investment stage"
            title="Investment stage"
          />
        </View>
        <View className="gap-2">
          <AppText size="sm" weight="medium" tone="muted">
            Investment geography
          </AppText>
          <BottomSheetPicker
            value={data.geography}
            options={INVESTMENT_GEOGRAPHY_OPTIONS}
            onChange={(v) => setField("geography", v)}
            placeholder="Select geography"
            title="Investment geography"
          />
        </View>
        <View className="gap-2">
          <AppText size="sm" weight="medium" tone="muted">
            Investment experience
          </AppText>
          <BottomSheetPicker
            value={data.yearsInvestingExperience}
            options={INVESTMENT_EXPERIENCE_OPTIONS}
            onChange={(v) => setField("yearsInvestingExperience", v)}
            placeholder="Select investment experience"
            title="Investment experience"
          />
        </View>
        <View className="gap-2">
          <AppText size="sm" weight="medium" tone="muted">
            Industry (select up to 5)
          </AppText>
          <BottomSheetMultiSelect
            value={data.industries}
            options={INDUSTRY_OPTIONS}
            onChange={(v) => setField("industries", v)}
            placeholder="Select industries"
            title="Industry"
            max={5}
          />
        </View>
        <View className="gap-2">
          <AppText size="sm" weight="medium" tone="muted">
            Portfolio
          </AppText>
          <PortfolioNamesBottomSheet value={data.portfolio} onChange={(v) => setField("portfolio", v)} />
        </View>
      </View>
    );
  }

  if (memberRole === "advisor" && roleProfile.role === "advisor") {
    const data = roleProfile.data;
    return (
      <View className="gap-4">
        <View className="gap-2">
          <AppText size="sm" weight="medium" tone="muted">
            Expertise (select up to 5)
          </AppText>
          <BottomSheetMultiSelect
            value={data.expertise}
            options={EXPERTISE_OPTIONS}
            onChange={(v) => setField("expertise", v)}
            placeholder="Select expertise"
            title="Expertise"
            max={5}
          />
          {data.expertise.includes("other") ? (
            <AppTextInput
              placeholder="Describe your expertise"
              value={data.expertiseOther}
              onChangeText={(v) => setField("expertiseOther", v)}
            />
          ) : null}
        </View>
        <View className="gap-2">
          <AppText size="sm" weight="medium" tone="muted">
            Professional experience
          </AppText>
          <BottomSheetPicker
            value={data.yearsExperience}
            options={PROFESSIONAL_EXPERIENCE_OPTIONS}
            onChange={(v) => setField("yearsExperience", v)}
            placeholder="Select professional experience"
            title="Professional experience"
          />
        </View>
        <View className="gap-2">
          <AppText size="sm" weight="medium" tone="muted">
            Mentorship experience
          </AppText>
          <BottomSheetPicker
            value={data.mentorshipExperience}
            options={MENTORSHIP_EXPERIENCE_OPTIONS}
            onChange={(v) => setField("mentorshipExperience", v)}
            placeholder="Select mentorship experience"
            title="Mentorship experience"
          />
        </View>
        <View className="gap-2">
          <AppText size="sm" weight="medium" tone="muted">
            Industry experience (select up to 5)
          </AppText>
          <BottomSheetMultiSelect
            value={data.industries}
            options={INDUSTRY_EXPERIENCE_OPTIONS}
            onChange={(v) => setField("industries", v)}
            placeholder="Select industry experience"
            title="Industry experience"
            max={5}
          />
        </View>
        <View className="gap-2">
          <AppText size="sm" weight="medium" tone="muted">
            Mentorship areas (select up to 5)
          </AppText>
          <BottomSheetMultiSelect
            value={data.mentorshipAreas}
            options={MENTORSHIP_AREAS_OPTIONS}
            onChange={(v) => setField("mentorshipAreas", v)}
            placeholder="Select mentorship areas"
            title="Mentorship areas"
            max={5}
          />
        </View>
      </View>
    );
  }

  if (memberRole === "professional" && roleProfile.role === "professional") {
    const data = roleProfile.data;
    const setExperiencePeriods = (periods: ExperiencePeriod[]) =>
      onChange({
        role: roleProfile.role,
        data: { ...data, experiencePeriods: periods, experienceLevel: calculateTotalExperienceLabel(periods) }
      });

    return (
      <View className="gap-4">
        <View className="gap-2">
          <AppText size="sm" weight="medium" tone="muted">
            Engineer specialization
          </AppText>
          <BottomSheetPicker
            value={data.specialization}
            options={ENGINEER_SPECIALIZATIONS}
            onChange={(v) => setField("specialization", v)}
            placeholder="Select specialization"
            title="Engineer specialization"
          />
          {data.specialization === "other" ? (
            <AppTextInput
              placeholder="Describe your specialization"
              value={data.specializationOther}
              onChangeText={(v) => setField("specializationOther", v)}
            />
          ) : null}
        </View>
        {/* "Skills" removed — duplicated the shared "Skills" field on the
            main profile form, which is the field this actually saves to
            (see PROFESSIONAL_QUICK_FIELDS' mapsTo: "skills"). Editing here
            never fed back into it, so the two showed as two separate inputs. */}
        <View className="gap-2">
          <AppText size="sm" weight="medium" tone="muted">
            Experience
          </AppText>
          <ExperiencePeriodsEditor periods={data.experiencePeriods} onChange={setExperiencePeriods} />
        </View>
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
        <View className="gap-2">
          <AppText size="sm" weight="medium" tone="muted">
            Services offered (select up to 5)
          </AppText>
          <BottomSheetMultiSelect
            value={data.services}
            options={SERVICES_OFFERED_OPTIONS}
            onChange={(v) => setField("services", v)}
            placeholder="Select services offered"
            title="Services offered"
            max={5}
          />
          {data.services.includes("other") ? (
            <AppTextInput
              placeholder="Describe the services you offer"
              value={data.servicesOther}
              onChangeText={(v) => setField("servicesOther", v)}
            />
          ) : null}
        </View>
        <View className="gap-2">
          <AppText size="sm" weight="medium" tone="muted">
            Client industries (select up to 5)
          </AppText>
          <BottomSheetMultiSelect
            value={data.clientIndustries}
            options={CLIENT_INDUSTRIES_OPTIONS}
            onChange={(v) => setField("clientIndustries", v)}
            placeholder="Select client industries"
            title="Client industries"
            max={5}
          />
        </View>
      </View>
    );
  }

  return null;
};
