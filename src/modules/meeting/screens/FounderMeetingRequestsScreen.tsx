import { RefreshControl, ScrollView, View } from "react-native";

import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";

import { useFounderMeetings } from "@/modules/meeting/hooks";
import { MeetingCard } from "@/modules/meeting/components/MeetingCard";

type Props = {
  startupId: string;
};

export const FounderMeetingRequestsScreen = ({
  startupId,
}: Props) => {
  const {
    meetings,
    isLoading,
    refresh,
  } = useFounderMeetings(startupId);

  return (
    <AppScreen
      contentContainerClassName="p-4"
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() =>
              void refresh()
            }
          />
        }
      >
        {/* Header */}

        <View className="mb-6">

          <AppText
            size="2xl"
            weight="bold"
          >
            Incoming Meeting Requests
          </AppText>

          <AppText
            tone="muted"
            className="mt-1"
          >
            Requests approved by Admin.
          </AppText>

        </View>

        {/* Empty */}

        {!isLoading &&
          meetings.length === 0 && (
            <View className="mt-24 items-center">

              <AppText
                size="lg"
                weight="bold"
              >
                No Requests
              </AppText>

              <AppText
                tone="muted"
                className="mt-2 text-center"
              >
                Approved meeting requests will
                appear here.
              </AppText>

            </View>
          )}

        {/* Cards */}

        {meetings.map(
          (meeting) => (
            <MeetingCard
              key={meeting.id}
              meeting={meeting}
              role="founder"
              onContact={() => {
                console.log(
                  "Contact Investor",
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