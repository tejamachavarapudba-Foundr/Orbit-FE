import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";

import { AuthStackParamList } from "@/app/navigation/types";
import { AppButton } from "@/components/ui/AppButton";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppTextInput } from "@/components/ui/AppTextInput";
import { AuthCard } from "@/modules/auth/components/AuthCard";
import { AuthErrorBanner } from "@/modules/auth/components/AuthErrorBanner";
import { AuthHeader } from "@/modules/auth/components/AuthHeader";
import { useResetPasswordForm } from "@/modules/auth/hooks";

type ResetPasswordScreenProps = NativeStackScreenProps<AuthStackParamList, "ResetPassword">;

export const ResetPasswordScreen = ({ navigation, route }: ResetPasswordScreenProps) => {
  const { token } = route.params;
  const { newPassword, confirmPassword, fieldErrors, isSubmitting, errorMessage, setNewPassword, setConfirmPassword, submit } =
    useResetPasswordForm(token);

  const handleSubmit = async () => {
    const success = await submit();
    if (success) navigation.navigate("Login");
  };

  return (
    <AppScreen withHorizontalPadding={false}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View className="min-h-full flex-grow px-4 pb-10 pt-2">
            <AuthHeader />
            <View className="flex-1 justify-center">
              <AuthCard title="Choose a new password" subtitle="Pick something you haven't used before.">
                <AuthErrorBanner message={errorMessage} />
                <AppTextInput
                  label="New password"
                  value={newPassword}
                  error={fieldErrors.newPassword}
                  secureTextEntry
                  autoComplete="password-new"
                  placeholder="8+ chars, upper, lower, number & symbol"
                  className="h-11 text-base"
                  onChangeText={setNewPassword}
                />
                <AppTextInput
                  label="Confirm password"
                  value={confirmPassword}
                  error={fieldErrors.confirmPassword}
                  secureTextEntry
                  autoComplete="password-new"
                  placeholder="Re-enter your new password"
                  className="h-11 text-base"
                  onChangeText={setConfirmPassword}
                />
                <AppButton label="Update password" loading={isSubmitting} onPress={() => void handleSubmit()} className="mt-1" />
                <AppButton label="Back to sign in" variant="link" size="default" onPress={() => navigation.navigate("Login")} />
              </AuthCard>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </AppScreen>
  );
};
