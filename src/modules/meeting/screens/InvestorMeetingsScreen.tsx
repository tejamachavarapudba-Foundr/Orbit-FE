import { useMemo, useState } from "react";
import { Pressable, RefreshControl, ScrollView, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { AppButton } from "@/components/ui/AppButton";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { iconSize } from "@/theme/designTokens";

import { useInvestorMeetings } from "@/modules/meeting/hooks";
import { MeetingCard } from "@/modules/meeting/components/MeetingCard";
import { MeetingRequestModal } from "@/modules/meeting/components/MeetingRequestModal";

export const InvestorMeetingsScreen = () => {
  const colors = useThemeTokens();
  const navigation = useNavigation<any>();
  const { meetings, isLoading, refresh } = useInvestorMeetings();
  const [createVisible, setCreateVisible] = useState(false);

  const grouped = useMemo(() => {
    const pending = meetings.filter((meeting) => meeting.status === "pending");
    const upcoming = meetings.filter((meeting) => meeting.status === "approved" || meeting.status === "founder_contacted");
    const completed = meetings.filter((meeting) => meeting.status === "completed" || meeting.status === "rejected");
    return { pending, upcoming, completed };
  }, [meetings]);

  return (
    <AppScreen contentContainerClassName="flex-1 px-5">
      <View className="flex-row items-center justify-between pb-2 pt-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={() => navigation.goBack()}
          className="h-9 w-9 items-center justify-center rounded-md"
        >
          <Feather name="arrow-left" size={iconSize.md} color={colors.text} />
        </Pressable>
        <AppButton label="+ Create meeting" size="sm" onPress={() => setCreateVisible(true)} />
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => void refresh()} />}
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-6">
          <AppText size="2xl" weight="bold">
            My Meetings
          </AppText>
          <AppText tone="muted" className="mt-1">
            Track all your startup meeting requests.
          </AppText>
        </View>

        {!isLoading && meetings.length === 0 ? (
          <View className="mt-24 items-center">
            <AppText weight="bold" size="lg">
              No Meeting Requests
            </AppText>
            <AppText tone="muted" className="mt-2 text-center">
              Book meetings from Startup Cards, or create one above.
            </AppText>
          </View>
        ) : (
          <>
            <MeetingSection title={`Pending (${grouped.pending.length})`} meetings={grouped.pending} />
            <MeetingSection title={`Upcoming (${grouped.upcoming.length})`} meetings={grouped.upcoming} />
            <MeetingSection title={`Completed (${grouped.completed.length})`} meetings={grouped.completed} />
          </>
        )}
      </ScrollView>

      <MeetingRequestModal visible={createVisible} startupId="" startupName="" onClose={() => setCreateVisible(false)} />
    </AppScreen>
  );
};

const MeetingSection = ({ title, meetings }: { title: string; meetings: ReturnType<typeof useInvestorMeetings>["meetings"] }) => {
  if (meetings.length === 0) return null;

  return (
    <View className="mb-6">
      <AppText weight="bold" className="mb-3">
        {title}
      </AppText>
      {meetings.map((meeting) => (
        <MeetingCard key={meeting.id} meeting={meeting} role="investor" onPress={() => {}} />
      ))}
    </View>
  );
};
