import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ActivityIndicator, ScrollView, View } from "react-native";

import { OnboardingStackParamList } from "@/app/navigation/types";
import { AppButton } from "@/components/ui/AppButton";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { MatchPreviewCard } from "@/modules/onboarding/components/MatchPreviewCard";
import { ProfileCompletionBar } from "@/modules/onboarding/components/ProfileCompletionBar";
import { useOnboarding } from "@/modules/onboarding/hooks";
import { useMatchRecommendations } from "@/modules/recommendations/hooks";
import { calculateProfileCompletion } from "@/modules/profile/completion";
import { useAuthStore } from "@/modules/auth/store";

type Props = NativeStackScreenProps<OnboardingStackParamList, "OnboardingMatch">;

export const OnboardingMatchScreen = (_props: Props) => {
  const { draft, isSubmitting, completeOnboarding } = useOnboarding();
  const profile = useAuthStore((state) => state.user?.profile);
  const completion = calculateProfileCompletion(profile, draft.memberRole);
  const { matches, isLoading } = useMatchRecommendations(null);

  const finish = async () => {
    await completeOnboarding();
  };

  return (
    <AppScreen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <AppText size="xl" weight="bold" className="mt-4">
          Your matches are ready
        </AppText>
        <AppText tone="muted" className="mt-2 leading-6">
          Based on your role and goals, here is who you should meet first.
        </AppText>

        <View className="mt-6">
          {isLoading ? (
            <ActivityIndicator />
          ) : (
            <MatchPreviewCard matches={matches} />
          )}
        </View>

        {matches.people.length > 0 ? (
          <View className="mt-6 gap-3">
            <AppText weight="bold">Recommended people</AppText>
            {matches.people.slice(0, 5).map((person) => (
              <View key={person.id} className="rounded-md border border-border bg-surface p-3">
                <AppText weight="semibold">{person.fullName}</AppText>
                <AppText tone="muted" size="sm" className="mt-1">
                  {person.headline || person.role}
                </AppText>
                {person.matchReasons[0] ? (
                  <AppText tone="primary" size="xs" className="mt-2">
                    {person.matchReasons[0]}
                  </AppText>
                ) : null}
              </View>
            ))}
          </View>
        ) : null}

        {matches.startups.length > 0 ? (
          <View className="mt-6 gap-3">
            <AppText weight="bold">Recommended startups</AppText>
            {matches.startups.slice(0, 4).map((startup) => (
              <View key={startup.id} className="rounded-md border border-border bg-surface p-3">
                <AppText weight="semibold">{startup.name}</AppText>
                <AppText tone="muted" size="sm" className="mt-1">
                  {[startup.industry, startup.stage].filter(Boolean).join(" · ")}
                </AppText>
              </View>
            ))}
          </View>
        ) : null}

        <View className="mt-6">
          <ProfileCompletionBar percent={completion} />
        </View>

        <AppButton label="Enter Foundr" loading={isSubmitting} onPress={() => void finish()} className="mt-8" />
        <AppText tone="muted" size="xs" className="mt-3 text-center leading-5">
          You can complete the rest of your profile anytime from the Profile tab.
        </AppText>
      </ScrollView>
    </AppScreen>
  );
};
