'use client';

import React from 'react';
import { DashboardShell } from '@/components/layout';
import { useAuth } from '@/context/auth-context';
import { isAdmin } from '@/lib/utils/roles';

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const userIsAdmin = isAdmin(user);

  return (
    <DashboardShell variant={userIsAdmin ? 'admin' : 'default'}>
      <div className="w-full">{children}</div>
    </DashboardShell>
  );
}
