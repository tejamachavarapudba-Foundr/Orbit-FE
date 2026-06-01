import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";

import { AuthStackParamList } from "@/app/navigation/types";
import { AppButton } from "@/components/ui/AppButton";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { AppTextInput } from "@/components/ui/AppTextInput";
import { AuthCard } from "@/modules/auth/components/AuthCard";
import { AuthErrorBanner } from "@/modules/auth/components/AuthErrorBanner";
import { AuthHeader } from "@/modules/auth/components/AuthHeader";
import { useRegisterForm } from "@/modules/auth/hooks";

type RegisterScreenProps = NativeStackScreenProps<AuthStackParamList, "Register">;

export const RegisterScreen = ({ navigation }: RegisterScreenProps) => {
  const { values, fieldErrors, isSubmitting, errorMessage, setValue, submit } = useRegisterForm();

  return (
    <AppScreen>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <AuthHeader />
          <AuthCard title="Join Startuphouze" subtitle="Create your account in seconds.">
            <AuthErrorBanner message={errorMessage} />
            <AppTextInput
              label="Full name"
              value={values.fullName}
              error={fieldErrors.fullName}
              autoCapitalize="words"
              autoComplete="name"
              onChangeText={(value) => setValue("fullName", value)}
            />
            <AppTextInput
              label="Email"
              value={values.email}
              error={fieldErrors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              onChangeText={(value) => setValue("email", value)}
            />
            <AppTextInput
              label="Password"
              value={values.password}
              error={fieldErrors.password}
              secureTextEntry
              autoComplete="new-password"
              onChangeText={(value) => setValue("password", value)}
            />
            <AppButton label="Create account" loading={isSubmitting} onPress={() => void submit()} className="mt-2" />
          </AuthCard>
          <View className="mt-8 flex-row justify-center">
            <AppText tone="muted">Already joined? </AppText>
            <AppText tone="primary" weight="semibold" onPress={() => navigation.navigate("Login")}>
              Sign in
            </AppText>
          </View>
          <AppButton label="Back" variant="ghost" onPress={() => navigation.navigate("Welcome")} className="mt-2" />
        </ScrollView>
      </KeyboardAvoidingView>
    </AppScreen>
  );
};
