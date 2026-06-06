export type ProfessionalProfile = {
  skills: string[];
  experienceLevel: string;
  portfolio: string;
  resume: string;
  goals: string[];
};

export const PROFESSIONAL_QUICK_FIELDS = [
  { key: "fullName", label: "Name", required: true },
  { key: "headline", label: "Headline", required: true },
  { key: "skills", label: "Skills", required: true },
  { key: "experienceLevel", label: "Experience Level", required: true },
  { key: "location", label: "Location", required: true },
  { key: "linkedinUrl", label: "LinkedIn", required: true }
] as const;

export const emptyProfessionalProfile = (): ProfessionalProfile => ({
  skills: [],
  experienceLevel: "",
  portfolio: "",
  resume: "",
  goals: []
});
