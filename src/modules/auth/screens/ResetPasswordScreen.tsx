import { useEffect, useRef, useState } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { KeyboardAvoidingView, Platform, ScrollView, TextInput, View } from "react-native";

import { AuthStackParamList } from "@/app/navigation/types";
import { AppButton } from "@/components/ui/AppButton";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { AppTextInput } from "@/components/ui/AppTextInput";
import { PasswordVisibilityToggle } from "@/components/ui/PasswordVisibilityToggle";
import { AuthCard } from "@/modules/auth/components/AuthCard";
import { AuthErrorBanner } from "@/modules/auth/components/AuthErrorBanner";
import { AuthHeader } from "@/modules/auth/components/AuthHeader";
import { useResetPasswordForm } from "@/modules/auth/hooks";
import { useThemeTokens } from "@/hooks/useThemeTokens";

const RESEND_COOLDOWN_SECONDS = 30;

type ResetPasswordScreenProps = NativeStackScreenProps<AuthStackParamList, "ResetPassword">;

export const ResetPasswordScreen = ({ navigation, route }: ResetPasswordScreenProps) => {
  const { email } = route.params;
  const colors = useThemeTokens();
  const {
    code,
    newPassword,
    confirmPassword,
    fieldErrors,
    isSubmitting,
    isResending,
    errorMessage,
    setCode,
    setNewPassword,
    setConfirmPassword,
    submit,
    resendCode
  } = useResetPasswordForm(email);
  const [showPassword, setShowPassword] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

  const startCooldown = () => {
    setCooldown(RESEND_COOLDOWN_SECONDS);
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setCooldown((current) => {
        if (current <= 1) {
          if (cooldownRef.current) clearInterval(cooldownRef.current);
          return 0;
        }
        return current - 1;
      });
    }, 1000);
  };

  const handleSubmit = async () => {
    const success = await submit();
    if (success) navigation.navigate("Login");
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    await resendCode();
    startCooldown();
  };

  return (
    <AppScreen withHorizontalPadding={false}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View className="min-h-full flex-grow px-4 pb-10 pt-2">
            <AuthHeader />
            <View className="flex-1 justify-center">
              <AuthCard title="Reset your password" subtitle={`Enter the code we sent to ${email} and choose a new password.`}>
                <AuthErrorBanner message={errorMessage} />
                <View className="gap-2">
                  <AppText size="sm" weight="medium">
                    Code
                  </AppText>
                  <TextInput
                    value={code}
                    onChangeText={(value) => setCode(value.replace(/[^0-9]/g, "").slice(0, 6))}
                    keyboardType="number-pad"
                    maxLength={6}
                    autoFocus
                    placeholder="000000"
                    placeholderTextColor={colors.muted}
                    selectionColor={colors.primary}
                    className="h-16 rounded-t-lg border-b-2 border-input bg-surface-elevated text-center text-3xl font-bold text-text"
                    style={{ letterSpacing: 12 }}
                  />
                  {fieldErrors.code ? (
                    <AppText tone="danger" size="sm">
                      {fieldErrors.code}
                    </AppText>
                  ) : null}
                </View>
                <AppTextInput
                  label="New password"
                  value={newPassword}
                  error={fieldErrors.newPassword}
                  secureTextEntry={!showPassword}
                  autoComplete="password-new"
                  placeholder="8+ chars, upper, lower, number & symbol"
                  className="h-11 text-base"
                  onChangeText={setNewPassword}
                  rightElement={<PasswordVisibilityToggle visible={showPassword} onToggle={() => setShowPassword((v) => !v)} />}
                />
                <AppTextInput
                  label="Confirm password"
                  value={confirmPassword}
                  error={fieldErrors.confirmPassword}
                  secureTextEntry={!showPassword}
                  autoComplete="password-new"
                  placeholder="Re-enter your new password"
                  className="h-11 text-base"
                  onChangeText={setConfirmPassword}
                  rightElement={<PasswordVisibilityToggle visible={showPassword} onToggle={() => setShowPassword((v) => !v)} />}
                />
                <AppButton label="Update password" loading={isSubmitting} onPress={() => void handleSubmit()} className="mt-1" />
                <AppButton
                  label={cooldown > 0 ? `Resend code (${cooldown}s)` : "Resend code"}
                  variant="outline"
                  loading={isResending}
                  disabled={cooldown > 0}
                  onPress={() => void handleResend()}
                />
                <AppButton label="Back to sign in" variant="link" size="default" onPress={() => navigation.navigate("Login")} />
              </AuthCard>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </AppScreen>
  );
};
