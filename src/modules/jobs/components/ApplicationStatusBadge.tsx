import { View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { JobApplicationStatus } from "@/modules/jobs/types";

const statusClass: Record<JobApplicationStatus, string> = {
  accepted: "border-emerald-500/25 bg-emerald-500/10 dark:border-emerald-400/30 dark:bg-emerald-500/20",
  rejected: "border-red-500/25 bg-red-500/10 dark:border-red-400/30 dark:bg-red-500/20",
  pending: "border-yellow-400/40 bg-yellow-100 dark:border-yellow-300/30 dark:bg-yellow-500/20"
};

const statusTextClass: Record<JobApplicationStatus, string> = {
  accepted: "text-emerald-700 dark:text-emerald-300",
  rejected: "text-red-700 dark:text-red-300",
  pending: "text-yellow-800 dark:text-yellow-300"
};

const statusLabel: Record<JobApplicationStatus, string> = {
  accepted: "Accepted",
  rejected: "Rejected",
  pending: "Pending"
};

type ApplicationStatusBadgeProps = {
  status: JobApplicationStatus;
  className?: string;
};

export const ApplicationStatusBadge = ({ status, className = "" }: ApplicationStatusBadgeProps) => (
  <View className={`rounded-full border px-2.5 py-0.5 ${statusClass[status]} ${className}`}>
    <AppText size="xs" weight="semibold" className={statusTextClass[status]}>
      {statusLabel[status]}
    </AppText>
  </View>
);
