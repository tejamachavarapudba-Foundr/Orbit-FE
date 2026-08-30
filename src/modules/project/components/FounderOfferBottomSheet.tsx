import { useEffect, useState } from "react";
import { Modal, Pressable, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { AppTextInput } from "@/components/ui/AppTextInput";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { iconSize } from "@/theme/designTokens";

type FounderOfferBottomSheetProps = {
  askAmount: string;
  equityPercent: string;
  onChange: (value: { askAmount: string; equityPercent: string }) => void;
};

/** Both halves of the offer (ask amount + equity %) live behind one trigger,
 * matching the other bottom-sheet fields elsewhere in onboarding/profile. */
export const FounderOfferBottomSheet = ({ askAmount, equityPercent, onChange }: FounderOfferBottomSheetProps) => {
  const colors = useThemeTokens();
  const [open, setOpen] = useState(false);
  const [draftAsk, setDraftAsk] = useState(askAmount);
  const [draftEquity, setDraftEquity] = useState(equityPercent);

  useEffect(() => {
    if (open) {
      setDraftAsk(askAmount);
      setDraftEquity(equityPercent);
    }
  }, [open, askAmount, equityPercent]);

  const summary = askAmount && equityPercent ? `${askAmount} for ${equityPercent}%` : askAmount || equityPercent ? `${askAmount}${equityPercent ? ` · ${equityPercent}%` : ""}` : "";

  return (
    <>
      <Pressable
        accessibilityRole="button"
        onPress={() => setOpen(true)}
        className={`h-11 w-full flex-row items-center justify-between rounded-t-lg border-b-2 bg-surface-elevated px-3 ${
          open ? "border-primary" : "border-input"
        }`}
      >
        <AppText size="sm" weight="medium" numberOfLines={1} className="mr-2 flex-1">
          {summary || "Add founder's offer"}
        </AppText>
        <Feather name="chevron-down" size={16} color={colors.muted} />
      </Pressable>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <View className="flex-1 justify-end">
          <Pressable
            accessibilityRole="button"
            className="absolute bottom-0 left-0 right-0 top-0 bg-black/50"
            onPress={() => setOpen(false)}
          />
          <View className="rounded-t-2xl bg-card p-4">
            <View className="flex-row items-center justify-between">
              <AppText weight="bold" size="lg">
                Founder&apos;s Offer
              </AppText>
              <Pressable accessibilityRole="button" onPress={() => setOpen(false)} hitSlop={8}>
                <Feather name="x" size={iconSize.lg} color={colors.text} />
              </Pressable>
            </View>

            <View className="mt-4 gap-4">
              <AppTextInput label="Ask" value={draftAsk} onChangeText={setDraftAsk} placeholder="e.g. ₹50 Lakh" />
              <AppTextInput
                label="Equity %"
                value={draftEquity}
                onChangeText={(value) => setDraftEquity(value.replace(/[^0-9.]/g, ""))}
                placeholder="e.g. 5"
                keyboardType="decimal-pad"
              />
            </View>

            <AppButton
              label="Done"
              className="mt-4"
              onPress={() => {
                onChange({ askAmount: draftAsk.trim(), equityPercent: draftEquity.trim() });
                setOpen(false);
              }}
            />
          </View>
        </View>
      </Modal>
    </>
  );
};
