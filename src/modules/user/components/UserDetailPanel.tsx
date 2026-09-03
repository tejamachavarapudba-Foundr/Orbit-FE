import { View } from "react-native";

import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { UserAvatar } from "@/modules/user/components/UserAvatar";
import { UserSummary } from "@/modules/user/types";

type UserDetailPanelProps = {
  user: UserSummary | null;
  isLoading: boolean;
  errorMessage: string | null;
  onClose: () => void;
};

const Pill = ({ label }: { label: string }) => (
  <View className="rounded-md bg-primary/10 px-3 py-2">
    <AppText tone="primary" size="sm">
      {label}
    </AppText>
  </View>
);

export const UserDetailPanel = ({ user, isLoading, errorMessage, onClose }: UserDetailPanelProps) => {
  if (!isLoading && !errorMessage && !user) {
    return null;
  }

  return (
    <View className="mt-4 rounded-md border border-border bg-surface p-4 shadow-sm">
      {isLoading ? (
        <View className="gap-3">
          <Skeleton className="h-12 w-12" />
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-20 w-full" />
        </View>
      ) : errorMessage ? (
        <ErrorState message={errorMessage} />
      ) : user ? (
        <View>
          <View className="flex-row items-start gap-3">
            <UserAvatar name={user.profile.fullName} imageUrl={user.profile.avatarUrl} />
            <View className="flex-1">
              <AppText size="xl" weight="bold">
                {user.profile.fullName}
              </AppText>
              <AppText tone="primary" weight="medium" className="mt-1">
                {user.profile.headline || user.profile.role || "Orbit member"}
              </AppText>
              <AppText tone="muted" size="sm" className="mt-1">
                {user.profile.openToConnect ? "Open to connect" : "Profile preview"}
              </AppText>
            </View>
          </View>

          {user.profile.bio ? (
            <AppText tone="muted" className="mt-4 leading-6">
              {user.profile.bio}
            </AppText>
          ) : null}

          <View className="mt-4 gap-2">
            {user.profile.company ? <AppText tone="muted">Company: {user.profile.company}</AppText> : null}
            {user.profile.location ? <AppText tone="muted">Location: {user.profile.location}</AppText> : null}
            {user.profile.language ? <AppText tone="muted">Language: {user.profile.language}</AppText> : null}
            {user.profile.website ? <AppText tone="muted">Website: {user.profile.website}</AppText> : null}
          </View>

          {user.profile.skills.length > 0 ? (
            <View className="mt-4 flex-row flex-wrap gap-2">
              {user.profile.skills.map((skill) => (
                <Pill key={skill} label={skill} />
              ))}
            </View>
          ) : null}

          <AppButton label="Close" variant="outline" onPress={onClose} className="mt-5" />
        </View>
      ) : null}
    </View>
  );
};
