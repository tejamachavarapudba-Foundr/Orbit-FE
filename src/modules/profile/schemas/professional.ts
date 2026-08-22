import { Certification, WorkExperience } from "@/modules/profile/schemas/experience";

export const ENGINEER_SPECIALIZATIONS = [
  { label: "Software Engineer", value: "software_engineer" },
  { label: "Frontend Engineer", value: "frontend_engineer" },
  { label: "Backend Engineer", value: "backend_engineer" },
  { label: "Full-Stack Engineer", value: "fullstack_engineer" },
  { label: "Mobile Engineer", value: "mobile_engineer" },
  { label: "DevOps / Infra Engineer", value: "devops_engineer" },
  { label: "Data Engineer", value: "data_engineer" },
  { label: "ML / AI Engineer", value: "ml_ai_engineer" },
  { label: "QA / Test Engineer", value: "qa_engineer" },
  { label: "Security Engineer", value: "security_engineer" },
  { label: "Not an engineer", value: "" },
  { label: "Other", value: "other" }
] as const;

export type EngineerSpecializationValue = (typeof ENGINEER_SPECIALIZATIONS)[number]["value"];

export type ProfessionalProfile = {
  skills: string[];
  experienceLevel: string;
  portfolio: string;
  resume: string;
  certifications: Certification[];
  experiences: WorkExperience[];
  goals: string[];
  specialization: string;
  specializationOther: string;
};

export const PROFESSIONAL_QUICK_FIELDS = [
  { key: "fullName", label: "Name", required: true },
  { key: "headline", label: "Headline", required: true },
  { key: "specialization", label: "Specialization", required: false },
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
  certifications: [],
  experiences: [],
  goals: [],
  specialization: "",
  specializationOther: ""
});
