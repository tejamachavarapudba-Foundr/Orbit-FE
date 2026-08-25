export type FounderVerificationStatus = "pending" | "approved" | "rejected";

export type VerificationStatus = {
  identityVerified: boolean;
  identityVerifiedAt: string | null;
  founder: {
    status: FounderVerificationStatus;
    reviewNotes: string;
    certificateName: string;
    cinNumber: string;
    documentUrl: string;
    submittedAt: string;
  } | null;
  investorVerified: boolean;
  professionalVerified: boolean;
  advisorVerified: boolean;
  serviceProviderVerified: boolean;
};

/** Same booleans, safe to show on anyone's profile — no founder submission details. */
export type PublicVerificationStatus = {
  identityVerified: boolean;
  founderVerified: boolean;
  investorVerified: boolean;
  professionalVerified: boolean;
  advisorVerified: boolean;
  serviceProviderVerified: boolean;
};

export type SubmitFounderVerificationPayload = {
  certificateName: string;
  cinNumber?: string | undefined;
  documentUrl: string;
  documentKey: string;
};

export type PendingFounderVerification = {
  id: string;
  profileId: string;
  documentUrl: string;
  documentKey: string;
  certificateName: string;
  cinNumber: string;
  status: FounderVerificationStatus;
  createdAt: string;
  profile: {
    id: string;
    fullName: string;
    avatarUrl: string;
    headline: string;
  };
};
