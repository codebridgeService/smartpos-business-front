"use client";

import React from "react";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  circle?: boolean;
}

export function Skeleton({ className = "", circle = false, ...props }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-zinc-200/80 dark:bg-zinc-800/80 ${
        circle ? "rounded-full" : "rounded-xl"
      } ${className}`}
      {...props}
    />
  );
}
