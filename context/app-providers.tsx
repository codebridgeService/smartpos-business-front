"use client";

import React from "react";
import { AuthProvider } from "./auth-context";
import { BusinessProvider } from "./business-context";
import { OutletProvider } from "./outlet-context";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <BusinessProvider>
        <OutletProvider>{children}</OutletProvider>
      </BusinessProvider>
    </AuthProvider>
  );
}
