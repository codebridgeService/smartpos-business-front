"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AuthShell } from "@/components/layout";
import { TextInput, PasswordInput, Button, Alert } from "@/components/ui";
import { authApi, isApiError } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import { Mail, Lock, CheckCircle2, ArrowLeft, Send } from "lucide-react";

type Step = "request_link" | "link_sent" | "reset_password" | "success";

function ForgotPasswordContent() {
  const toast = useToast();
  const searchParams = useSearchParams();

  const [step, setStep] = useState<Step>("request_link");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Check URL query parameters for reset token (from email link) or pre-filled email
  useEffect(() => {
    const urlEmail = searchParams.get("email");
    const urlToken = searchParams.get("token");

    if (urlEmail) {
      setEmail(urlEmail);
    }

    if (urlToken) {
      setToken(urlToken);
      setStep("reset_password");
    }
  }, [searchParams]);

  // ---------------------------------------------------------------------------
  // Step 1: Send Password Reset Link (POST /auth/forgot-password)
  // ---------------------------------------------------------------------------
  const handleSendLink = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorBanner(null);
    setFieldErrors({});

    if (!email.trim()) {
      setFieldErrors({ email: "Email address is required" });
      return;
    }

    setIsLoading(true);

    try {
      const res = await authApi.forgotPassword({ email: email.trim() });
      toast.success(res.message || "Password reset link sent to your email.");
      setStep("link_sent");
    } catch (err: unknown) {
      console.error("[ForgotPassword Error]:", err);
      if (isApiError(err)) {
        if (err.isValidationError() && err.errors?.email) {
          setFieldErrors({ email: err.errors.email[0] });
        } else {
          setErrorBanner(err.message);
        }
      } else if (err instanceof Error && err.message) {
        setErrorBanner(err.message);
      } else {
        setErrorBanner("Failed to send reset link. Please verify your email.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Step 2: Reset Password (POST /auth/reset-password)
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
      const res = await authApi.resetPassword({
        email: email.trim(),
        token,
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
        setErrorBanner("Failed to reset password. Please check your reset link or request a new one.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      title={
        step === "request_link"
          ? "Reset your password"
          : step === "link_sent"
          ? "Check your email"
          : step === "reset_password"
          ? "Set new password"
          : "Password updated!"
      }
      subtitle={
        step === "request_link"
          ? "Enter your registered email address to receive a password reset link."
          : step === "link_sent"
          ? `We've sent a password reset link to ${email}`
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

      {/* Step 1: Request Password Reset Link */}
      {step === "request_link" && (
        <form onSubmit={handleSendLink} className="space-y-4">
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
            Send Reset Link
          </Button>
        </form>
      )}

      {/* Step 2: Email Sent Confirmation */}
      {step === "link_sent" && (
        <div className="text-center py-2 space-y-4">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
            <Mail className="h-8 w-8" />
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            Please check your inbox (and spam folder) and click the link inside the email to choose a new password.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleSendLink()}
              isLoading={isLoading}
              className="w-full"
            >
              Resend Reset Link
            </Button>
            <button
              type="button"
              onClick={() => setStep("request_link")}
              className="text-xs text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors pt-1 cursor-pointer"
            >
              Try a different email address
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Set New Password Form (from Email Link) */}
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
