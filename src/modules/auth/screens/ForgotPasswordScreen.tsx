import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";

import { AuthStackParamList } from "@/app/navigation/types";
import { AppButton } from "@/components/ui/AppButton";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppTextInput } from "@/components/ui/AppTextInput";
import { AuthCard } from "@/modules/auth/components/AuthCard";
import { AuthErrorBanner } from "@/modules/auth/components/AuthErrorBanner";
import { AuthHeader } from "@/modules/auth/components/AuthHeader";
import { useForgotPasswordForm } from "@/modules/auth/hooks";

type ForgotPasswordScreenProps = NativeStackScreenProps<AuthStackParamList, "ForgotPassword">;

export const ForgotPasswordScreen = ({ navigation }: ForgotPasswordScreenProps) => {
  const { values, fieldErrors, isSubmitting, errorMessage, setValue, submit } = useForgotPasswordForm();

  return (
    <AppScreen>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <AuthHeader />
          <AuthCard title="Reset password" subtitle="We will send recovery steps to your registered email.">
            <AuthErrorBanner message={errorMessage} />
            <AppTextInput
              label="Email"
              value={values.email}
              error={fieldErrors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              onChangeText={(value) => setValue("email", value)}
            />
            <AppButton label="Send reset link" loading={isSubmitting} onPress={() => void submit()} className="mt-2" />
            <AppButton label="Back to sign in" variant="ghost" onPress={() => navigation.navigate("Login")} />
          </AuthCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </AppScreen>
  );
};
