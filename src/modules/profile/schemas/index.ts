import { OnboardingMemberRole } from "@/constants/memberRoles";
import { AdvisorProfile, emptyAdvisorProfile } from "@/modules/profile/schemas/advisor";
import { emptyFounderProfile, FounderProfile } from "@/modules/profile/schemas/founder";
import { emptyInvestorProfile, InvestorProfile } from "@/modules/profile/schemas/investor";
import { emptyProfessionalProfile, ProfessionalProfile } from "@/modules/profile/schemas/professional";
import {
  emptyServiceProviderProfile,
  ServiceProviderProfile
} from "@/modules/profile/schemas/serviceProvider";

export type RoleProfileData =
  | { role: "founder"; data: FounderProfile }
  | { role: "investor"; data: InvestorProfile }
  | { role: "advisor"; data: AdvisorProfile }
  | { role: "professional"; data: ProfessionalProfile }
  | { role: "service_provider"; data: ServiceProviderProfile };

export type RoleProfileMap = {
  founder: FounderProfile;
  investor: InvestorProfile;
  advisor: AdvisorProfile;
  professional: ProfessionalProfile;
  service_provider: ServiceProviderProfile;
};

export const emptyRoleProfile = (role: OnboardingMemberRole): RoleProfileMap[OnboardingMemberRole] => {
  switch (role) {
    case "founder":
      return emptyFounderProfile();
    case "investor":
      return emptyInvestorProfile();
    case "advisor":
      return emptyAdvisorProfile();
    case "professional":
      return emptyProfessionalProfile();
    case "service_provider":
      return emptyServiceProviderProfile();
  }
};

export const toRoleProfileData = (role: OnboardingMemberRole, data: RoleProfileMap[OnboardingMemberRole]): RoleProfileData => ({
  role,
  data
}) as RoleProfileData;

export * from "@/modules/profile/schemas/founder";
export * from "@/modules/profile/schemas/investor";
export * from "@/modules/profile/schemas/advisor";
export * from "@/modules/profile/schemas/professional";
export * from "@/modules/profile/schemas/serviceProvider";
