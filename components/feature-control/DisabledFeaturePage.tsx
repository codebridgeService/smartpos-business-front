'use client';

import React from 'react';
import Link from 'next/link';

interface DisabledFeaturePageProps {
  featureName?: string;
  featureKey?: string;
  reason?: string | null;
  onRefresh?: () => void;
}

export function DisabledFeaturePage({
  featureName = 'Feature',
  featureKey,
  reason,
  onRefresh,
}: DisabledFeaturePageProps) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-8 text-center relative overflow-hidden">
        {/* Accent border */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-500 via-rose-500 to-pink-500" />

        {/* Disabled Icon */}
        <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
            />
          </svg>
        </div>

        <span className="px-3 py-1 text-xs font-bold uppercase rounded-full bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300">
          Feature Disabled
        </span>

        <h1 className="text-xl font-bold text-slate-900 dark:text-white mt-3 mb-2">
          {featureName} is Currently Disabled
        </h1>

        <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
          {reason ||
            'This feature is currently turned off by the system administrator or store management.'}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/admin/dashboard"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-sm"
          >
            Back to Dashboard
          </Link>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-200 transition-colors"
            >
              Check Again
            </button>
          )}
        </div>

        {featureKey && (
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-6">
            Feature ID: <code className="font-mono">{featureKey}</code>
          </p>
        )}
      </div>
    </div>
  );
}
