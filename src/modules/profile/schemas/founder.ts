export type FounderProfile = {
  startupName: string;
  startupStage: string;
  industry: string;
  pitch: string;
  fundingNeeded: string;
  teamSize: string;
  website: string;
  goals: string[];
};

export const FOUNDER_QUICK_FIELDS = [
  { key: "fullName", label: "Name", required: true },
  { key: "headline", label: "Headline", required: true },
  { key: "startupName", label: "Startup Name", required: true, mapsTo: "company" },
  { key: "industry", label: "Industry", required: true },
  { key: "startupStage", label: "Stage", required: true },
  { key: "location", label: "Location", required: true },
  { key: "linkedinUrl", label: "LinkedIn", required: true }
] as const;

export const emptyFounderProfile = (): FounderProfile => ({
  startupName: "",
  startupStage: "",
  industry: "",
  pitch: "",
  fundingNeeded: "",
  teamSize: "",
  website: "",
  goals: []
});
