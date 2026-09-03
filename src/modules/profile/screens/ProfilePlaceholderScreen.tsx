import { Alert } from "react-native";

import { AppButton } from "@/components/ui/AppButton";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { useAuthStore } from "@/modules/auth/store";
import { useToastStore } from "@/store/toastStore";
import { useUserStore } from "@/modules/user/store";

export const ProfilePlaceholderScreen = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const deleteAccount = useUserStore((state) => state.deleteAccount);
  const isDeletingAccount = useUserStore((state) => state.isDeletingAccount);
  const showToast = useToastStore((state) => state.show);

  const confirmDeleteAccount = () => {
    Alert.alert("Delete account?", "This will remove your Orbit account and sign you out.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => void handleDeleteAccount() }
    ]);
  };

  const handleDeleteAccount = async () => {
    const didDelete = await deleteAccount();

    if (didDelete) {
      showToast({ type: "success", title: "Account deleted", message: "Your Orbit account was removed." });
      await logout();
    }
  };

  return (
    <AppScreen>
      <AppText size="2xl" weight="bold" className="mt-8">
        Profile
      </AppText>
      <AppText tone="muted" className="mt-2">
        {user?.email ?? "Your profile module will be built next."}
      </AppText>
      <AppButton label="Sign out" variant="outline" onPress={() => void logout()} className="mt-8" />
      <AppButton
        label="Delete account"
        variant="ghost"
        loading={isDeletingAccount}
        onPress={confirmDeleteAccount}
        className="mt-3"
      />
    </AppScreen>
  );
};
