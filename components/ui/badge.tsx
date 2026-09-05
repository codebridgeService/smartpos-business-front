"use client";

import React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "success" | "warning" | "danger" | "info" | "neutral" | "primary";
  size?: "sm" | "md";
  dot?: boolean;
}

export function Badge({
  children,
  variant = "neutral",
  size = "md",
  dot = false,
  className = "",
  ...props
}: BadgeProps) {
  const sizeStyles = {
    sm: "text-[11px] px-2 py-0.5 font-medium",
    md: "text-xs px-2.5 py-1 font-medium",
  };

  const variantStyles = {
    success:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60",
    warning:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60",
    danger:
      "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60",
    info:
      "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/60",
    primary:
      "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60",
    neutral:
      "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800/80 dark:text-zinc-300 dark:border-zinc-700",
  };

  const dotColors = {
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    danger: "bg-rose-500",
    info: "bg-sky-500",
    primary: "bg-blue-500",
    neutral: "bg-zinc-400",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${dotColors[variant]}`} />}
      <span>{children}</span>
    </span>
  );
}
