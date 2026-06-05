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
};

export type Job = {
  id: string;
  posterId: string;
  projectId?: string;
  startupName: string;
  heading: string;
  role: string;
  experience: string;
  skills: string[];
  description: string;
  createdAt: string;
  updatedAt: string;
  poster?: AuthProfile;
  applications?: JobApplication[];
};

export type CreateJobPayload = {
  projectId: string;
  startupName: string;
  heading: string;
  role: string;
  experience: string;
  skills: string[];
  description: string;
};

export type UpdateJobPayload = Partial<Omit<CreateJobPayload, "projectId">>;

export type ApplyJobPayload = {
  message: string;
};

export type DeleteJobResponse = {
  success: boolean;
  message: string;
};
