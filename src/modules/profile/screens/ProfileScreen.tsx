import { useEffect } from "react";
import { Alert, Pressable, ScrollView, Switch, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppButton } from "@/components/ui/AppButton";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { AppTextInput } from "@/components/ui/AppTextInput";
import { Avatar } from "@/components/ui/Avatar";
import { BottomSheetMultiSelect } from "@/components/ui/BottomSheetMultiSelect";
import { LANGUAGE_OPTIONS } from "@/constants/languageOptions";
import { ONBOARDING_ROLES } from "@/constants/memberRoles";
import { AuthErrorBanner } from "@/modules/auth/components/AuthErrorBanner";
import { useAuthStore } from "@/modules/auth/store";
import { ProfileCompletionBar } from "@/modules/onboarding/components/ProfileCompletionBar";
import { RoleProfileSection } from "@/modules/profile/components/RoleProfileSection";
import { useProfileForm } from "@/modules/profile/hooks";
import { useUserStore } from "@/modules/user/store";
import { useToastStore } from "@/store/toastStore";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { ResumeCard } from "@/components/profile/ResumeCard";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { iconSize } from "@/theme/designTokens";
import * as DocumentPicker from 'expo-document-picker';

export const ProfileScreen = () => {
  const colors = useThemeTokens();
  const navigation = useNavigation<any>();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const deleteAccount = useUserStore((state) => state.deleteAccount);
  const isDeletingAccount = useUserStore((state) => state.isDeletingAccount);
  const showToast = useToastStore((state) => state.show);
  const {
    profile,
    values,
    memberRole,
    profileCompletion,
    errorMessage,
    isSaving,
    isAvatarSaving,    
    isResumeSaving,
    setValue,
    setRoleProfile,
    ensureRoleProfile,
    submit,
    submitAvatar,
    submitResume,
    submitResumeDelete,
  } = useProfileForm();

  useEffect(() => {
    ensureRoleProfile();
  }, [ensureRoleProfile, values.role]);

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
  const handleAvatarUpload = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        showToast({
          type: "error",
          title: "Permission needed",
          message: "Allow photo library access in your device settings to update your photo."
        });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.8,
        allowsEditing: true,
        aspect: [1, 1]
      });

      const asset = result.canceled ? undefined : result.assets[0];
      if (!asset) return;

      const formData = new FormData();
      formData.append(
        "file",
        {
          uri: asset.uri,
          name: asset.fileName ?? "avatar.jpg",
          type: asset.mimeType ?? "image/jpeg"
        } as any
      );

      const success = await submitAvatar(formData);
      if (!success) {
        showToast({ type: "error", title: "Photo upload failed" });
      }
    } catch (error) {
      console.error(error);
      showToast({ type: "error", title: "Photo upload failed" });
    }
  };

  const handleResumeUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ],
        copyToCacheDirectory: true,
        multiple: false,
      });
  
      const file = result.assets?.[0];
      if (result.canceled || !file) {
        return;
      }

      const formData = new FormData();
  
      formData.append(
        "file",
        {
          uri: file.uri,
          name: file.name,
          type: file.mimeType || "application/octet-stream",
        } as any,
      );
  
      const success = await submitResume(formData);
  
      if (success) {
        showToast({
          type: "success",
          title: "Resume uploaded",
        });
      }
    } catch (error) {
      console.error(error);
  
      showToast({
        type: "error",
        title: "Resume upload failed",
      });
    }
  };
  const roleLabel = ONBOARDING_ROLES.find((role) => role.value === memberRole)?.label ?? values.role;

  const handleResumeDelete = async () => {
    Alert.alert(
      "Delete Resume",
      "Are you sure you want to delete your resume?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await submitResumeDelete();
          },
        },
      ],
    );
  };

  return (
    <AppScreen>
      <AppHeader />
      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View className="mt-6 flex-row items-center gap-2">
          <AppText size="2xl" weight="bold">
            Profile
          </AppText>
          {user?.profile?.identityVerified ? <VerifiedBadge size="md" /> : null}
        </View>
        <AppText tone="muted" className="mt-2">
          {user?.email ?? "Complete your Startuphouze profile."}
        </AppText>

        <View className="mt-5 items-center">
          <Pressable accessibilityRole="button" accessibilityLabel="Change profile photo" onPress={() => void handleAvatarUpload()}>
            <Avatar name={values.fullName || "?"} imageUrl={values.avatarUrl} size="xl" fallback="mesh" />
            <View className="absolute bottom-0 right-0 h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-primary">
              {isAvatarSaving ? (
                <Feather name="loader" size={14} color={colors.onPrimary} />
              ) : (
                <Feather name="camera" size={14} color={colors.onPrimary} />
              )}
            </View>
          </Pressable>
        </View>

        <View className="mt-6">
          <ProfileCompletionBar percent={profileCompletion} role={memberRole} />
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
          <View className="gap-2">
            <AppText size="sm" weight="medium">
              Language
            </AppText>
            <BottomSheetMultiSelect
              value={values.language ? values.language.split(",").map((item) => item.trim()).filter(Boolean) : []}
              options={LANGUAGE_OPTIONS}
              onChange={(value) => setValue("language", value.join(", "))}
              placeholder="Select languages"
              title="Language"
            />
          </View>
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
            {memberRole === "founder" ? (
              <AppTextInput
                label="Company / startup name"
                value={values.company}
                onChangeText={(value) => setValue("company", value)}
              />
            ) : null}
            <RoleProfileSection role={values.role} roleProfile={values.roleProfile} onChange={setRoleProfile} />
            {memberRole !== "advisor" && memberRole !== "professional" ? (
              <AppTextInput
                label="Website"
                value={values.website}
                autoCapitalize="none"
                keyboardType="url"
                onChangeText={(value) => setValue("website", value)}
              />
            ) : null}
            {memberRole === "professional" ? (
              <AppTextInput label="Skills" value={values.skills} onChangeText={(value) => setValue("skills", value)} />
            ) : null}
          </View>
        ) : null}

        <View className="mt-4">
          <AppButton label="Save profile" loading={isSaving} onPress={() => void submit()} />
        </View>

        <ResumeCard
          profile={profile}
          isUploading={isResumeSaving}
          onUpload={() => void handleResumeUpload()}
          onReplace={() => void handleResumeUpload()}
          onDelete={() => void handleResumeDelete()}
        />

        <View className="mb-8 mt-4 gap-3">
          <AppButton label="Sign out" variant="outline" onPress={() => void logout()} />
          <AppButton label="Delete account" variant="ghost" loading={isDeletingAccount} onPress={confirmDeleteAccount} />
        </View>
      </ScrollView>
    </AppScreen>
  );
};
