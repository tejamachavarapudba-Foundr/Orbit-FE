import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from "react-native";

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
    <AppScreen withHorizontalPadding={false}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View className="min-h-full flex-grow px-4 pb-10 pt-2">
          <AuthHeader />
          <View className="flex-1 justify-center">
            <AuthCard title="Welcome back" subtitle="Sign in to your account.">
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
              <AppTextInput
                label="Password"
                value={values.password}
                error={fieldErrors.password}
                secureTextEntry
                autoComplete="password"
                placeholder="At least 6 characters"
                className="h-11 text-base"
                onChangeText={(value) => setValue("password", value)}
              />
              <AppButton label="Sign in" loading={isSubmitting} onPress={() => void submit()} className="mt-1" />
              <AppButton
                label="Forgot password?"
                variant="link"
                size="default"
                onPress={() => navigation.navigate("ForgotPassword")}
              />
            </AuthCard>

            <View className="mt-6 flex-row flex-wrap justify-center">
              <AppText tone="muted" size="sm">
                New to Startuphouze?{" "}
              </AppText>
              <Pressable accessibilityRole="button" onPress={() => navigation.navigate("Register")}>
                <AppText tone="primary" size="sm" weight="medium" className="underline">
                  Create one
                </AppText>
              </Pressable>
            </View>

            <AppButton label="Back" variant="ghost" size="default" onPress={() => navigation.navigate("Welcome")} className="mt-4" />
          </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </AppScreen>
  );
};
