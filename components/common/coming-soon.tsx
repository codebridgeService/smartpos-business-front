"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Clock,
  Sparkles,
  ArrowLeft,
  LayoutDashboard,
  Bell,
  CheckCircle2,
  Construction,
  Layers,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";

export interface FeatureHighlight {
  title: string;
  description: string;
  status?: "planned" | "in_progress" | "ready";
}

export interface ComingSoonProps {
  title: string;
  description: string;
  category?: string;
  badgeText?: string;
  expectedDate?: string;
  progressPercentage?: number;
  icon?: React.ReactNode;
  features?: FeatureHighlight[];
  showBackButton?: boolean;
}

export function ComingSoon({
  title,
  description,
  category = "Module in Development",
  badgeText = "Coming Soon",
  expectedDate = "Upcoming Release",
  progressPercentage = 65,
  icon,
  features = [],
  showBackButton = true,
}: ComingSoonProps) {
  const router = useRouter();
  const { success } = useToast();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;
    setSubscribed(true);
    success(`We'll notify ${email} once ${title} launches!`);
    setEmail("");
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-6 sm:py-10 space-y-8 animate-in fade-in duration-300">
      {/* Top Banner / Breadcrumb Action */}
      {showBackButton && (
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Go Back</span>
          </button>

          <Link href="/admin/dashboard">
            <span className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
              <LayoutDashboard className="h-3.5 w-3.5" />
              <span>Back to Dashboard</span>
            </span>
          </Link>
        </div>
      )}

      {/* Hero Header Card */}
      <div className="relative rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 p-6 sm:p-10 shadow-sm backdrop-blur-md overflow-hidden">
        {/* Glow ambient background accents */}
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-blue-500/10 dark:bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="primary" size="sm" dot>
                {badgeText}
              </Badge>
              <Badge variant="neutral" size="sm">
                <Layers className="h-3 w-3 mr-1" />
                {category}
              </Badge>
              {expectedDate && (
                <Badge variant="warning" size="sm">
                  <Clock className="h-3 w-3 mr-1" />
                  {expectedDate}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-blue-600/10 dark:bg-blue-400/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-600/20">
                {icon || <Construction className="h-6 w-6" />}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                {title}
              </h1>
            </div>

            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {description}
            </p>
          </div>

          {/* Progress Tracker Card */}
          <div className="w-full md:w-64 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 p-4 border border-zinc-200/60 dark:border-zinc-700/60 shrink-0">
            <div className="flex items-center justify-between text-xs font-semibold mb-2">
              <span className="text-zinc-600 dark:text-zinc-400">Development Progress</span>
              <span className="text-blue-600 dark:text-blue-400">{progressPercentage}%</span>
            </div>
            <div className="h-2 w-full bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <p className="text-[11px] text-zinc-400 mt-2 flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-amber-500" />
              <span>Sprint active &bull; Testing in sandbox</span>
            </p>
          </div>
        </div>
      </div>

      {/* Planned Feature Highlights */}
      {features.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                What&apos;s Included in this Module
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Features currently being built for the {title} release
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, idx) => (
              <Card key={idx} hoverEffect className="relative overflow-hidden">
                <CardContent className="p-4 sm:p-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="h-6 w-6 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-mono text-xs font-bold">
                      0{idx + 1}
                    </span>
                    {feature.status === "ready" ? (
                      <Badge variant="success" size="sm">Ready</Badge>
                    ) : feature.status === "in_progress" ? (
                      <Badge variant="warning" size="sm">In Progress</Badge>
                    ) : (
                      <Badge variant="neutral" size="sm">Planned</Badge>
                    )}
                  </div>
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 pt-1">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Notification Signup & Quick Access */}
      <div className="rounded-2xl border border-blue-200/60 dark:border-blue-900/60 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 dark:from-blue-950/30 dark:to-indigo-950/20 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1.5 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 dark:text-blue-300">
            <Bell className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            <span>Stay Updated</span>
          </div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            Want early access to {title}?
          </h3>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-md">
            Join the beta rollout list. We will send you an invitation when this module goes live for your business.
          </p>
        </div>

        <form onSubmit={handleSubscribe} className="w-full md:w-auto flex items-center gap-2 max-w-sm">
          <input
            type="email"
            placeholder="Enter business email..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={subscribed}
            className="flex-1 min-w-[200px] px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={subscribed}
            leftIcon={subscribed ? <CheckCircle2 className="h-4 w-4" /> : <Send className="h-3.5 w-3.5" />}
          >
            {subscribed ? "Subscribed" : "Notify Me"}
          </Button>
        </form>
      </div>
    </div>
  );
}
