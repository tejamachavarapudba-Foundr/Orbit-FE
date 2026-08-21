import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ScrollView, View } from "react-native";

import { OnboardingStackParamList } from "@/app/navigation/types";
import { AppButton } from "@/components/ui/AppButton";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { RoleCard } from "@/modules/onboarding/components/RoleCard";
import { useOnboarding } from "@/modules/onboarding/hooks";

type Props = NativeStackScreenProps<OnboardingStackParamList, "OnboardingWelcome">;

export const OnboardingWelcomeScreen = ({ navigation }: Props) => {
  const { roles, draft, canContinueWelcome, isSubmitting, setMemberRole, saveProgress } = useOnboarding();

  const continueNext = async () => {
    await saveProgress();
    navigation.navigate("OnboardingGoals");
  };

  return (
    <AppScreen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="mt-4 flex-row gap-1">
          <View className="h-[3px] flex-1 rounded-full bg-primary" />
          <View className="h-[3px] flex-1 rounded-full bg-border" />
          <View className="h-[3px] flex-1 rounded-full bg-border" />
          <View className="h-[3px] flex-1 rounded-full bg-border" />
        </View>
        <AppText size="2xl" weight="bold" className="mt-5">
          Who are you on Orbit?
        </AppText>
        <AppText tone="muted" className="mt-2 leading-6">
          Pick the role that fits best — you can add more detail next.
        </AppText>
        <View className="mt-6 gap-2.5">
          {roles.map((role) => (
            <RoleCard
              key={role.value}
              icon={role.icon}
              label={role.label}
              description={role.description}
              value={role.value}
              selected={draft.memberRole === role.value}
              onSelect={setMemberRole}
            />
          ))}
        </View>
        <AppButton
          label="Continue"
          disabled={!canContinueWelcome}
          loading={isSubmitting}
          onPress={() => void continueNext()}
          className="mt-8"
        />
      </ScrollView>
    </AppScreen>
  );
};
