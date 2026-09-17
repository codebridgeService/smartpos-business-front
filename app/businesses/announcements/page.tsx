"use client";

import React, { use } from "react";
import Link from "next/link";
import {
  Megaphone,
  Plus,
  Bell,
  Clock,
  Calendar,
  AlertCircle,
  Pin,
} from "lucide-react";
import { useBusiness } from "@/context/business-context";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function BusinessAnnouncementsPage() {
  const { activeBusiness } = useBusiness();
  const businessUuid = activeBusiness?.uuid || "";

  const notices = [
    {
      id: "ANN-01",
      title: "Holiday Operating Schedule - All Outlets",
      content: "All registers will close at 8:00 PM this upcoming weekend for annual inventory counting.",
      audience: "All Cashiers & Managers",
      date: "Today, 09:00 AM",
      priority: "HIGH",
    },
    {
      id: "ANN-02",
      title: "New POS Firmware Update Available",
      content: "Please restart the countertop terminal at the end of the shift to apply new card reader driver updates.",
      audience: "Store Managers",
      date: "Yesterday",
      priority: "NORMAL",
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-500 uppercase tracking-wider mb-1">
            <Megaphone className="w-4 h-4" />
            <span>Staff Communications</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Business Announcements
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Internal alerts, cashier shift updates, and staff memos for {activeBusiness?.name || "this business"}.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button className="bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-amber-500/20">
            <Plus className="w-4 h-4" />
            Post Notice
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {notices.map((n) => (
          <Card key={n.id} className="p-5 border-zinc-200/80 dark:border-zinc-800/80 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <Badge className={`text-[10px] ${n.priority === "HIGH" ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20" : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"}`}>
                    {n.priority} PRIORITY
                  </Badge>
                  <span className="text-xs text-zinc-400">{n.date}</span>
                </div>
                <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">{n.title}</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-300 mt-2 leading-relaxed">{n.content}</p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
              <span className="inline-flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-amber-500" />
                Target: {n.audience}
              </span>
              <Button variant="ghost" size="sm" className="text-xs text-zinc-500">
                Dismiss
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
