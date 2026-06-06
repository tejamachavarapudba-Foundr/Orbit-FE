export type InvestorProfile = {
  fundName: string;
  investmentRange: string;
  industries: string[];
  portfolio: string;
  geography: string;
  goals: string[];
};

export const INVESTOR_QUICK_FIELDS = [
  { key: "fullName", label: "Name", required: true },
  { key: "fundName", label: "Fund Name", required: true, mapsTo: "company" },
  { key: "investmentRange", label: "Investment Range", required: true },
  { key: "industries", label: "Industries", required: true },
  { key: "location", label: "Location", required: true },
  { key: "linkedinUrl", label: "LinkedIn", required: true }
] as const;

export const emptyInvestorProfile = (): InvestorProfile => ({
  fundName: "",
  investmentRange: "",
  industries: [],
  portfolio: "",
  geography: "",
  goals: []
});
