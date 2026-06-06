import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ScrollView, View } from "react-native";

import { OnboardingStackParamList } from "@/app/navigation/types";
import { AppButton } from "@/components/ui/AppButton";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { AppTextInput } from "@/components/ui/AppTextInput";
import { ROLE_LABEL } from "@/constants/memberRoles";
import { getQuickProfileValue } from "@/modules/onboarding/quickProfileConfig";
import { useOnboarding } from "@/modules/onboarding/hooks";

type Props = NativeStackScreenProps<OnboardingStackParamList, "OnboardingQuickProfile">;

export const OnboardingQuickProfileScreen = ({ navigation }: Props) => {
  const { draft, quickFields, canContinueQuickProfile, isSubmitting, setQuickField, saveProgress } = useOnboarding();
  const roleLabel = draft.memberRole ? ROLE_LABEL[draft.memberRole] : "your";

  const continueNext = async () => {
    const saved = await saveProgress();
    if (saved) {
      navigation.navigate("OnboardingMatch");
    }
  };

  return (
    <AppScreen>
      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <AppText size="xl" weight="bold" className="mt-4">
          Quick {roleLabel} profile
        </AppText>
        <AppText tone="muted" className="mt-2 leading-6">
          Just the essentials — under 2 minutes. You can add more later.
        </AppText>
        <View className="mt-6 gap-4">
          {quickFields.map((field) => (
            <AppTextInput
              key={field.key}
              label={field.label}
              value={getQuickProfileValue(quickFields, draft.quickProfile, field.key)}
              placeholder={field.placeholder}
              multiline={field.multiline}
              keyboardType={field.keyboardType === "url" ? "url" : "default"}
              autoCapitalize={field.keyboardType === "url" ? "none" : "sentences"}
              onChangeText={(value) => setQuickField(field.mapsToShared ?? field.key, value)}
            />
          ))}
        </View>
        <View className="mt-8 flex-row gap-3">
          <AppButton label="Back" variant="outline" onPress={() => navigation.goBack()} className="flex-1" />
          <AppButton
            label="See matches"
            disabled={!canContinueQuickProfile}
            loading={isSubmitting}
            onPress={() => void continueNext()}
            className="flex-1"
          />
        </View>
      </ScrollView>
    </AppScreen>
  );
};
