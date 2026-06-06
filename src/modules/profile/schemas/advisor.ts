export type AdvisorProfile = {
  expertise: string[];
  yearsExperience: string;
  industries: string[];
  mentorshipAreas: string[];
  goals: string[];
};

export const ADVISOR_QUICK_FIELDS = [
  { key: "fullName", label: "Name", required: true },
  { key: "headline", label: "Headline", required: true },
  { key: "expertise", label: "Expertise", required: true },
  { key: "yearsExperience", label: "Years Experience", required: true },
  { key: "location", label: "Location", required: true },
  { key: "linkedinUrl", label: "LinkedIn", required: true }
] as const;

export const emptyAdvisorProfile = (): AdvisorProfile => ({
  expertise: [],
  yearsExperience: "",
  industries: [],
  mentorshipAreas: [],
  goals: []
});
