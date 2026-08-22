export type ServiceProviderProfile = {
  company: string;
  services: string[];
  website: string;
  companyLinkedinUrl: string;
  clientIndustries: string[];
  goals: string[];
};

export const SERVICE_PROVIDER_QUICK_FIELDS = [
  { key: "fullName", label: "Name", required: true },
  { key: "company", label: "Company", required: true },
  { key: "services", label: "Services Offered", required: true },
  { key: "location", label: "Location", required: true },
  { key: "website", label: "Website", required: true },
  { key: "linkedinUrl", label: "LinkedIn", required: true }
] as const;

export const emptyServiceProviderProfile = (): ServiceProviderProfile => ({
  company: "",
  services: [],
  website: "",
  companyLinkedinUrl: "",
  clientIndustries: [],
  goals: []
});
