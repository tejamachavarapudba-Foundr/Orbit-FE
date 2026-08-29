import { useState } from "react";
import { Modal, Pressable, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { AppTextInput } from "@/components/ui/AppTextInput";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { iconSize } from "@/theme/designTokens";
import { useAuthStore } from "@/modules/auth/store";
import { useProfileStore } from "@/modules/profile/store";
import { normalizeAuthProfile } from "@/modules/profile/normalizeProfile";
import { UpdateProfilePayload } from "@/modules/profile/types";
import { useVerificationStatus } from "@/modules/verification/hooks";

type InvestorGateModalProps = {
  visible: boolean;
  onClose: () => void;
  onVerified: () => void;
};

/** Asks for company name + website before letting an investor open a startup's snapshot. */
export const InvestorGateModal = ({ visible, onClose, onVerified }: InvestorGateModalProps) => {
  const colors = useThemeTokens();
  const profile = useAuthStore((state) => state.user?.profile);
  const updateAuthProfile = useAuthStore((state) => state.updateProfile);
  const updateProfile = useProfileStore((state) => state.updateProfile);
  const isSaving = useProfileStore((state) => state.isSaving);
  const { loadStatus } = useVerificationStatus();

  const normalized = profile ? normalizeAuthProfile(profile) : undefined;
  const [company, setCompany] = useState(normalized?.company ?? "");
  const [website, setWebsite] = useState(normalized?.website ?? "");

  const submit = async () => {
    if (!normalized || !company.trim() || !website.trim()) return;

    const payload: UpdateProfilePayload = {
      fullName: normalized.fullName,
      headline: normalized.headline,
      bio: normalized.bio,
      role: normalized.role,
      location: normalized.location,
      language: normalized.language,
      company: company.trim(),
      website: website.trim(),
      linkedinUrl: normalized.linkedinUrl,
      skills: normalized.skills,
      lookingFor: normalized.lookingFor,
      openToConnect: normalized.openToConnect,
      onboardingGoals: normalized.onboardingGoals ?? [],
      roleProfile: normalized.roleProfile ?? null
    };

    const updated = await updateProfile(payload);
    if (!updated) return;

    updateAuthProfile(updated);
    await loadStatus();
    onVerified();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end">
        <Pressable accessibilityRole="button" className="absolute bottom-0 left-0 right-0 top-0 bg-black/50" onPress={onClose} />
        <View className="rounded-t-2xl bg-card p-4">
          <View className="flex-row items-center justify-between">
            <AppText weight="bold" size="lg">
              Verify to view snapshot
            </AppText>
            <Pressable accessibilityRole="button" onPress={onClose} hitSlop={8}>
              <Feather name="x" size={iconSize.lg} color={colors.text} />
            </Pressable>
          </View>

          <AppText tone="muted" size="sm" className="mt-2">
            Add your company name and website to unlock investor snapshots.
          </AppText>

          <View className="mt-4 gap-3">
            <AppTextInput label="Company name" value={company} onChangeText={setCompany} placeholder="e.g. Orbit Ventures" />
            <AppTextInput
              label="Website"
              value={website}
              onChangeText={setWebsite}
              autoCapitalize="none"
              placeholder="https://..."
            />
          </View>

          <AppButton
            label="Save and continue"
            loading={isSaving}
            disabled={!company.trim() || !website.trim()}
            onPress={() => void submit()}
            className="mt-4"
          />
        </View>
      </View>
    </Modal>
  );
};
