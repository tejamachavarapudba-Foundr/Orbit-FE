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
import { useLoginForm } from "@/modules/auth/hooks";

type LoginScreenProps = NativeStackScreenProps<AuthStackParamList, "Login">;

export const LoginScreen = ({ navigation }: LoginScreenProps) => {
  const { values, fieldErrors, isSubmitting, errorMessage, setValue, submit } = useLoginForm();

  return (
    <AppScreen>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <AuthHeader />
          <AuthCard title="Sign in" subtitle="Grow your startup network with people who build.">
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
            <AppTextInput
              label="Password"
              value={values.password}
              error={fieldErrors.password}
              secureTextEntry
              autoComplete="password"
              onChangeText={(value) => setValue("password", value)}
            />
            <AppButton label="Sign in" loading={isSubmitting} onPress={() => void submit()} className="mt-2" />
            <AppButton
              label="Forgot password?"
              variant="ghost"
              onPress={() => navigation.navigate("ForgotPassword")}
            />
          </AuthCard>
          <View className="mt-8 flex-row justify-center">
            <AppText tone="muted">New here? </AppText>
            <AppText tone="primary" weight="semibold" onPress={() => navigation.navigate("Register")}>
              Create account
            </AppText>
          </View>
          <AppButton label="Back" variant="ghost" onPress={() => navigation.navigate("Welcome")} className="mt-2" />
        </ScrollView>
      </KeyboardAvoidingView>
    </AppScreen>
  );
};
