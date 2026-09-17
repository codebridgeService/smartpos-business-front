"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { outletsApi } from "@/lib/api/outlets";
import { useToast } from "@/components/ui/toast";
import { RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DirectOutletRedirectPage({
  params,
}: {
  params: Promise<{ outlet: string }>;
}) {
  const resolvedParams = use(params);
  const outletUuid = resolvedParams.outlet;
  const router = useRouter();
  const toast = useToast();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function resolveAndRedirect() {
      try {
        const outlet = await outletsApi.getOutlet(outletUuid);
        if (!isMounted) return;

        router.replace(`/businesses/outlets/${outletUuid}`);
      } catch (err: unknown) {
        if (!isMounted) return;
        const msg = err instanceof Error ? err.message : "Failed to load outlet";
        setError(msg);
        toast.error(msg);
      }
    }

    void resolveAndRedirect();

    return () => {
      isMounted = false;
    };
  }, [outletUuid, router, toast]);

  if (error) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center p-4">
        <div className="p-8 max-w-md w-full text-center rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50/20 dark:bg-red-950/20 space-y-4">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            Outlet Not Found
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {error}
          </p>
          <Button
            variant="outline"
            onClick={() => router.push("/businesses")}
            className="w-full"
          >
            Go to Businesses
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
      <RefreshCw className="w-6 h-6 animate-spin text-orange-500" />
      <p className="text-sm font-medium text-zinc-500">Connecting to outlet workspace...</p>
    </div>
  );
}
