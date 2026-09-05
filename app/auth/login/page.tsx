"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/layout";
import { TextInput, PasswordInput, Button, Alert } from "@/components/ui";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/components/ui/toast";
import { ApiError } from "@/lib/api";
import { LogIn, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const toast = useToast();

  const [form, setForm] = useState({
    login: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorBanner(null);
    setFieldErrors({});

    if (!form.login.trim()) {
      setFieldErrors((prev) => ({ ...prev, login: "Username, email, or phone is required" }));
      return;
    }
    if (!form.password) {
      setFieldErrors((prev) => ({ ...prev, password: "Password is required" }));
      return;
    }

    setIsLoading(true);

    try {
      const res = await login({
        login: form.login.trim(),
        password: form.password,
      });

      toast.success(`Welcome back, ${res.user.name}!`);
      router.push("/");
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.isValidationError() && err.errors) {
          const mapped: Record<string, string> = {};
          Object.entries(err.errors).forEach(([field, msgs]) => {
            if (msgs.length > 0) mapped[field] = msgs[0];
          });
          setFieldErrors(mapped);
        } else {
          setErrorBanner(err.message || "Failed to sign in. Please check your credentials.");
        }
      } else {
        setErrorBanner("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      title="Sign in to your account"
      subtitle="Enter your credentials to access the SmartPOS business portal"
      footer={
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500 dark:text-zinc-400">
          <span>Don&apos;t have an account yet?</span>
          <Link
            href="/auth/register"
            className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 inline-flex items-center gap-1 group"
          >
            Create account
            <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorBanner && (
          <Alert variant="error" onClose={() => setErrorBanner(null)}>
            {errorBanner}
          </Alert>
        )}

        <TextInput
          label="Username, Email or Phone"
          name="login"
          placeholder="e.g. cashier@example.com"
          value={form.login}
          onChange={handleChange}
          error={fieldErrors.login}
          required
          autoComplete="username"
          autoFocus
        />

        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="sr-only">Password</span>
          </div>
          <PasswordInput
            label="Password"
            name="password"
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
            error={fieldErrors.password}
            required
            autoComplete="current-password"
          />
          <div className="flex justify-end mt-1.5">
            <Link
              href="/auth/forgot-password"
              className="text-xs font-medium text-zinc-500 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full mt-2"
          size="lg"
          isLoading={isLoading}
          leftIcon={<LogIn className="h-4 w-4" />}
        >
          Sign In
        </Button>
      </form>
    </AuthShell>
  );
}
