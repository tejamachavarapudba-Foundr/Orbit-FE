import { ReactNode, useEffect, useState } from "react";
import { Linking, Pressable, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { AppText } from "@/components/ui/AppText";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { ROLE_LABEL, normalizeMemberRole } from "@/constants/memberRoles";
import { AuthProfile } from "@/modules/auth/types";
import {
  Certification,
  formatExperienceTimeline,
  isValidWorkExperience,
  toAbsoluteMonth,
  WorkExperience
} from "@/modules/profile/schemas/experience";
import {
  CURRENT_ROLE_OPTIONS,
  FOUNDER_INDUSTRY_OPTIONS,
  FOUNDER_STATUS_OPTIONS,
  STARTUP_STAGE_OPTIONS
} from "@/modules/profile/schemas/founder";
import { INDUSTRY_OPTIONS, INVESTMENT_RANGE_OPTIONS } from "@/modules/profile/schemas/investor";
import {
  EXPERTISE_OPTIONS,
  INDUSTRY_EXPERIENCE_OPTIONS,
  MENTORSHIP_AREAS_OPTIONS
} from "@/modules/profile/schemas/advisor";
import { CLIENT_INDUSTRIES_OPTIONS, SERVICES_OFFERED_OPTIONS } from "@/modules/profile/schemas/serviceProvider";
import { verificationApi } from "@/modules/verification/api";
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

type Option = { readonly label: string; readonly value: string };

// Every picker field stores its underscored option value (e.g. "11_15"),
// not the human label ("11–15 years") — these map back to the label for
// display, falling back to the raw value only for legacy/unmatched data.
const mapToLabel = (value: string, options: readonly Option[]): string =>
  options.find((o) => o.value === value)?.label ?? value;

const mapToLabels = (
  values: string[] | undefined,
  options: readonly Option[],
  otherValue?: string,
  otherText?: string
): string =>
  toCsv(
    (values ?? []).map((v) =>
      otherValue && v === otherValue && otherText?.trim() ? otherText.trim() : mapToLabel(v, options)
    )
  );

const ExperienceList = ({ experiences }: { experiences: WorkExperience[] | undefined }) => {
  // Only well-formed entries (company, designation, and a resolvable date
  // range) show up publicly — an incomplete draft entry shouldn't appear
  // on the profile just because it exists in the underlying data. Sorted
  // most-recent-first regardless of the order they were entered in —
  // current role(s) first, then by start date descending.
  const items = (experiences ?? [])
    .filter(isValidWorkExperience)
    .sort((a, b) => {
      if (a.isCurrent !== b.isCurrent) return a.isCurrent ? -1 : 1;
      return (toAbsoluteMonth(b.startDate) ?? 0) - (toAbsoluteMonth(a.startDate) ?? 0);
    });
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

// Certifications get a visually distinct, highlighted card when the role is
// verified — the whole point is to be easy to spot against an unverified
// profile at a glance, not just another plain list row.
const CertificationList = ({ certifications, isVerified }: { certifications: Certification[] | undefined; isVerified: boolean }) => {
  const colors = useThemeTokens();
  // A named-but-fileless entry has nothing to actually verify — it never
  // counts toward what's shown here, so an empty/all-fileless list never
  // renders a "Verified — Certifications" card with nothing underneath it.
  const items = (certifications ?? []).filter((entry) => entry.name.trim() && entry.fileUrl);
  if (!items.length) {
    return null;
  }

  return (
    <View
      className={`gap-2 rounded-md p-3 ${isVerified ? "border border-primary/40 bg-primary/5" : "py-3"}`}
    >
      <View className="flex-row items-center gap-1.5">
        {isVerified ? <Feather name="shield" size={iconSize.sm} color={colors.primary} /> : null}
        <AppText tone={isVerified ? "primary" : "muted"} weight={isVerified ? "semibold" : "medium"} size="sm">
          {isVerified ? "Verified — Certifications" : "Certifications"}
        </AppText>
      </View>
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

const VerifiedRoleBadge = () => {
  const colors = useThemeTokens();
  return (
    <View className="flex-row items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5">
      <Feather name="check-circle" size={12} color={colors.primary} />
      <AppText tone="primary" size="xs" weight="semibold">
        Verified
      </AppText>
    </View>
  );
};

export const UserRoleDetails = ({ profile }: UserRoleDetailsProps) => {
  const memberRole = normalizeMemberRole(profile.role);
  const roleProfile = profile.roleProfile;

  const [isRoleVerified, setIsRoleVerified] = useState(false);

  useEffect(() => {
    if (!profile.id || !memberRole || memberRole === "founder") return;
    let cancelled = false;
    void verificationApi
      .getPublicStatus(profile.id)
      .then((status) => {
        if (cancelled) return;
        const verified =
          memberRole === "investor"
            ? status.investorVerified
            : memberRole === "professional"
              ? status.professionalVerified
              : memberRole === "advisor"
                ? status.advisorVerified
                : memberRole === "service_provider"
                  ? status.serviceProviderVerified
                  : false;
        setIsRoleVerified(verified);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [profile.id, memberRole]);

  if (!memberRole || !roleProfile || roleProfile.role !== memberRole) {
    return null;
  }

  const title = `${ROLE_LABEL[memberRole]} details`;

  if (memberRole === "founder" && roleProfile.role === "founder") {
    const data = roleProfile.data;
    const company = data.startupName || profile.company;
    const statusLabel = FOUNDER_STATUS_OPTIONS.find((option) => option.value === data.founderStatus)?.label;
    // Current Role's own label is the full form ("CEO - Chief Executive
    // Officer") for clarity in the picker — too long for this one-line
    // headline, so just the abbreviation before the dash is used here.
    const roleLabel = CURRENT_ROLE_OPTIONS.find((option) => option.value === data.currentRole)?.label.split(" - ")[0];
    const roleLine = [statusLabel, roleLabel].filter(Boolean).join(" & ");
    const displayLine = roleLine && company ? `${roleLine} at ${company}` : roleLine;

    return (
      <ProfileSection title={title}>
        {displayLine ? (
          <AppText weight="semibold" className="pb-2">
            {displayLine}
          </AppText>
        ) : null}
        <DetailRow label="Startup" value={company} />
        <DetailRow label="Stage" value={mapToLabel(data.startupStage, STARTUP_STAGE_OPTIONS)} />
        <DetailRow label="Industry" value={mapToLabels(data.industry, FOUNDER_INDUSTRY_OPTIONS)} />
        <DetailRow label="Team size" value={data.teamSize} />
        <DetailRow label="Portfolio" value={toCsv(data.portfolio)} />
      </ProfileSection>
    );
  }

  if (memberRole === "investor" && roleProfile.role === "investor") {
    const data = roleProfile.data;
    return (
      <ProfileSection title={title} isVerified={isRoleVerified}>
        <DetailRow label="Company" value={data.fundName || profile.company} />
        <DetailRow label="Investment range" value={mapToLabel(data.investmentRange, INVESTMENT_RANGE_OPTIONS)} />
        <DetailRow label="Industries" value={mapToLabels(data.industries, INDUSTRY_OPTIONS)} />
        <DetailRow label="Portfolio" value={toCsv(data.portfolio)} />
      </ProfileSection>
    );
  }

  if (memberRole === "advisor" && roleProfile.role === "advisor") {
    const data = roleProfile.data;
    return (
      <View className="gap-4">
        <ProfileSection title={title}>
          <DetailRow label="Expertise" value={mapToLabels(data.expertise, EXPERTISE_OPTIONS, "other", data.expertiseOther)} />
          <DetailRow label="Industries" value={mapToLabels(data.industries, INDUSTRY_EXPERIENCE_OPTIONS)} />
          <DetailRow label="Mentorship" value={mapToLabels(data.mentorshipAreas, MENTORSHIP_AREAS_OPTIONS)} />
        </ProfileSection>
        <ProfileSection title="Experience" isVerified={isRoleVerified}>
          <DetailRow label="Total experience" value={data.yearsExperience} />
          <ExperienceList experiences={data.experiences} />
          <CertificationList certifications={data.certifications} isVerified={isRoleVerified} />
        </ProfileSection>
      </View>
    );
  }

  if (memberRole === "professional" && roleProfile.role === "professional") {
    const data = roleProfile.data;
    return (
      <ProfileSection title={title} isVerified={isRoleVerified}>
        <DetailRow label="Skills" value={toCsv(data.skills.length ? data.skills : profile.skills)} />
        <DetailRow label="Experience" value={data.experienceLevel} />
        <DetailRow label="Portfolio" value={data.portfolio} />
        <ExperienceList experiences={data.experiences} />
        <CertificationList certifications={data.certifications} isVerified={isRoleVerified} />
      </ProfileSection>
    );
  }

  if (memberRole === "service_provider" && roleProfile.role === "service_provider") {
    const data = roleProfile.data;
    return (
      <ProfileSection title={title} isVerified={isRoleVerified}>
        <DetailRow label="Company" value={data.company || profile.company} />
        <DetailRow label="Services" value={mapToLabels(data.services, SERVICES_OFFERED_OPTIONS, "other", data.servicesOther)} />
        <DetailRow label="Client industries" value={mapToLabels(data.clientIndustries, CLIENT_INDUSTRIES_OPTIONS)} />
      </ProfileSection>
    );
  }

  return null;
};

const ProfileSection = ({ title, isVerified, children }: { title: string; isVerified?: boolean; children: ReactNode }) => (
  <View className="rounded-md border border-border bg-surface p-4">
    <View className="flex-row items-center gap-2">
      <AppText weight="bold">{title}</AppText>
      {isVerified ? <VerifiedRoleBadge /> : null}
    </View>
    <View className="mt-2">{children}</View>
  </View>
);
