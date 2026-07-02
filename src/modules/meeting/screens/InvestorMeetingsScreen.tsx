import { RefreshControl, ScrollView, View } from "react-native";

import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { AppButton } from "@/components/ui/AppButton";

import { useInvestorMeetings } from "@/modules/meeting/hooks";
import { MeetingCard } from "@/modules/meeting/components/MeetingCard";

export const InvestorMeetingsScreen = () => {
  const {
    meetings,
    isLoading,
    refresh,
  } = useInvestorMeetings();

  return (
    <AppScreen
      contentContainerClassName="p-4"
    >
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() =>
              void refresh()
            }
          />
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        {/* Header */}

        <View className="mb-6">

          <AppText
            size="2xl"
            weight="bold"
          >
            My Meetings
          </AppText>

          <AppText
            tone="muted"
            className="mt-1"
          >
            Track all your startup meeting requests.
          </AppText>

        </View>

        {/* Empty */}

        {!isLoading &&
          meetings.length === 0 && (

            <View className="mt-24 items-center">

              <AppText
                weight="bold"
                size="lg"
              >
                No Meeting Requests
              </AppText>

              <AppText
                tone="muted"
                className="mt-2 text-center"
              >
                Book meetings from Startup Cards.
              </AppText>

            </View>

          )}

        {/* Cards */}

        {meetings.map(
          (meeting) => (
            <MeetingCard
              key={meeting.id}
              meeting={meeting}
              role="investor"
              onPress={() => {
                console.log(
                  meeting.id,
                );
              }}
            />
          ),
        )}

      </ScrollView>
    </AppScreen>
  );
};