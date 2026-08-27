export type EventStatus = "ACTIVE" | "CANCELLED";

export type EventAttendee = {
  id: string;
  fullName: string;
  avatarUrl: string;
  headline: string;
  company: string;
};

export type EventHost = {
  id: string;
  fullName: string;
  avatarUrl: string;
};

export type StartupEvent = {
  id: string;
  hostId: string;
  host?: EventHost | null;
  title: string;
  description: string;
  location: string;
  startsAt: string;
  endsAt: string;
  coverUrl: string;
  latitude: number | null;
  longitude: number | null;
  status: EventStatus;
  cancellationReason: string | null;
  createdAt: string;
  updatedAt: string;
  attendeeCount: number;
  communityId?: string | null;
  // Whether the requesting user already has an EventAttendee row — set for
  // community events auto-joined at creation, so no separate join step.
  isAttending: boolean;
};

export type RawStartupEvent = Omit<StartupEvent, "attendeeCount" | "status" | "cancellationReason" | "isAttending"> &
  Partial<Pick<StartupEvent, "attendeeCount" | "status" | "cancellationReason" | "isAttending">> & {
    _count?: {
      attendees: number;
    };
    attendees?: { id: string }[];
  };

export type CreateEventPayload = {
  title: string;
  description: string;
  location: string;
  startsAt: string;
  endsAt: string;
  latitude: number;
  longitude: number;
  isPrivate?: boolean;
  communityId?: string;
  inviteeIds?: string[];
};

export type UpdateEventPayload = Partial<CreateEventPayload>;

export type CancelEventResponse = RawStartupEvent;

export type EventRsvpStatus = "confirmed" | "cancelled";

export type EventRsvpResponse = {
  status: EventRsvpStatus;
  message: string;
  data?: {
    id: string;
    eventId: string;
    userId: string;
    createdAt: string;
    user: {
      fullName: string;
      avatarUrl: string;
    };
  };
};

export type EventFilter = "all" | "upcoming" | "joined" | "completed" | "cancelled";
