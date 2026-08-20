import { useState } from "react";
import { FlatList, ListRenderItem, Pressable, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

import { AppHeader } from "@/components/layout/AppHeader";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { FilterChip } from "@/components/ui/FilterChip";
import { Skeleton } from "@/components/ui/Skeleton";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { useAuthStore } from "@/modules/auth/store";
import { CreateMeetingModal } from "@/modules/meeting/components/CreateMeetingModal";
import { GoogleConnectGate } from "@/modules/meeting/components/GoogleConnectGate";
import { ConfirmedMeetingCard, DeclinedProposalCard, PendingProposalCard } from "@/modules/meeting/components/MeetingListCard";
import { useGoogleConnection, useMyMeetings } from "@/modules/meeting/hooks";
import { Meeting, MeetingProposal, MeetingsTab } from "@/modules/meeting/types";
import { iconSize } from "@/theme/designTokens";

type ListRow = { type: "meeting"; meeting: Meeting } | { type: "pending"; proposal: MeetingProposal } | { type: "declined"; proposal: MeetingProposal };

export const MeetingsScreen = () => {
  const colors = useThemeTokens();
  const navigation = useNavigation<any>();
  const currentUserId = useAuthStore((state) => state.user?.profile?.id) ?? "";
  const { isConnected } = useGoogleConnection();

  const [tab, setTab] = useState<MeetingsTab>("upcoming");
  const [createVisible, setCreateVisible] = useState(false);

  const { meetings, pendingProposals, cancelledProposals, isLoading, errorMessage, mutatingId, reload, withdrawProposal, cancelMeeting } =
    useMyMeetings(tab);

  const rows: ListRow[] = [
    ...pendingProposals.map((proposal) => ({ type: "pending" as const, proposal })),
    ...meetings.map((meeting) => ({ type: "meeting" as const, meeting })),
    ...cancelledProposals.map((proposal) => ({ type: "declined" as const, proposal }))
  ];

  const renderRow: ListRenderItem<ListRow> = ({ item }) => {
    if (item.type === "meeting") {
      return (
        <View className="w-full max-w-2xl self-center px-4">
          <ConfirmedMeetingCard
            meeting={item.meeting}
            currentUserId={currentUserId}
            mutatingId={mutatingId}
            onCancel={(id) => void cancelMeeting(id)}
            readOnly={tab !== "upcoming"}
          />
        </View>
      );
    }
    if (item.type === "pending") {
      return (
        <View className="w-full max-w-2xl self-center px-4">
          <PendingProposalCard
            proposal={item.proposal}
            currentUserId={currentUserId}
            mutatingId={mutatingId}
            onWithdraw={(id) => void withdrawProposal(id)}
            onRespond={(proposal) => navigation.navigate("MeetingResponse", { proposalId: proposal.id })}
          />
        </View>
      );
    }
    return (
      <View className="w-full max-w-2xl self-center px-4">
        <DeclinedProposalCard proposal={item.proposal} currentUserId={currentUserId} />
      </View>
    );
  };

  return (
    <>
      <AppScreen withHorizontalPadding={false}>
        <AppHeader />
        <FlatList
          data={rows}
          keyExtractor={(item) => (item.type === "meeting" ? item.meeting.id : item.proposal.id)}
          renderItem={renderRow}
          refreshing={isLoading}
          onRefresh={() => void reload()}
          contentContainerStyle={{ paddingBottom: 32, gap: 12 }}
          ListHeaderComponent={
            <View className="w-full max-w-2xl self-center px-4 pb-2 pt-4">
              <View className="flex-row items-start justify-between gap-3">
                <View className="min-w-0 flex-1">
                  <AppText family="display" size="2xl" weight="bold" className="tracking-tight">
                    My Meetings
                  </AppText>
                  <AppText tone="muted" size="sm" className="mt-2 leading-5">
                    Propose a time, negotiate, and meet on Google Meet — all in one place.
                  </AppText>
                </View>
                {isConnected ? (
                  <View className="flex-row items-center gap-2">
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Set your availability"
                      onPress={() => navigation.navigate("MeetingAvailability")}
                      className="h-11 w-11 items-center justify-center rounded-full border border-border"
                    >
                      <Feather name="clock" size={iconSize.md} color={colors.text} />
                    </Pressable>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="New meeting"
                      onPress={() => setCreateVisible(true)}
                      className="h-11 w-11 items-center justify-center rounded-full bg-primary"
                    >
                      <Feather name="plus" size={iconSize.lg} color={colors.onPrimary} />
                    </Pressable>
                  </View>
                ) : null}
              </View>

              <View className="mt-4 flex-row flex-wrap gap-2">
                <FilterChip label="Upcoming" isActive={tab === "upcoming"} activeTone="primary" onPress={() => setTab("upcoming")} />
                <FilterChip label="Completed" isActive={tab === "completed"} activeTone="primary" onPress={() => setTab("completed")} />
                <FilterChip label="Cancelled" isActive={tab === "cancelled"} activeTone="primary" onPress={() => setTab("cancelled")} />
              </View>

              {!isConnected ? <GoogleConnectGate /> : null}
            </View>
          }
          ListEmptyComponent={
            !isConnected ? null : isLoading ? (
              <View className="w-full max-w-2xl gap-3 self-center px-4">
                <Skeleton className="h-24 w-full rounded-xl" />
                <Skeleton className="h-24 w-full rounded-xl" />
              </View>
            ) : errorMessage ? (
              <View className="w-full max-w-2xl self-center px-4">
                <ErrorState message={errorMessage} onRetry={() => void reload()} />
              </View>
            ) : (
              <View className="w-full max-w-2xl self-center px-4">
                <EmptyState
                  title={`No ${tab} meetings`}
                  message={tab === "upcoming" ? "Start a new meeting with the + button above." : "Nothing here yet."}
                />
              </View>
            )
          }
        />
      </AppScreen>
      <CreateMeetingModal visible={createVisible} onClose={() => setCreateVisible(false)} />
    </>
  );
};
