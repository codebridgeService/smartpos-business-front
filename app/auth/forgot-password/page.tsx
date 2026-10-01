"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AuthShell } from "@/components/layout";
import { TextInput, PasswordInput, Button, Alert } from "@/components/ui";
import { authApi, isApiError } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import { Mail, Lock, CheckCircle2, ArrowLeft, Send, KeyRound, ShieldCheck } from "lucide-react";

type Step = "request_code" | "verify_code" | "reset_password" | "success";

function ForgotPasswordContent() {
  const toast = useToast();
  const searchParams = useSearchParams();

  const [step, setStep] = useState<Step>("request_code");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [otpUuid, setOtpUuid] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Resend cooldown timer countdown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // Check URL query parameters for pre-filled email or OTP
  useEffect(() => {
    const urlEmail = searchParams.get("email");
    const urlCode = searchParams.get("code");
    const urlOtpUuid = searchParams.get("otp_uuid") || searchParams.get("token");

    if (urlEmail) {
      setEmail(urlEmail);
    }

    if (urlOtpUuid) {
      setOtpUuid(urlOtpUuid);
      setStep("reset_password");
    } else if (urlCode) {
      setCode(urlCode);
      if (urlEmail) {
        setStep("verify_code");
      }
    }
  }, [searchParams]);

  // ---------------------------------------------------------------------------
  // Step 1: Send Password Reset OTP Code (POST /auth/forgot-password/send-code)
  // ---------------------------------------------------------------------------
  const handleSendCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorBanner(null);
    setFieldErrors({});

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setFieldErrors({ email: "Email address is required" });
      return;
    }

    setIsLoading(true);

    try {
      const res = await authApi.sendForgotPasswordCode({ email: cleanEmail });
      toast.success(res.message || "Verification code sent to your email.");
      setStep("verify_code");
      setResendCooldown(60);
    } catch (err: unknown) {
      console.error("[SendCode Error]:", err);
      if (isApiError(err)) {
        if (err.isValidationError() && err.errors?.email) {
          setFieldErrors({ email: err.errors.email[0] });
        } else {
          setErrorBanner(err.message);
        }
      } else if (err instanceof Error && err.message) {
        setErrorBanner(err.message);
      } else {
        setErrorBanner("Failed to send verification code. Please check your email.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Step 2: Verify OTP Code (POST /auth/verify-reset-code)
  // ---------------------------------------------------------------------------
  const handleVerifyCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorBanner(null);
    setFieldErrors({});

    const cleanCode = code.trim();
    if (!cleanCode) {
      setFieldErrors({ code: "Verification code is required" });
      return;
    }
    if (cleanCode.length !== 6 || !/^\d{6}$/.test(cleanCode)) {
      setFieldErrors({ code: "Please enter the 6-digit numerical code" });
      return;
    }

    setIsLoading(true);

    try {
      const res = await authApi.verifyResetCode({
        email: email.trim(),
        code: cleanCode,
      });

      toast.success(res.message || "Code verified successfully!");
      setOtpUuid(res.otp_uuid);
      setStep("reset_password");
    } catch (err: unknown) {
      console.error("[VerifyCode Error]:", err);
      if (isApiError(err)) {
        if (err.isValidationError() && err.errors?.code) {
          setFieldErrors({ code: err.errors.code[0] });
        } else {
          setErrorBanner(err.message);
        }
      } else if (err instanceof Error && err.message) {
        setErrorBanner(err.message);
      } else {
        setErrorBanner("Failed to verify code. Please check your code and try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Step 3: Reset Password (POST /auth/reset-password)
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

    if (!otpUuid) {
      setErrorBanner("Session expired or missing verification. Please request a new code.");
      setStep("request_code");
      return;
    }

    setIsLoading(true);

    try {
      const res = await authApi.resetPassword({
        email: email.trim(),
        otp_uuid: otpUuid,
        password,
        password_confirmation: passwordConfirmation,
      });

      toast.success(res.message || "Password reset successfully!");
      setStep("success");
    } catch (err: unknown) {
      console.error("[ResetPassword Error]:", err);
      if (isApiError(err)) {
        if (err.isValidationError() && err.errors) {
          const mapped: Record<string, string> = {};
          Object.entries(err.errors).forEach(([field, msgs]) => {
            if (msgs.length > 0) mapped[field] = msgs[0];
          });
          setFieldErrors(mapped);
        } else {
          setErrorBanner(err.message);
        }
      } else if (err instanceof Error && err.message) {
        setErrorBanner(err.message);
      } else {
        setErrorBanner("Failed to reset password. Please check your inputs or request a new code.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      title={
        step === "request_code"
          ? "Reset your password"
          : step === "verify_code"
            ? "Enter verification code"
            : step === "reset_password"
              ? "Set new password"
              : "Password updated!"
      }
      subtitle={
        step === "request_code"
          ? "Enter your registered email address to receive a 6-digit verification code."
          : step === "verify_code"
            ? `We sent a 6-digit code to ${email}`
            : step === "reset_password"
              ? "Choose a strong password with at least 8 characters."
              : "Your password has been successfully reset."
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

      {/* Step 1: Request 6-digit verification code */}
      {step === "request_code" && (
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
            rightIcon={<Send className="h-4 w-4" />}
          >
            Send Verification Code
          </Button>
        </form>
      )}

      {/* Step 2: Verify 6-digit OTP code */}
      {step === "verify_code" && (
        <form onSubmit={handleVerifyCode} className="space-y-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 rounded-xl text-xs text-blue-800 dark:text-blue-200 flex items-start gap-2.5">
            <Mail className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <span>
              Please check your inbox at <strong>{email}</strong> for your 6-digit OTP code (valid for 10 minutes).
            </span>
          </div>

          <TextInput
            label="6-Digit Verification Code"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            placeholder="123456"
            value={code}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "").slice(0, 6);
              setCode(val);
            }}
            error={fieldErrors.code}
            required
            autoFocus
            leftIcon={<KeyRound className="h-4 w-4" />}
          />

          <Button
            type="submit"
            className="w-full mt-2"
            size="lg"
            isLoading={isLoading}
            rightIcon={<ShieldCheck className="h-4 w-4" />}
          >
            Verify Code
          </Button>

          <div className="pt-2 flex flex-col gap-2 text-center">
            <button
              type="button"
              disabled={isLoading || resendCooldown > 0}
              onClick={() => handleSendCode()}
              className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors cursor-pointer"
            >
              {resendCooldown > 0
                ? `Resend code in ${resendCooldown}s`
                : "Didn't receive the code? Resend"}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep("request_code");
                setCode("");
              }}
              className="text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors cursor-pointer"
            >
              Use a different email address
            </button>
          </div>
        </form>
      )}

      {/* Step 3: Set New Password */}
      {step === "reset_password" && (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <TextInput
            label="Account Email"
            type="email"
            value={email}
            disabled
            leftIcon={<Mail className="h-4 w-4" />}
          />

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
            placeholder="Confirm new password"
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
            Update Password
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

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <AuthShell title="Reset your password" subtitle="Loading...">
          <div className="h-32 flex items-center justify-center text-sm text-zinc-400">
            Loading...
          </div>
        </AuthShell>
      }
    >
      <ForgotPasswordContent />
    </Suspense>
  );
}
