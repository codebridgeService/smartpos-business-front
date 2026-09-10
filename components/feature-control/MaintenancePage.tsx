'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MaintenanceType } from '@/types/feature-control';

interface MaintenancePageProps {
  featureName?: string;
  featureKey?: string;
  reason?: string | null;
  maintenanceType?: MaintenanceType | null;
  estimatedCompletedAt?: string | null;
  showCountdown?: boolean;
  onRefresh?: () => void;
  isOwner?: boolean;
  onBypass?: () => void;
}

export function MaintenancePage({
  featureName = 'Feature',
  featureKey,
  reason,
  maintenanceType,
  estimatedCompletedAt,
  showCountdown = true,
  onRefresh,
  isOwner = false,
  onBypass,
}: MaintenancePageProps) {
  const [timeLeft, setTimeLeft] = useState<{
    hours: string;
    minutes: string;
    seconds: string;
    totalSeconds: number;
  }>({
    hours: '00',
    minutes: '00',
    seconds: '00',
    totalSeconds: 0,
  });

  useEffect(() => {
    if (!estimatedCompletedAt) return;

    const calculateTimeLeft = () => {
      const targetTime = new Date(estimatedCompletedAt).getTime();
      const now = new Date().getTime();
      const difference = targetTime - now;

      if (difference <= 0) {
        setTimeLeft({
          hours: '00',
          minutes: '00',
          seconds: '00',
          totalSeconds: 0,
        });
        return;
      }

      const totalSeconds = Math.floor(difference / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      setTimeLeft({
        hours: String(hours).padStart(2, '0'),
        minutes: String(minutes).padStart(2, '0'),
        seconds: String(seconds).padStart(2, '0'),
        totalSeconds,
      });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [estimatedCompletedAt]);

  const formattedType = maintenanceType
    ? maintenanceType.replace(/_/g, ' ')
    : 'SYSTEM UPDATE';

  const formattedEstimated = estimatedCompletedAt
    ? new Date(estimatedCompletedAt).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : null;

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-8 text-center relative overflow-hidden">
        {/* Glowing accent border */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500" />

        {/* Owner bypass banner */}
        {isOwner && onBypass && (
          <div className="mb-6 py-2 px-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg flex items-center justify-between text-xs text-amber-800 dark:text-amber-200">
            <span className="flex items-center gap-1.5 font-medium">
              <svg className="w-4 h-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
              </svg>
              Owner Bypass Active (Preview Mode)
            </span>
            <button
              onClick={onBypass}
              className="font-semibold underline hover:text-amber-900 dark:hover:text-amber-100"
            >
              Enter Feature &rarr;
            </button>
          </div>
        )}

        {/* Animated Maintenance Icon */}
        <div className="relative inline-flex items-center justify-center mb-6">
          <div className="w-20 h-20 rounded-2xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-inner relative">
            <svg
              className="w-10 h-10 animate-bounce"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500"></span>
          </span>
        </div>

        {/* Badges */}
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="px-3 py-1 text-xs font-bold tracking-wide uppercase rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300">
            {formattedType}
          </span>
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            Under Maintenance
          </span>
        </div>

        {/* Feature / Page Title */}
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          {featureName} is Temporarily Unavailable
        </h1>

        {/* Reason Explanation */}
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 max-w-md mx-auto">
          {reason ||
            'We are currently performing critical maintenance and upgrades on this module to ensure stability and top performance.'}
        </p>

        {/* Countdown Timer Block */}
        {showCountdown && estimatedCompletedAt && (
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-5 mb-6 border border-slate-100 dark:border-slate-800">
            <p className="text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 mb-3 tracking-wider">
              Estimated Remaining Time
            </p>
            <div className="flex items-center justify-center gap-3">
              {/* Hours */}
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-center text-2xl font-black font-mono text-slate-800 dark:text-slate-100">
                  {timeLeft.hours}
                </div>
                <span className="text-[10px] text-slate-400 uppercase mt-1 font-semibold">
                  Hours
                </span>
              </div>
              <span className="text-2xl font-bold text-slate-400 -mt-4">:</span>
              {/* Minutes */}
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-center text-2xl font-black font-mono text-slate-800 dark:text-slate-100">
                  {timeLeft.minutes}
                </div>
                <span className="text-[10px] text-slate-400 uppercase mt-1 font-semibold">
                  Minutes
                </span>
              </div>
              <span className="text-2xl font-bold text-slate-400 -mt-4">:</span>
              {/* Seconds */}
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-center text-2xl font-black font-mono text-amber-600 dark:text-amber-400">
                  {timeLeft.seconds}
                </div>
                <span className="text-[10px] text-slate-400 uppercase mt-1 font-semibold">
                  Seconds
                </span>
              </div>
            </div>
            {formattedEstimated && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
                Expected Completion: <span className="font-semibold text-slate-700 dark:text-slate-200">{formattedEstimated}</span>
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
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
              Check Status Again
            </button>
          )}
        </div>

        {featureKey && (
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-6">
            System Feature Code: <code className="font-mono">{featureKey}</code>
          </p>
        )}
      </div>
    </div>
  );
}
