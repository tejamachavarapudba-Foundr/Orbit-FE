import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ScrollView, View } from "react-native";

import { OnboardingStackParamList } from "@/app/navigation/types";
import { AppButton } from "@/components/ui/AppButton";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { AppTextInput } from "@/components/ui/AppTextInput";
import { BottomSheetMultiSelect } from "@/components/ui/BottomSheetMultiSelect";
import { BottomSheetPicker } from "@/components/ui/BottomSheetPicker";
import { Dropdown } from "@/components/ui/Dropdown";
import { ExperiencePeriodsEditor } from "@/components/ui/ExperiencePeriodsEditor";
import { MultiSelectChecklist } from "@/components/ui/MultiSelectChecklist";
import { PortfolioNamesBottomSheet } from "@/components/ui/PortfolioNamesBottomSheet";
import { ROLE_LABEL } from "@/constants/memberRoles";
import { getQuickProfileValue } from "@/modules/onboarding/quickProfileConfig";
import { useOnboarding } from "@/modules/onboarding/hooks";
import { ExperiencePeriod } from "@/modules/profile/schemas/experience";
import { isValidLinkedInUrl, isValidUrl } from "@/utils/validation";

const OTHER_TEXT_FIELD_MAP: Record<string, string> = {
  specialization: "specializationOther",
  currentRole: "currentRoleOther",
  investorType: "investorTypeOther",
  expertise: "expertiseOther",
  services: "servicesOther"
};

