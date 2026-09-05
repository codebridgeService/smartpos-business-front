"use client";

import React from "react";
import { ToastProvider } from "@/components/ui/toast";
import { AuthProvider } from "./auth-context";
import { BusinessProvider } from "./business-context";
import { OutletProvider } from "./outlet-context";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <AuthProvider>
        <BusinessProvider>
          <OutletProvider>{children}</OutletProvider>
        </BusinessProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
