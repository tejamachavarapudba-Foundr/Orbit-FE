// src/modules/meeting/types.ts

import { AuthProfile } from "@/modules/auth/types";
import { Project } from "@/modules/project/types";

export type MeetingStatus =
  | "pending"
  | "founder_contacted"
  | "approved"
  | "rejected"
  | "completed";

export type MeetingPurpose =
  | "Investment Discussion"
  | "Product Demo"
  | "Partnership"
  | "Technical Discussion"
  | "Mentorship"
  | "General Discussion"
  | "Other";

export type MeetingRequest = {
  id: string;

  startupId: string;
  investorId: string;

  purpose: string;

  preferredDate1: string;
  preferredTime1: string;

  preferredDate2: string;
  preferredTime2: string;

  expectedInvestment: string;

  message: string;

  status: MeetingStatus;

  createdAt: string;
  updatedAt: string;

  startup?: Project;
  investor?: AuthProfile;
};

export type MeetingRequestPayload = {
  startupId: string;

  purpose: string;

  preferredDate1: string;
  preferredTime1: string;

  preferredDate2: string;
  preferredTime2: string;

  expectedInvestment: string;

  message?: string;
};

export type MeetingStatusPayload = {
  status: MeetingStatus;
};

export type MeetingFilters = {
  query: string;
  status: "all" | MeetingStatus;
};

export type MeetingResponse = MeetingRequest;

export type MeetingCounts = {
  pending: number;
  approved: number;
  rejected: number;
  founder_contacted: number;
  completed: number;
};

export type MeetingTimelineItem = {
  title: string;
  description: string;
  createdAt: string;
};

export type MeetingCardAction =
  | "approve"
  | "reject"
  | "contact"
  | "details";

export type MeetingRole =
  | "investor"
  | "founder"
  | "admin";