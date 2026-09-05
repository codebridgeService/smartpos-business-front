"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/layout";
import { TextInput, PasswordInput, Button, Alert } from "@/components/ui";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/components/ui/toast";
import { ApiError } from "@/lib/api";
import { UserPlus, ArrowLeft } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const toast = useToast();

  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    password_confirmation: "",
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

    // Client validation
    const errors: Record<string, string> = {};
    if (!form.name.trim()) errors.name = "Full name is required";
    if (!form.username.trim()) errors.username = "Username is required";
    if (!form.password) errors.password = "Password is required";
    else if (form.password.length < 8) errors.password = "Password must be at least 8 characters";

    if (form.password !== form.password_confirmation) {
      errors.password_confirmation = "Passwords do not match";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);

    try {
      const res = await register({
        name: form.name.trim(),
        username: form.username.trim(),
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        password: form.password,
        password_confirmation: form.password_confirmation,
      });

      toast.success(`Account created! Welcome, ${res.user.name}`);
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
          setErrorBanner(err.message || "Registration failed. Please try again.");
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
      title="Create an account"
      subtitle="Join SmartPOS to start managing your business and registers"
      footer={
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500 dark:text-zinc-400">
          <span>Already registered?</span>
          <Link
            href="/auth/login"
            className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 inline-flex items-center gap-1 group"
          >
            <ArrowLeft className="h-3 w-3 group-hover:-translate-x-0.5 transition-transform" />
            Sign in
          </Link>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {errorBanner && (
          <Alert variant="error" onClose={() => setErrorBanner(null)}>
            {errorBanner}
          </Alert>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <TextInput
            label="Full Name"
            name="name"
            placeholder="John Doe"
            value={form.name}
            onChange={handleChange}
            error={fieldErrors.name}
            required
            autoFocus
          />

          <TextInput
            label="Username"
            name="username"
            placeholder="johndoe"
            value={form.username}
            onChange={handleChange}
            error={fieldErrors.username}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <TextInput
            label="Email Address"
            type="email"
            name="email"
            placeholder="john@example.com"
            value={form.email}
            onChange={handleChange}
            error={fieldErrors.email}
          />

          <TextInput
            label="Phone Number"
            type="tel"
            name="phone"
            placeholder="+1 234 567 890"
            value={form.phone}
            onChange={handleChange}
            error={fieldErrors.phone}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <PasswordInput
            label="Password"
            name="password"
            placeholder="Min. 8 characters"
            value={form.password}
            onChange={handleChange}
            error={fieldErrors.password}
            required
          />

          <PasswordInput
            label="Confirm Password"
            name="password_confirmation"
            placeholder="Confirm password"
            value={form.password_confirmation}
            onChange={handleChange}
            error={fieldErrors.password_confirmation}
            required
          />
        </div>

        <Button
          type="submit"
          className="w-full mt-2"
          size="lg"
          isLoading={isLoading}
          leftIcon={<UserPlus className="h-4 w-4" />}
        >
          Create Account
        </Button>
      </form>
    </AuthShell>
  );
}
