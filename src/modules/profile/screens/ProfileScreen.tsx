import { Alert, ScrollView, Switch, View } from "react-native";

import { AppButton } from "@/components/ui/AppButton";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { AppTextInput } from "@/components/ui/AppTextInput";
import { AuthErrorBanner } from "@/modules/auth/components/AuthErrorBanner";
import { useAuthStore } from "@/modules/auth/store";
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
  const { values, errorMessage, isSaving, isAvatarSaving, setValue, submit, submitAvatar } = useProfileForm();

  const handleDeleteAccount = async () => {
    const didDelete = await deleteAccount();
    if (didDelete) {
      showToast({ type: "success", title: "Account deleted", message: "Your Startuphouze account was removed." });
      await logout();
    }
  };

  const confirmDeleteAccount = () => {
    Alert.alert("Delete account?", "This will remove your Startuphouze account and sign you out.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => void handleDeleteAccount() }
    ]);
  };

  return (
    <AppScreen>
      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <AppText size="2xl" weight="bold" className="mt-6">
          Profile
        </AppText>
        <AppText tone="muted" className="mt-2">
          {user?.email ?? "Complete your Startuphouze profile."}
        </AppText>

        <View className="mt-6 gap-4 rounded-md border border-border bg-surface p-4 shadow-sm">
          <AuthErrorBanner message={errorMessage} />
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
          <AppTextInput label="Role" value={values.role} onChangeText={(value) => setValue("role", value)} />
          <AppTextInput label="Location" value={values.location} onChangeText={(value) => setValue("location", value)} />
          <AppTextInput label="Company" value={values.company} onChangeText={(value) => setValue("company", value)} />
          <AppTextInput
            label="Website"
            value={values.website}
            autoCapitalize="none"
            keyboardType="url"
            onChangeText={(value) => setValue("website", value)}
          />
          <AppTextInput
            label="LinkedIn URL"
            value={values.linkedinUrl}
            autoCapitalize="none"
            keyboardType="url"
            onChangeText={(value) => setValue("linkedinUrl", value)}
          />
          <AppTextInput
            label="Skills"
            value={values.skills}
            placeholder="JavaScript, Node.js"
            onChangeText={(value) => setValue("skills", value)}
          />
          <AppTextInput
            label="Looking for"
            value={values.lookingFor}
            placeholder="collaboration, funding"
            onChangeText={(value) => setValue("lookingFor", value)}
          />

          <View className="flex-row items-center justify-between rounded-md border border-border px-4 py-3">
            <View className="flex-1 pr-4">
              <AppText weight="semibold">Open to connect</AppText>
              <AppText tone="muted" size="sm" className="mt-1">
                Show a green availability signal on your profile.
              </AppText>
            </View>
            <Switch
              value={values.openToConnect}
              onValueChange={(value) => setValue("openToConnect", value)}
              thumbColor={values.openToConnect ? colors.primary : colors.border}
            />
          </View>

          <AppButton label="Save profile" loading={isSaving} onPress={() => void submit()} />
        </View>

        <View className="mt-4 gap-4 rounded-md border border-border bg-surface p-4 shadow-sm">
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
