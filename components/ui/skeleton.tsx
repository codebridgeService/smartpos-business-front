"use client";

import React from "react";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  circle?: boolean;
  animation?: "shimmer" | "pulse" | "none";
}

export function Skeleton({
  className = "",
  circle = false,
  animation = "shimmer",
  ...props
}: SkeletonProps) {
  const animationClass =
    animation === "shimmer"
      ? "animate-shimmer bg-slate-200/80 dark:bg-zinc-800/80"
      : animation === "pulse"
      ? "animate-pulse bg-slate-200/80 dark:bg-zinc-800/80"
      : "bg-slate-200/80 dark:bg-zinc-800/80";

  return (
    <div
      aria-hidden="true"
      className={`relative overflow-hidden ${
        circle ? "rounded-full" : "rounded-xl"
      } ${animationClass} ${className}`}
      {...props}
    />
  );
}
