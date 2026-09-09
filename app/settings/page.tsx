'use client';

import React, { Suspense } from 'react';
import { DreamPosSettingsShell } from '@/components/settings';

export default function SettingsIndexPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <DreamPosSettingsShell initialTab="profile" />
    </Suspense>
  );
}
