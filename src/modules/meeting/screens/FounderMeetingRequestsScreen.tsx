import { Pressable, RefreshControl, ScrollView, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";

import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { iconSize } from "@/theme/designTokens";

import { useFounderMeetings } from "@/modules/meeting/hooks";
import { MeetingCard } from "@/modules/meeting/components/MeetingCard";

export const FounderMeetingRequestsScreen = () => {
  const colors = useThemeTokens();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const startupId: string = route.params?.startupId ?? "";
  const { meetings, isLoading, refresh } = useFounderMeetings(startupId);

  return (
    <AppScreen contentContainerClassName="flex-1 px-4">
      <View className="flex-row items-center pb-2 pt-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={() => navigation.goBack()}
          className="h-9 w-9 items-center justify-center rounded-md"
        >
          <Feather name="arrow-left" size={iconSize.md} color={colors.text} />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => void refresh()} />}
      >
        <View className="mb-6">
          <AppText size="2xl" weight="bold">
            Incoming Meeting Requests
          </AppText>
          <AppText tone="muted" className="mt-1">
            Requests approved by Admin.
          </AppText>
        </View>

        {!isLoading && meetings.length === 0 ? (
          <View className="mt-24 items-center">
            <AppText size="lg" weight="bold">
              No Requests
            </AppText>
            <AppText tone="muted" className="mt-2 text-center">
              Approved meeting requests will appear here.
            </AppText>
          </View>
        ) : (
          meetings.map((meeting) => (
            <MeetingCard key={meeting.id} meeting={meeting} role="founder" onContact={() => {}} />
          ))
        )}
      </ScrollView>
    </AppScreen>
  );
};
