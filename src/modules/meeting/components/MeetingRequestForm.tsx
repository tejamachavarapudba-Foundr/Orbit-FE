import { TextInput, View } from "react-native";

import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";

import { useThemeTokens } from "@/hooks/useThemeTokens";

import {
  meetingPurposeOptions,
  useMeetingForm,
} from "@/modules/meeting/hooks";

import { CategoryDropdown } from "@/modules/post/components/CategoryDropdown";

type Props = {
  startupId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export const MeetingRequestForm = ({
  startupId,
  onSuccess,
  onCancel,
}: Props) => {
  const colors = useThemeTokens();

  const {
    values,
    setField,
    submit,
    isSubmitting,
    canSubmit,
  } = useMeetingForm(startupId);

  const handleSubmit = async () => {
    const success = await submit();

    if (success) {
      onSuccess?.();
    }
  };

  return (
    <View className="gap-4 pb-10">

      {/* Purpose */}

      <View>

        <AppText
          weight="semibold"
          className="mb-2"
        >
          Meeting Purpose
        </AppText>

        <CategoryDropdown
          value={values.purpose}
          options={meetingPurposeOptions}
          onChange={(value) =>
            setField(
              "purpose",
              value,
            )
          }
        />

      </View>

      {/* Preferred Date 1 */}

      <View>

        <AppText
          weight="semibold"
          className="mb-2"
        >
          Preferred Date
        </AppText>

        <TextInput
          value={values.preferredDate1}
          onChangeText={(text) =>
            setField(
              "preferredDate1",
              text,
            )
          }
          placeholder="YYYY-MM-DD"
          placeholderTextColor={
            colors.muted
          }
          className="h-12 rounded-lg border border-input bg-background px-4 text-text"
        />

      </View>

      {/* Preferred Time */}

      <View>

        <AppText
          weight="semibold"
          className="mb-2"
        >
          Preferred Time
        </AppText>

        <TextInput
          value={values.preferredTime1}
          onChangeText={(text) =>
            setField(
              "preferredTime1",
              text,
            )
          }
          placeholder="10:30 AM"
          placeholderTextColor={
            colors.muted
          }
          className="h-12 rounded-lg border border-input bg-background px-4 text-text"
        />

      </View>

      {/* Optional Date */}

      <View>

        <AppText
          weight="semibold"
          className="mb-2"
        >
          Alternate Date
        </AppText>

        <TextInput
          value={values.preferredDate2}
          onChangeText={(text) =>
            setField(
              "preferredDate2",
              text,
            )
          }
          placeholder="YYYY-MM-DD"
          placeholderTextColor={
            colors.muted
          }
          className="h-12 rounded-lg border border-input bg-background px-4 text-text"
        />

      </View>

      {/* Alternate Time */}

      <View>

        <AppText
          weight="semibold"
          className="mb-2"
        >
          Alternate Time
        </AppText>

        <TextInput
          value={values.preferredTime2}
          onChangeText={(text) =>
            setField(
              "preferredTime2",
              text,
            )
          }
          placeholder="3:00 PM"
          placeholderTextColor={
            colors.muted
          }
          className="h-12 rounded-lg border border-input bg-background px-4 text-text"
        />

      </View>

      {/* Investment */}

      <View>

        <AppText
          weight="semibold"
          className="mb-2"
        >
          Expected Investment
        </AppText>

        <TextInput
          value={
            values.expectedInvestment
          }
          onChangeText={(text) =>
            setField(
              "expectedInvestment",
              text,
            )
          }
          placeholder="₹ 25,00,000"
          placeholderTextColor={
            colors.muted
          }
          keyboardType="numeric"
          className="h-12 rounded-lg border border-input bg-background px-4 text-text"
        />

      </View>

      {/* Message */}

      <View>

        <AppText
          weight="semibold"
          className="mb-2"
        >
          Message
        </AppText>

        <TextInput
          multiline
          numberOfLines={5}
          value={values.message}
          onChangeText={(text) =>
            setField(
              "message",
              text,
            )
          }
          placeholder="Briefly describe why you'd like to meet..."
          placeholderTextColor={
            colors.muted
          }
          className="min-h-[120px] rounded-lg border border-input bg-background p-4 text-text"
        />

      </View>

      {/* Buttons */}

      <View className="mt-4 flex-row gap-3">

        <AppButton
          label="Cancel"
          variant="outline"
          className="flex-1"
          onPress={onCancel}
        />

        <AppButton
          label="Send Request"
          className="flex-1"
          loading={isSubmitting}
          disabled={!canSubmit}
          onPress={() =>
            void handleSubmit()
          }
        />

      </View>

    </View>
  );
};