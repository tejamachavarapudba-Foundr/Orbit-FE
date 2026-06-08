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
    console.log("Continue clicked");
    navigation.navigate("OnboardingGoals");
  };

  return (
    <AppScreen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <AppText size="2xl" weight="bold" className="mt-4">
          🚀 Welcome to Foundr
        </AppText>
        <AppText tone="muted" className="mt-2 leading-6">
          Connect with founders, investors, advisors and talent.
        </AppText>
        <AppText weight="semibold" className="mt-8">
          I am a...
        </AppText>
        <View className="mt-4 gap-3">
          {roles.map((role) => (
            <RoleCard
              key={role.value}
              emoji={role.emoji}
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