const parseExperiencePeriods = (value: string): ExperiencePeriod[] => {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

type Props = NativeStackScreenProps<OnboardingStackParamList, "OnboardingQuickProfile">;

export const OnboardingQuickProfileScreen = ({ navigation }: Props) => {
  const { draft, quickFields, isSubmitting, setQuickField, completeOnboarding } = useOnboarding();
  const roleLabel = draft.memberRole ? ROLE_LABEL[draft.memberRole] : "your";

  // Fields can be left blank — nothing here blocks continuing, so this
  // finishes onboarding directly instead of routing through a separate
  // matches screen.
  const finish = async () => {
    if (isSubmitting) return;
    await completeOnboarding();
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
          {quickFields.map((field) => {
            if (field.type === "dropdown" && field.options) {
              const currentValue = getQuickProfileValue(quickFields, draft.quickProfile, field.key);

              return (
                <View key={field.key} className="gap-2">
                  <AppText size="sm" weight="medium" tone="muted">
                    {field.label}
                  </AppText>
                  <Dropdown
                    value={currentValue}
                    options={field.options}
                    onChange={(value) => setQuickField(field.mapsToShared ?? field.key, value)}
                    placeholder={`Select ${field.label.toLowerCase()}`}
                  />
                </View>
              );
            }

            if (field.type === "multiSelect" && field.options) {
              const currentValue = getQuickProfileValue(quickFields, draft.quickProfile, field.key);
              const selected = currentValue
                ? currentValue
                    .split(",")
                    .map((item) => item.trim())
                    .filter(Boolean)
                : [];

              return (
                <View key={field.key} className="gap-2">
                  <AppText size="sm" weight="medium" tone="muted">
                    {field.label}
                  </AppText>
                  <MultiSelectChecklist
                    options={field.options}
                    value={selected}
                    onChange={(values) => setQuickField(field.mapsToShared ?? field.key, values.join(", "))}
                  />
                </View>
              );
            }

            if (field.type === "multiSelectBottomSheet" && field.options) {
              const currentValue = getQuickProfileValue(quickFields, draft.quickProfile, field.key);
              const selected = currentValue
                ? currentValue
                    .split(",")
                    .map((item) => item.trim())
                    .filter(Boolean)
                : [];
              const otherFieldKey = OTHER_TEXT_FIELD_MAP[field.key];

              return (
                <View key={field.key} className="gap-2">
                  <AppText size="sm" weight="medium" tone="muted">
                    {field.label}
                    {field.max ? ` (select up to ${field.max})` : ""}
                  </AppText>
                  <BottomSheetMultiSelect
                    value={selected}
                    options={field.options}
                    onChange={(values) => setQuickField(field.mapsToShared ?? field.key, values.join(", "))}
                    placeholder={`Select ${field.label.toLowerCase()}`}
                    title={field.label}
                    max={field.max}
                    otherValue={otherFieldKey ? "other" : undefined}
                    otherText={otherFieldKey ? getQuickProfileValue(quickFields, draft.quickProfile, otherFieldKey) : undefined}
                    onOtherTextChange={otherFieldKey ? (text) => setQuickField(otherFieldKey, text) : undefined}
                  />
                </View>
              );
            }

            if (field.type === "experiencePeriods") {
              const currentValue = getQuickProfileValue(quickFields, draft.quickProfile, field.key);
              const periods = parseExperiencePeriods(currentValue);

              return (
                <View key={field.key} className="gap-2">
                  <AppText size="sm" weight="medium" tone="muted">
                    {field.label}
                  </AppText>
                  <ExperiencePeriodsEditor
                    periods={periods}
                    onChange={(next) => setQuickField(field.key, JSON.stringify(next))}
                    title={field.label}
                  />
                </View>
              );
            }

            if (field.type === "portfolioNames") {
              const currentValue = getQuickProfileValue(quickFields, draft.quickProfile, field.key);
              const names = currentValue
                ? currentValue
                    .split(",")
                    .map((item) => item.trim())
                    .filter(Boolean)
                : [];

              return (
                <View key={field.key} className="gap-2">
                  <AppText size="sm" weight="medium" tone="muted">
                    {field.label}
                  </AppText>
                  <PortfolioNamesBottomSheet
                    value={names}
                    onChange={(values) => setQuickField(field.mapsToShared ?? field.key, values.join(", "))}
                  />
                </View>
              );
            }

            if (field.type === "bottomSheet" && field.options) {
              const currentValue = getQuickProfileValue(quickFields, draft.quickProfile, field.key);
              const otherFieldKey = OTHER_TEXT_FIELD_MAP[field.key];

              return (
                <View key={field.key} className="gap-2">
                  <AppText size="sm" weight="medium" tone="muted">
                    {field.label}
                  </AppText>
                  <BottomSheetPicker
                    value={currentValue}
                    options={field.options}
                    onChange={(value) => setQuickField(field.mapsToShared ?? field.key, value)}
                    placeholder={`Select ${field.label.toLowerCase()}`}
                    title={field.label}
                    otherValue={otherFieldKey ? "other" : undefined}
                    otherText={otherFieldKey ? getQuickProfileValue(quickFields, draft.quickProfile, otherFieldKey) : undefined}
                    onOtherTextChange={otherFieldKey ? (text) => setQuickField(otherFieldKey, text) : undefined}
                  />
                </View>
              );
            }

            if (field.keyboardType === "url") {
              const currentValue = getQuickProfileValue(quickFields, draft.quickProfile, field.key);
              const isLinkedIn = (field.mapsToShared ?? field.key) === "linkedinUrl";
              const isValid = isLinkedIn ? isValidLinkedInUrl(currentValue) : isValidUrl(currentValue);

              return (
                <AppTextInput
                  key={field.key}
                  label={field.label}
                  value={currentValue}
                  placeholder={field.placeholder}
                  keyboardType="url"
                  autoCapitalize="none"
                  error={currentValue.trim() && !isValid ? `Enter a valid ${isLinkedIn ? "LinkedIn" : ""} URL` : undefined}
                  onChangeText={(value) => setQuickField(field.mapsToShared ?? field.key, value)}
                />
              );
            }

            return (
              <AppTextInput
                key={field.key}
                label={field.label}
                value={getQuickProfileValue(quickFields, draft.quickProfile, field.key)}
                placeholder={field.placeholder}
                multiline={field.multiline}
                keyboardType="default"
                autoCapitalize="sentences"
                onChangeText={(value) => setQuickField(field.mapsToShared ?? field.key, value)}
              />
            );
          })}
        </View>
        <View className="mt-8 flex-row gap-3">
          <AppButton label="Back" variant="outline" onPress={() => navigation.goBack()} className="flex-1" />
          <AppButton
            label="Explore Orbit"
            loading={isSubmitting}
            onPress={() => void finish()}
            className="flex-1"
          />
        </View>
      </ScrollView>
    </AppScreen>
  );
};
