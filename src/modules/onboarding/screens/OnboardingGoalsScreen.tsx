import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ScrollView, View } from "react-native";

import { OnboardingStackParamList } from "@/app/navigation/types";
import { AppButton } from "@/components/ui/AppButton";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { GoalChip } from "@/modules/onboarding/components/GoalChip";
import { useOnboarding } from "@/modules/onboarding/hooks";

type Props = NativeStackScreenProps<OnboardingStackParamList, "OnboardingGoals">;

export const OnboardingGoalsScreen = ({ navigation }: Props) => {
  const { goalTitle, goalOptions, draft, canContinueGoals, isSubmitting, toggleGoal, saveProgress } = useOnboarding();

  const continueNext = async () => {
    const saved = await saveProgress();
    if (saved) {
      navigation.navigate("OnboardingQuickProfile");
    }
  };

  return (
    <AppScreen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <AppText size="xl" weight="bold" className="mt-4">
          {goalTitle}
        </AppText>
        <AppText tone="muted" className="mt-2">
          Select all that apply — we use this to personalize your matches.
        </AppText>
        <View className="mt-6 flex-row flex-wrap gap-2">
          {goalOptions.map((option) => (
            <GoalChip
              key={option.value}
              label={option.label}
              selected={draft.goals.includes(option.value)}
              onPress={() => toggleGoal(option.value)}
            />
          ))}
        </View>
        <View className="mt-8 flex-row gap-3">
          <AppButton label="Back" variant="outline" onPress={() => navigation.goBack()} className="flex-1" />
          <AppButton
            label="Continue"
            disabled={!canContinueGoals}
            loading={isSubmitting}
            onPress={() => void continueNext()}
            className="flex-1"
          />
        </View>
      </ScrollView>
    </AppScreen>
  );
};
