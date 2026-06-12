import { useEffect } from "react";
import { Alert, ScrollView, Switch, View } from "react-native";

import { AppHeader } from "@/components/layout/AppHeader";
import { AppButton } from "@/components/ui/AppButton";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { AppTextInput } from "@/components/ui/AppTextInput";
import { ONBOARDING_ROLES } from "@/constants/memberRoles";
import { AuthErrorBanner } from "@/modules/auth/components/AuthErrorBanner";
import { useAuthStore } from "@/modules/auth/store";
import { ProfileCompletionBar } from "@/modules/onboarding/components/ProfileCompletionBar";
import { RoleProfileSection } from "@/modules/profile/components/RoleProfileSection";
import { useProfileForm } from "@/modules/profile/hooks";
import { useUserStore } from "@/modules/user/store";
import { useToastStore } from "@/store/toastStore";
import { useThemeTokens } from "@/hooks/useThemeTokens";

export const ProfileScreen = () => {
  const colors = useThemeTokens();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const deleteAccount = useUserStore((state) => state.deleteAccount);
  const isDeletingAccount = useUserStore((state) => state.isDeletingAccount);
  const showToast = useToastStore((state) => state.show);
  const {
    values,
    memberRole,
    profileCompletion,
    errorMessage,
    isSaving,
    isAvatarSaving,
    setValue,
    setRoleProfile,
    ensureRoleProfile,
    submit,
    submitAvatar
  } = useProfileForm();

  useEffect(() => {
    ensureRoleProfile();
  }, [ensureRoleProfile, values.role]);

  const handleDeleteAccount = async () => {
    const didDelete = await deleteAccount();
    if (didDelete) {
      showToast({ type: "success", title: "Account deleted", message: "Your Foundr account was removed." });
      await logout();
    }
  };

  const confirmDeleteAccount = () => {
    Alert.alert("Delete account?", "This will remove your Foundr account and sign you out.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => void handleDeleteAccount() }
    ]);
  };

  const roleLabel = ONBOARDING_ROLES.find((role) => role.value === memberRole)?.label ?? values.role;

  return (
    <AppScreen>
      <AppHeader />
      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <AppText size="2xl" weight="bold" className="mt-6">
          Profile
        </AppText>
        <AppText tone="muted" className="mt-2">
          {user?.email ?? "Complete your Foundr profile."}
        </AppText>

        <View className="mt-6">
          <ProfileCompletionBar percent={profileCompletion} />
        </View>

        <View className="mt-6 gap-4 rounded-md border border-border bg-surface p-4">
          <AuthErrorBanner message={errorMessage} />
          <AppText weight="bold">{roleLabel} · Shared details</AppText>
          <AppTextInput label="Full name" value={values.fullName} onChangeText={(value) => setValue("fullName", value)} />
          <AppTextInput label="Headline" value={values.headline} onChangeText={(value) => setValue("headline", value)} />
          <AppTextInput
            label="Bio"
            value={values.bio}
            multiline
            textAlignVertical="top"
            onChangeText={(value) => setValue("bio", value)}
            className="h-24 py-3"
          />
          <AppTextInput label="Location" value={values.location} onChangeText={(value) => setValue("location", value)} />
          <AppTextInput
            label="LinkedIn URL"
            value={values.linkedinUrl}
            autoCapitalize="none"
            keyboardType="url"
            onChangeText={(value) => setValue("linkedinUrl", value)}
          />
          <AppTextInput
            label="Looking for / goals"
            value={values.lookingFor}
            placeholder="co_founder, investor, customers"
            onChangeText={(value) => setValue("lookingFor", value)}
          />

          <View className="flex-row items-center justify-between rounded-md border border-border px-4 py-3">
            <View className="flex-1 pr-4">
              <AppText weight="semibold">Open to connect</AppText>
              <AppText tone="muted" size="sm" className="mt-1">
                Show availability on your profile.
              </AppText>
            </View>
            <Switch
              value={values.openToConnect}
              onValueChange={(value) => setValue("openToConnect", value)}
              thumbColor={values.openToConnect ? colors.primary : colors.border}
            />
          </View>
        </View>

        {memberRole ? (
          <View className="mt-4 gap-4 rounded-md border border-border bg-surface p-4">
            <AppText weight="bold">{roleLabel} · Role details</AppText>
            <RoleProfileSection role={values.role} roleProfile={values.roleProfile} onChange={setRoleProfile} />
            <AppTextInput label="Company / startup" value={values.company} onChangeText={(value) => setValue("company", value)} />
            <AppTextInput
              label="Website"
              value={values.website}
              autoCapitalize="none"
              keyboardType="url"
              onChangeText={(value) => setValue("website", value)}
            />
            {memberRole === "professional" ? (
              <AppTextInput label="Skills" value={values.skills} onChangeText={(value) => setValue("skills", value)} />
            ) : null}
          </View>
        ) : null}

        <View className="mt-4">
          <AppButton label="Save profile" loading={isSaving} onPress={() => void submit()} />
        </View>

        <View className="mt-4 gap-4 rounded-md border border-border bg-surface p-4">
          <AppText size="lg" weight="bold">
            Avatar
          </AppText>
          <AppTextInput
            label="Avatar URL"
            value={values.avatarUrl}
            autoCapitalize="none"
            keyboardType="url"
            placeholder="https://dicebear.com/..."
            onChangeText={(value) => setValue("avatarUrl", value)}
          />
          <AppButton label="Update avatar" variant="outline" loading={isAvatarSaving} onPress={() => void submitAvatar()} />
        </View>

        <View className="mb-8 mt-4 gap-3">
          <AppButton label="Sign out" variant="outline" onPress={() => void logout()} />
          <AppButton label="Delete account" variant="ghost" loading={isDeletingAccount} onPress={confirmDeleteAccount} />
        </View>
      </ScrollView>
    </AppScreen>
  );
};
