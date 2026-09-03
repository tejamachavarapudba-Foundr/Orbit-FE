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
import { useRegisterForm } from "@/modules/auth/hooks";

type RegisterScreenProps = NativeStackScreenProps<AuthStackParamList, "Register">;

export const RegisterScreen = ({ navigation }: RegisterScreenProps) => {
  const { values, fieldErrors, isSubmitting, errorMessage, setValue, submit } = useRegisterForm();

  return (
    <AppScreen withHorizontalPadding={false}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View className="min-h-full flex-grow px-4 pb-10 pt-2">
          <AuthHeader />
          <View className="flex-1 justify-center">
            <AuthCard title="Join Orbit" subtitle="Create your account in seconds.">
              <AuthErrorBanner message={errorMessage} />
              <AppTextInput
                label="Full name"
                value={values.fullName}
                error={fieldErrors.fullName}
                autoCapitalize="words"
                autoComplete="name"
                placeholder="Ada Lovelace"
                className="h-11 text-base"
                onChangeText={(value) => setValue("fullName", value)}
              />
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
                autoComplete="new-password"
                placeholder="8+ chars, upper, lower, number & symbol"
                className="h-11 text-base"
                onChangeText={(value) => setValue("password", value)}
              />
              <AppButton label="Create account" loading={isSubmitting} onPress={() => void submit()} className="mt-1" />
            </AuthCard>

            <View className="mt-6 flex-row flex-wrap justify-center">
              <AppText tone="muted" size="sm">
                Already have an account?{" "}
              </AppText>
              <Pressable accessibilityRole="button" onPress={() => navigation.navigate("Login")}>
                <AppText tone="primary" size="sm" weight="medium" className="underline">
                  Sign in
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
