import { FollowProfile } from "@/modules/follows/types";

export type ConnectionRequestStatus = "pending" | "accepted" | "declined" | "cancelled";

export type ConnectionStatus = "none" | "outgoing_pending" | "incoming_pending" | "connected";

export type ConnectionRequest = {
  id: string;
  requesterId: string;
  recipientId: string;
  note: string;
  status: ConnectionRequestStatus;
  createdAt: string;
  requester?: FollowProfile | undefined;
  recipient?: FollowProfile | undefined;
};

export type ConnectionStatusResponse = {
  status: ConnectionStatus;
  requestId?: string;
  note?: string;
};

export type ConnectionCountResponse = {
  count: number;
};

export type SendConnectionRequestPayload = {
  recipientId: string;
  note: string;
};
