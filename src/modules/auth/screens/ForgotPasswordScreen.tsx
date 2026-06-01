import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";

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
    <AppScreen withHorizontalPadding={false}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View className="min-h-full flex-grow px-4 pb-10 pt-2">
          <AuthHeader />
          <View className="flex-1 justify-center">
            <AuthCard title="Reset password" subtitle="We will send recovery steps to your registered email.">
              <AuthErrorBanner message={errorMessage} />
              <AppTextInput
                label="Email"
                value={values.email}
                error={fieldErrors.email}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                placeholder="you@startup.com"
                className="h-11 text-base"
                onChangeText={(value) => setValue("email", value)}
              />
              <AppButton label="Send reset link" loading={isSubmitting} onPress={() => void submit()} className="mt-1" />
              <AppButton label="Back to sign in" variant="link" size="default" onPress={() => navigation.navigate("Login")} />
            </AuthCard>
          </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </AppScreen>
  );
};
