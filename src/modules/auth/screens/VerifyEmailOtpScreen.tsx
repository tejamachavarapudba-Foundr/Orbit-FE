import { useEffect, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, TextInput, View } from "react-native";

import { AppButton } from "@/components/ui/AppButton";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { AuthCard } from "@/modules/auth/components/AuthCard";
import { AuthErrorBanner } from "@/modules/auth/components/AuthErrorBanner";
import { AuthHeader } from "@/modules/auth/components/AuthHeader";
import { authApi } from "@/modules/auth/api";
import { useAuthStore } from "@/modules/auth/store";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { toAppError } from "@/utils/errors";

const RESEND_COOLDOWN_SECONDS = 30;

export const VerifyEmailOtpScreen = () => {
  const colors = useThemeTokens();
  const email = useAuthStore((state) => state.user?.email ?? "");
  const markEmailVerified = useAuthStore((state) => state.markEmailVerified);
  const clearJustRegistered = useAuthStore((state) => state.clearJustRegistered);

  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState("We sent a 6-digit code to your email.");
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

  const verify = async () => {
    if (code.trim().length !== 6) return;
    setIsVerifying(true);
    setErrorMessage(null);
    try {
      await authApi.verifyEmailOtp({ email, code: code.trim() });
      markEmailVerified();
      clearJustRegistered();
    } catch (error) {
      setErrorMessage(toAppError(error).message);
    } finally {
      setIsVerifying(false);
    }
  };

  const resend = async () => {
    if (cooldown > 0) return;
    setIsResending(true);
    setErrorMessage(null);
    try {
      await authApi.resendVerification({ email });
      setCode("");
      setInfoMessage("New code sent — check your email.");
      startCooldown();
    } catch (error) {
      setErrorMessage(toAppError(error).message);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AppScreen withHorizontalPadding={false}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View className="min-h-full flex-grow px-4 pb-10 pt-2">
            <AuthHeader />
            <View className="flex-1 justify-center">
              <AuthCard title="Confirm your email" subtitle={`We sent a code to ${email || "your email"}.`}>
                <AuthErrorBanner message={errorMessage} />
                <AppText tone="muted" size="sm">
                  {infoMessage}
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
                <AppButton
                  label="Verify"
                  loading={isVerifying}
                  disabled={code.trim().length !== 6}
                  onPress={() => void verify()}
                  className="mt-1"
                />
                <AppButton
                  label={cooldown > 0 ? `Resend code (${cooldown}s)` : "Resend code"}
                  variant="outline"
                  loading={isResending}
                  disabled={cooldown > 0}
                  onPress={() => void resend()}
                />
              </AuthCard>

              <AppButton
                label="Skip for now"
                variant="ghost"
                size="default"
                onPress={() => clearJustRegistered()}
                className="mt-4"
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </AppScreen>
  );
};
