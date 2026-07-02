import { View } from "react-native";

import { AppText } from "@/components/ui/AppText";

import {
  MeetingStatus,
} from "@/modules/meeting/types";

type Props = {
  status: MeetingStatus;
};

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    background: "#FEF3C7",
    color: "#B45309",
  },

  founder_contacted: {
    label: "Founder Contacted",
    background: "#DBEAFE",
    color: "#1D4ED8",
  },

  approved: {
    label: "Approved",
    background: "#DCFCE7",
    color: "#15803D",
  },

  rejected: {
    label: "Rejected",
    background: "#FEE2E2",
    color: "#DC2626",
  },
};

export const MeetingStatusBadge = ({
  status,
}: Props) => {
  const config =
    STATUS_CONFIG[status];

  return (
    <View
      className="rounded-full px-3 py-1 self-start"
      style={{
        backgroundColor:
          config.background,
      }}
    >
      <AppText
        size="xs"
        weight="semibold"
        style={{
          color: config.color,
        }}
      >
        {config.label}
      </AppText>
    </View>
  );
};