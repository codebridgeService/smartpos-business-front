"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { AuthShell } from "@/components/layout";
import { securityApi } from "@/lib/api/security";
import { CheckCircle2, XCircle, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VerifyEmailPage({
  params,
}: {
  params: Promise<{ id: string; hash: string }>;
}) {
  const resolvedParams = use(params);
  const { id, hash } = resolvedParams;

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    let isMounted = true;

    async function handleVerify() {
      try {
        await securityApi.verifyEmail(id, hash);
        if (!isMounted) return;
        setStatus("success");
      } catch (err: any) {
        if (!isMounted) return;
        setStatus("error");
        setErrorMessage(
          err?.data?.message ||
            err?.message ||
            "The verification link is invalid or has expired after 15 minutes."
        );
      }
    }

    handleVerify();

    return () => {
      isMounted = false;
    };
  }, [id, hash]);

  return (
    <AuthShell
      title={
        status === "loading"
          ? "Verifying Email Address"
          : status === "success"
          ? "Email Verified Successfully"
          : "Verification Failed"
      }
      subtitle={
        status === "loading"
          ? "Validating your 15-minute signed verification link..."
          : status === "success"
          ? "Your email address is now confirmed and secured."
          : "We could not verify your email address with the provided link."
      }
    >
      <div className="py-6 text-center space-y-6">
        {status === "loading" && (
          <div className="flex flex-col items-center justify-center space-y-4 py-8">
            <Loader2 className="w-12 h-12 text-[#F26522] animate-spin" />
            <p className="text-sm text-slate-500 dark:text-zinc-400">
              Contacting SmartPOS Identity Service...
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <p className="text-sm text-slate-600 dark:text-zinc-300 max-w-sm mx-auto">
              Your email address has been verified. You can now access all authenticated POS features and business settings.
            </p>

            <div className="pt-2">
              <Link href="/auth/login">
                <Button className="w-full bg-[#F26522] hover:bg-[#d9531e] text-white flex items-center justify-center gap-2">
                  Proceed to Sign In <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 flex items-center justify-center text-red-500">
              <XCircle className="w-10 h-10" />
            </div>

            <p className="text-sm text-red-600 dark:text-red-400 max-w-sm mx-auto font-medium">
              {errorMessage}
            </p>

            <div className="space-y-3 pt-2">
              <Link href="/settings?tab=security">
                <Button className="w-full bg-[#F26522] hover:bg-[#d9531e] text-white">
                  Return to Security Settings
                </Button>
              </Link>
              <Link href="/auth/login" className="block text-xs text-slate-500 hover:underline">
                Back to Sign In
              </Link>
            </div>
          </div>
        )}
      </div>
    </AuthShell>
  );
}
