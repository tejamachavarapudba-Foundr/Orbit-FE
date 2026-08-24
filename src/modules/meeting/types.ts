export type InviteMode = "startup" | "people";
export type SchedulingMode = "availability_pick" | "date_push";
export type ProposalStatus = "pending" | "confirmed" | "declined" | "cancelled";
export type InviteeResponse = "pending" | "accepted" | "rejected";
export type MeetingStatus = "upcoming" | "completed" | "cancelled";

export const meetingPurposeOptions: { label: string; value: string }[] = [
  { label: "Investment Discussion", value: "Investment Discussion" },
  { label: "Product Demo", value: "Product Demo" },
  { label: "Partnership", value: "Partnership" },
  { label: "Technical Discussion", value: "Technical Discussion" },
  { label: "Mentorship", value: "Mentorship" },
  { label: "General Discussion", value: "General Discussion" },
  { label: "Other", value: "Other" }
];

export type ProposedSlot = {
  date: string; // "YYYY-MM-DD"
  time: string; // "HH:mm"
};

export type ProfileSummary = {
  id: string;
  fullName: string;
  headline?: string;
  avatarUrl?: string;
};

export type AvailabilitySlot = {
  id: string;
  profileId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  timezone: string;
  isActive: boolean;
};

export type ProposalInvitee = {
  id: string;
  proposalId: string;
  userId: string;
  response: InviteeResponse;
  selectedSlot: ProposedSlot | null;
  respondedAt: string | null;
  user?: ProfileSummary;
};

export type MeetingProposal = {
  id: string;
  organizerId: string;
  inviteMode: InviteMode;
  targetStartupId: string | null;
  purpose: string;
  message: string | null;
  schedulingMode: SchedulingMode;
  proposedSlots: ProposedSlot[] | null;
  timezone: string | null;
  status: ProposalStatus;
  createdAt: string;
  invitees: ProposalInvitee[];
  organizer?: ProfileSummary;
};

export type MeetingJoinRecord = { id: string; meetingId: string; userId: string; joinedAt: string };

export type Meeting = {
  id: string;
  proposalId: string;
  confirmedAt: string;
  timezone: string;
  durationMins: number;
  meetLink: string | null;
  googleEventId: string;
  status: MeetingStatus;
  cancelledBy: string | null;
  cancelReason: string | null;
  cancelledAt: string | null;
  createdAt: string;
  proposal: MeetingProposal;
  joins: MeetingJoinRecord[];
};

export type MeetingsTab = "upcoming" | "completed" | "cancelled";

export type UpcomingListResponse = {
  meetings: Meeting[];
  pendingProposals: MeetingProposal[];
};

export type CancelledListResponse = {
  meetings: Meeting[];
  proposals: MeetingProposal[];
};

export type GoogleConnectionStatus = { connected: false } | { connected: true; email: string };

export type SaveAvailabilityPayload = {
  timezone: string;
  slots: { dayOfWeek: number; startTime: string; endTime: string }[];
};

export type OpenSlotsResponse = {
  timezone: string | null;
  slots: ProposedSlot[];
};

export type CreateProposalPayload = {
  inviteMode: InviteMode;
  targetStartupId?: string | undefined;
  inviteeUserIds?: string[] | undefined;
  purpose: string;
  message?: string | undefined;
  schedulingMode: SchedulingMode;
  selectedSlot?: ProposedSlot | undefined;
  proposedSlots?: ProposedSlot[] | undefined;
  timezone?: string | undefined;
};

export type RespondProposalPayload = {
  action: "accept" | "reject";
  selectedSlot?: ProposedSlot | undefined;
  replyMessage?: string | undefined;
};
