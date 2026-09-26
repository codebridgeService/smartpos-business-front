"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { ShieldAlert, ArrowLeft, LogOut, Loader2, Crown } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { isAdmin, isOwner, getUserRoleCodes } from "@/lib/utils/roles";
import { Button, Card, CardContent, Badge } from "@/components/ui";

interface AdminGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AdminGuard({ children, fallback }: AdminGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (!isLoading && isAuthenticated && user) {
      // If user is owner and NOT admin, immediately redirect to /businesses/dashboard
      if (!isAdmin(user) && isOwner(user)) {
        router.replace("/businesses/dashboard");
        return;
      }
      // If user is regular staff or cashier without admin privileges, redirect to /pos
      if (!isAdmin(user)) {
        router.replace("/pos");
        return;
      }
    }
  }, [isLoading, isAuthenticated, user, router, pathname]);

  // 1. Loading State
  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-blue-600/10 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Verifying administrative permissions...
            </p>
            <p className="text-xs text-zinc-500">Checking role security policies</p>
          </div>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated State (handled by effect redirect, but render placeholder)
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    );
  }

  // 3. Role Check: Strictly Admin only (Owner role cannot access Admin)
  const isAuthorized = isAdmin(user);
  const isUserOwner = isOwner(user);
  const userRoles = getUserRoleCodes(user);

  if (!isAuthorized) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4 sm:p-6">
        <Card className="max-w-lg w-full border-red-200 dark:border-red-900/40 shadow-xl overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-red-500 via-amber-500 to-rose-500" />
          <CardContent className="p-6 sm:p-8 text-center space-y-6">
            <div className="mx-auto h-16 w-16 rounded-3xl bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center shadow-inner">
              <ShieldAlert className="h-8 w-8" />
            </div>

            <div className="space-y-2">
              <Badge variant="danger" size="md">
                403 Access Denied
              </Badge>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                Administrator Access Required
              </h2>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-sm mx-auto">
                {isUserOwner ? (
                  <>
                    You are logged in as a <span className="font-semibold text-purple-600 dark:text-purple-400">Store Owner</span>. The Admin panel is strictly reserved for System Administrators.
                  </>
                ) : (
                  <>
                    You do not have permission to access the administrative section. Only users with the <span className="font-semibold text-zinc-900 dark:text-zinc-200">Admin</span> role are allowed.
                  </>
                )}
              </p>
            </div>

            {/* Current Identity Details */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-left space-y-2">
              <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                Current Identity
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500">User:</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">{user.name}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500">Email / Login:</span>
                <span className="font-medium text-zinc-700 dark:text-zinc-300">
                  {user.email || user.username || "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs pt-1 border-t border-zinc-200 dark:border-zinc-800">
                <span className="text-zinc-500">Your Current Roles:</span>
                <div className="flex flex-wrap gap-1 justify-end">
                  {userRoles.length > 0 ? (
                    userRoles.map((role) => (
                      <Badge key={role} variant="neutral" size="sm">
                        {role}
                      </Badge>
                    ))
                  ) : (
                    <Badge variant="warning" size="sm">
                      No Roles Assigned
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <Link
                href={isUserOwner ? "/owner" : "/pos"}
                className="w-full sm:flex-1"
              >
                <Button
                  variant="primary"
                  className="w-full"
                  leftIcon={isUserOwner ? <Crown className="h-4 w-4 text-amber-300" /> : <ArrowLeft className="h-4 w-4" />}
                >
                  {isUserOwner ? "Return to Owner Portal" : "Return to POS"}
                </Button>
              </Link>
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                leftIcon={<LogOut className="h-4 w-4 text-zinc-500" />}
                onClick={async () => {
                  await logout();
                  router.push("/auth/login");
                }}
              >
                Sign In as Another User
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 4. User is verified as Admin or Owner -> grant access
  return <>{children}</>;
}
