"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AuthShell } from "@/components/layout";
import { securityApi } from "@/lib/api/security";
import { CheckCircle2, XCircle, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VerifyEmailChangeTokenPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const resolvedParams = use(params);
  const { token } = resolvedParams;
  const searchParams = useSearchParams();

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    let isMounted = true;

    async function handleVerify() {
      try {
        const query: Record<string, string> = {};
        searchParams.forEach((val, key) => {
          query[key] = val;
        });

        await securityApi.verifyEmailChange(token, query);
        if (!isMounted) return;
        setStatus("success");
      } catch (err: any) {
        if (!isMounted) return;
        setStatus("error");
        setErrorMessage(
          err?.data?.message ||
            err?.message ||
            "The email change verification link is invalid or has expired after 15 minutes."
        );
      }
    }

    handleVerify();

    return () => {
      isMounted = false;
    };
  }, [token, searchParams]);

  return (
    <AuthShell
      title={
        status === "loading"
          ? "Confirming New Email"
          : status === "success"
          ? "Email Updated Successfully"
          : "Update Verification Failed"
      }
      subtitle={
        status === "loading"
          ? "Validating your 15-minute temporary signed link..."
          : status === "success"
          ? "Your new primary email address is now active and confirmed."
          : "We could not verify your new email address with the provided link."
      }
    >
      <div className="py-6 text-center space-y-6">
        {status === "loading" && (
          <div className="flex flex-col items-center justify-center space-y-4 py-8">
            <Loader2 className="w-12 h-12 text-[#F26522] animate-spin" />
            <p className="text-sm text-slate-500 dark:text-zinc-400">
              Validating signature with SmartPOS Identity Service...
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <p className="text-sm text-slate-600 dark:text-zinc-300 max-w-sm mx-auto">
              Your primary email has been updated, verified, and your pending change has been finalized.
            </p>

            <div className="pt-2">
              <Link href="/settings/security">
                <Button className="w-full bg-[#F26522] hover:bg-[#d9531e] text-white flex items-center justify-center gap-2">
                  Return to Security Settings <ArrowRight className="w-4 h-4" />
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

            <div className="pt-2">
              <Link href="/settings/security">
                <Button variant="outline" className="w-full">
                  Return to Security Settings
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </AuthShell>
  );
}
