import { AuthProfile } from "@/modules/auth/types";

export type JobApplicationStatus = "pending" | "accepted" | "rejected";

export type JobApplication = {
  id: string;
  jobId: string;
  applicantId: string;
  message: string;
  status: JobApplicationStatus;
  createdAt: string;
  updatedAt: string;
  resumeKey?: string | null;

  resumeFileName?: string | null;

  resumeFileSize?: number | null;

  coverLetter?: string | null;

  expectedSalary?: string | null;

  noticePeriod?: string | null;

  portfolioUrl?: string | null;

  linkedinUrl?: string | null;

  applicant?: {
    id: string;
    fullName: string;
    headline: string;
    avatarUrl: string;
    role: string;
  };
};

export type Job = {
  id: string;
  posterId: string;
  projectId?: string;
  startupName: string;
  heading: string;
  role: string;
  experience: string;
  location: string;
  openings: number;
  skills: string[];
  description: string;
  createdAt: string;
  updatedAt: string;
  poster?: AuthProfile;
  applications?: JobApplication[];
};

export type CreateJobPayload = {
  startupName: string;
  heading: string;
  role: string;
  experience: string;
  location?: string;
  openings?: number;
  skills: string[];
  description: string;
};

export type UpdateJobPayload = Partial<CreateJobPayload>;

export interface ApplyJobPayload {
  message?: string;

  coverLetter?: string;

  expectedSalary?: string;

  noticePeriod?: string;

  portfolioUrl?: string;

  linkedinUrl?: string;
}

export type DeleteJobResponse = {
  success: boolean;
  message: string;
};
