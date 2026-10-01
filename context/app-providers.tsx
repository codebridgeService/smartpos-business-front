"use client";

import React from "react";
import { QueryProvider } from "@/lib/react-query";
import { ToastProvider } from "@/components/ui/toast";
import { AuthProvider } from "./auth-context";
import { BusinessProvider } from "./business-context";
import { OutletProvider } from "./outlet-context";
import { ThemeProvider } from "./theme-context";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <BusinessProvider>
              <OutletProvider>{children}</OutletProvider>
            </BusinessProvider>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}
