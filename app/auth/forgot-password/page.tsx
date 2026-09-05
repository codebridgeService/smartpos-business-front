"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AuthShell } from "@/components/layout";
import { TextInput, PasswordInput, Button, Alert } from "@/components/ui";
import { apiClient, ApiError } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import type {
  ForgotPasswordSendCodeResponse,
  VerifyResetCodeResponse,
  ApiMessageResponse,
} from "@/types";
import { Mail, KeyRound, Lock, CheckCircle2, ArrowLeft } from "lucide-react";

type Step = "request_otp" | "verify_otp" | "new_password" | "success";

export default function ForgotPasswordPage() {
  const toast = useToast();

  const [step, setStep] = useState<Step>("request_otp");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [otpUuid, setOtpUuid] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // ---------------------------------------------------------------------------
  // Step 1: Send OTP to Email
  // ---------------------------------------------------------------------------
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorBanner(null);
    setFieldErrors({});

    if (!email.trim()) {
      setFieldErrors({ email: "Email address is required" });
      return;
    }

    setIsLoading(true);

    try {
      const res = await apiClient.post<ForgotPasswordSendCodeResponse>(
        "/auth/forgot-password/send-code",
        { email: email.trim() },
        { skipAuth: true }
      );

      toast.success(res.message || "Verification code sent to your email.");
      setStep("verify_otp");
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.isValidationError() && err.errors?.email) {
          setFieldErrors({ email: err.errors.email[0] });
        } else {
          setErrorBanner(err.message);
        }
      } else {
        setErrorBanner("Failed to send verification code. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Step 2: Verify 6-digit OTP Code
  // ---------------------------------------------------------------------------
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorBanner(null);
    setFieldErrors({});

    if (!code.trim()) {
      setFieldErrors({ code: "Verification code is required" });
      return;
    }

    setIsLoading(true);

    try {
      const res = await apiClient.post<VerifyResetCodeResponse>(
        "/auth/verify-reset-code",
        { email: email.trim(), code: code.trim() },
        { skipAuth: true }
      );

      toast.success(res.message || "Code verified successfully.");
      setOtpUuid(res.otp_uuid);
      setStep("new_password");
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.status === 429) {
          setErrorBanner("Too many failed attempts. Please request a new code.");
        } else if (err.isValidationError() && err.errors?.code) {
          setFieldErrors({ code: err.errors.code[0] });
        } else {
          setErrorBanner(err.message);
        }
      } else {
        setErrorBanner("Invalid verification code.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Step 3: Reset Password
  // ---------------------------------------------------------------------------
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorBanner(null);
    setFieldErrors({});

    if (!password) {
      setFieldErrors({ password: "Password is required" });
      return;
    }
    if (password.length < 8) {
      setFieldErrors({ password: "Password must be at least 8 characters" });
      return;
    }
    if (password !== passwordConfirmation) {
      setFieldErrors({ password_confirmation: "Passwords do not match" });
      return;
    }

    setIsLoading(true);

    try {
      const res = await apiClient.post<ApiMessageResponse>(
        "/auth/reset-password",
        {
          email: email.trim(),
          otp_uuid: otpUuid,
          password,
          password_confirmation: passwordConfirmation,
        },
        { skipAuth: true }
      );

      toast.success(res.message || "Password reset successfully!");
      setStep("success");
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.isValidationError() && err.errors) {
          const mapped: Record<string, string> = {};
          Object.entries(err.errors).forEach(([field, msgs]) => {
            if (msgs.length > 0) mapped[field] = msgs[0];
          });
          setFieldErrors(mapped);
        } else {
          setErrorBanner(err.message);
        }
      } else {
        setErrorBanner("Failed to reset password. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      title={
        step === "request_otp"
          ? "Reset your password"
          : step === "verify_otp"
          ? "Enter verification code"
          : step === "new_password"
          ? "Set new password"
          : "Password updated!"
      }
      subtitle={
        step === "request_otp"
          ? "Enter your registered email address and we'll send you a recovery code"
          : step === "verify_otp"
          ? `We sent a verification code to ${email}`
          : step === "new_password"
          ? "Choose a strong password with at least 8 characters"
          : "Your password has been successfully reset"
      }
      footer={
        <div className="text-center text-xs text-zinc-500">
          <Link
            href="/auth/login"
            className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 inline-flex items-center gap-1 group"
          >
            <ArrowLeft className="h-3 w-3 group-hover:-translate-x-0.5 transition-transform" />
            Back to sign in
          </Link>
        </div>
      }
    >
      {errorBanner && (
        <Alert variant="error" className="mb-4" onClose={() => setErrorBanner(null)}>
          {errorBanner}
        </Alert>
      )}

      {/* Step 1: Request Code */}
      {step === "request_otp" && (
        <form onSubmit={handleSendCode} className="space-y-4">
          <TextInput
            label="Email Address"
            type="email"
            placeholder="name@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={fieldErrors.email}
            required
            autoFocus
            leftIcon={<Mail className="h-4 w-4" />}
          />

          <Button
            type="submit"
            className="w-full mt-2"
            size="lg"
            isLoading={isLoading}
            rightIcon={<KeyRound className="h-4 w-4" />}
          >
            Send Verification Code
          </Button>
        </form>
      )}

      {/* Step 2: Verify Code */}
      {step === "verify_otp" && (
        <form onSubmit={handleVerifyCode} className="space-y-4">
          <TextInput
            label="6-Digit Verification Code"
            placeholder="123456"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            error={fieldErrors.code}
            required
            autoFocus
            className="text-center tracking-widest text-lg font-mono"
            maxLength={10}
          />

          <Button type="submit" className="w-full mt-2" size="lg" isLoading={isLoading}>
            Verify Code
          </Button>

          <div className="text-center mt-3">
            <button
              type="button"
              onClick={() => setStep("request_otp")}
              className="text-xs font-medium text-zinc-500 hover:text-blue-600 dark:text-zinc-400 transition-colors"
            >
              Didn&apos;t receive code? Try again
            </button>
          </div>
        </form>
      )}

      {/* Step 3: New Password */}
      {step === "new_password" && (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <PasswordInput
            label="New Password"
            placeholder="Min. 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={fieldErrors.password}
            required
            autoFocus
          />

          <PasswordInput
            label="Confirm New Password"
            placeholder="Confirm password"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            error={fieldErrors.password_confirmation}
            required
          />

          <Button
            type="submit"
            className="w-full mt-2"
            size="lg"
            isLoading={isLoading}
            leftIcon={<Lock className="h-4 w-4" />}
          >
            Save New Password
          </Button>
        </form>
      )}

      {/* Step 4: Success Confirmation */}
      {step === "success" && (
        <div className="text-center py-4 space-y-4">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            Your password has been changed successfully. You can now log in with your new credentials.
          </p>
          <Button
            onClick={() => (window.location.href = "/auth/login")}
            className="w-full"
            size="lg"
          >
            Proceed to Sign In
          </Button>
        </div>
      )}
    </AuthShell>
  );
}
