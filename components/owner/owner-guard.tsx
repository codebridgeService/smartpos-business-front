"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Crown, ArrowLeft, LogOut, Loader2, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { isOwner, isAdmin, getUserRoleCodes } from "@/lib/utils/roles";
import { Button, Card, CardContent, Badge } from "@/components/ui";

interface OwnerGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function OwnerGuard({ children, fallback }: OwnerGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isLoading, isAuthenticated, router, pathname]);

  // 1. Loading State
  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-purple-600/10 dark:bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Verifying owner credentials...
            </p>
            <p className="text-xs text-zinc-500">Checking store ownership permissions</p>
          </div>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated State
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
      </div>
    );
  }

  // 3. Owner Role Check: Strictly Store Owner only (Admins cannot access Owner portal)
  const hasOwnerPrivilege = isOwner(user);
  const userRoles = getUserRoleCodes(user);
  const hasAdminPrivilege = isAdmin(user);

  if (!hasOwnerPrivilege) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4 sm:p-6">
        <Card className="max-w-lg w-full border-purple-200 dark:border-purple-900/40 shadow-xl overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-amber-500" />
          <CardContent className="p-6 sm:p-8 text-center space-y-6">
            <div className="mx-auto h-16 w-16 rounded-3xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center shadow-inner">
              <Crown className="h-8 w-8" />
            </div>

            <div className="space-y-2">
              <Badge variant="warning" size="md">
                Owner Access Only
              </Badge>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                Store Owner Privileges Required
              </h2>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-sm mx-auto">
                This area is reserved strictly for <span className="font-semibold text-purple-600 dark:text-purple-400">Store Owners</span>. Your account does not currently hold ownership status.
              </p>
            </div>

            {/* Current User Identity */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-left space-y-2">
              <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                Current Account
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500">Name:</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">{user.name}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500">Email:</span>
                <span className="font-medium text-zinc-700 dark:text-zinc-300">
                  {user.email || user.username || "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs pt-1 border-t border-zinc-200 dark:border-zinc-800">
                <span className="text-zinc-500">Assigned Roles:</span>
                <div className="flex flex-wrap gap-1 justify-end">
                  {userRoles.length > 0 ? (
                    userRoles.map((role) => (
                      <Badge key={role} variant="neutral" size="sm">
                        {role}
                      </Badge>
                    ))
                  ) : (
                    <Badge variant="warning" size="sm">
                      None
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <Link
                href={hasAdminPrivilege ? "/admin/dashboard" : "/pos"}
                className="w-full sm:flex-1"
              >
                <Button
                  variant="primary"
                  className="w-full"
                  leftIcon={hasAdminPrivilege ? <ShieldCheck className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
                >
                  {hasAdminPrivilege ? "Return to Admin Dashboard" : "Return to POS"}
                </Button>
              </Link>
              <Button
                variant="ghost"
                className="w-full sm:w-auto"
                leftIcon={<LogOut className="h-4 w-4 text-zinc-500" />}
                onClick={async () => {
                  await logout();
                  router.push("/auth/login");
                }}
              >
                Switch Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 4. Authorized as Owner
  return <>{children}</>;
}
