import { useCallback, useMemo, useState } from "react";

import { authApi } from "@/modules/auth/api";
import { ForgotPasswordPayload, LoginPayload, RegisterPayload, ResetPasswordPayload } from "@/modules/auth/types";
import { useAuthStore } from "@/modules/auth/store";
import { useToastStore } from "@/store/toastStore";
import { toAppError } from "@/utils/errors";
import { PASSWORD_REQUIREMENTS_MESSAGE, isStrongPassword } from "@/utils/validation";

type FieldErrors<T extends Record<string, string>> = Partial<Record<keyof T, string>>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const useLoginForm = () => {
  const login = useAuthStore((state) => state.login);
  const isSubmitting = useAuthStore((state) => state.isSubmitting);
  const errorMessage = useAuthStore((state) => state.errorMessage);
  const [values, setValues] = useState<LoginPayload>({ email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<LoginPayload>>({});

  const setValue = useCallback(<K extends keyof LoginPayload>(key: K, value: LoginPayload[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
  }, []);

  const validate = useCallback(() => {
    const nextErrors: FieldErrors<LoginPayload> = {};

    if (!emailPattern.test(values.email.trim())) {
      nextErrors.email = "Enter a valid email.";
    }

    if (values.password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters.";
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }, [values]);

  const submit = useCallback(async () => {
    if (!validate()) {
      return false;
    }

    return login({ email: values.email.trim(), password: values.password });
  }, [login, validate, values]);

  return useMemo(
    () => ({ values, fieldErrors, isSubmitting, errorMessage, setValue, submit }),
    [errorMessage, fieldErrors, isSubmitting, setValue, submit, values]
  );
};

export const useRegisterForm = () => {
  const register = useAuthStore((state) => state.register);
  const isSubmitting = useAuthStore((state) => state.isSubmitting);
  const errorMessage = useAuthStore((state) => state.errorMessage);
  const [values, setValues] = useState<RegisterPayload>({ fullName: "", email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<RegisterPayload>>({});

  const setValue = useCallback(<K extends keyof RegisterPayload>(key: K, value: RegisterPayload[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
  }, []);

  const validate = useCallback(() => {
    const nextErrors: FieldErrors<RegisterPayload> = {};

    if (values.fullName.trim().length < 2) {
      nextErrors.fullName = "Enter your full name.";
    }

    if (!emailPattern.test(values.email.trim())) {
      nextErrors.email = "Enter a valid email.";
    }

    if (!isStrongPassword(values.password)) {
      nextErrors.password = PASSWORD_REQUIREMENTS_MESSAGE;
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }, [values]);

  const submit = useCallback(async () => {
    if (!validate()) {
      return false;
    }

    return register({
      fullName: values.fullName.trim(),
      email: values.email.trim(),
      password: values.password
    });
  }, [register, validate, values]);

  return useMemo(
    () => ({ values, fieldErrors, isSubmitting, errorMessage, setValue, submit }),
    [errorMessage, fieldErrors, isSubmitting, setValue, submit, values]
  );
};

export const useForgotPasswordForm = () => {
  const showToast = useToastStore((state) => state.show);
  const [values, setValues] = useState<ForgotPasswordPayload>({ email: "" });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<ForgotPasswordPayload>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const setValue = useCallback(<K extends keyof ForgotPasswordPayload>(key: K, value: ForgotPasswordPayload[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
  }, []);

  const validate = useCallback(() => {
    const nextErrors: FieldErrors<ForgotPasswordPayload> = {};

    if (!emailPattern.test(values.email.trim())) {
      nextErrors.email = "Enter a valid email.";
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }, [values.email]);

  const submit = useCallback(async () => {
    if (!validate()) {
      return false;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await authApi.forgotPassword({ email: values.email.trim() });
      showToast({ type: "success", title: "Check your email", message: response.message });
      setIsSubmitting(false);
      return true;
    } catch (error) {
      const appError = toAppError(error);
      setErrorMessage(appError.message);
      setIsSubmitting(false);
      return false;
    }
  }, [showToast, validate, values.email]);

  return useMemo(
    () => ({ values, fieldErrors, isSubmitting, errorMessage, setValue, submit }),
    [errorMessage, fieldErrors, isSubmitting, setValue, submit, values]
  );
};

export const useResetPasswordForm = (token: string) => {
  const showToast = useToastStore((state) => state.show);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<{ newPassword: string; confirmPassword: string }>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const validate = useCallback(() => {
    const nextErrors: FieldErrors<{ newPassword: string; confirmPassword: string }> = {};

    if (!isStrongPassword(newPassword)) {
      nextErrors.newPassword = PASSWORD_REQUIREMENTS_MESSAGE;
    }

    if (confirmPassword !== newPassword) {
      nextErrors.confirmPassword = "Passwords don't match.";
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }, [confirmPassword, newPassword]);

  const submit = useCallback(async () => {
    if (!validate()) {
      return false;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await authApi.resetPassword({ token, newPassword });
      showToast({ type: "success", title: "Password updated", message: response.message });
      setIsSubmitting(false);
      return true;
    } catch (error) {
      const appError = toAppError(error);
      setErrorMessage(appError.message);
      setIsSubmitting(false);
      return false;
    }
  }, [newPassword, showToast, token, validate]);

  return useMemo(
    () => ({ newPassword, confirmPassword, fieldErrors, isSubmitting, errorMessage, setNewPassword, setConfirmPassword, submit }),
    [confirmPassword, errorMessage, fieldErrors, isSubmitting, newPassword, submit]
  );
};
