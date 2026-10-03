"use client";

import React from "react";

export type SkeletonAnimation = "shimmer" | "pulse" | "none";
export type SkeletonVariant = "default" | "text" | "circular" | "card" | "button";
export type SkeletonRounded = "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "full";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  circle?: boolean;
  animation?: SkeletonAnimation;
  variant?: SkeletonVariant;
  rounded?: SkeletonRounded;
  count?: number;
  gap?: string;
}

export function Skeleton({
  className = "",
  circle = false,
  animation = "shimmer",
  variant = "default",
  rounded,
  count,
  gap = "gap-2",
  ...props
}: SkeletonProps) {
  const animationClass =
    animation === "shimmer"
      ? "animate-shimmer bg-slate-200/80 dark:bg-zinc-800/80"
      : animation === "pulse"
      ? "animate-pulse bg-slate-200/80 dark:bg-zinc-800/80"
      : "bg-slate-200/80 dark:bg-zinc-800/80";

  const isCircle = circle || variant === "circular";

  const getRoundedClass = () => {
    if (rounded) {
      return `rounded-${rounded}`;
    }
    if (isCircle) {
      return "rounded-full";
    }
    if (variant === "text" || variant === "button") {
      return "rounded-md";
    }
    return "rounded-xl";
  };

  const baseClasses = `relative overflow-hidden ${getRoundedClass()} ${animationClass} ${className}`;

  if (count && count > 1) {
    return (
      <div className={`flex flex-col ${gap}`} role="status" aria-busy="true">
        {Array.from({ length: count }).map((_, idx) => (
          <div
            key={idx}
            aria-hidden="true"
            className={baseClasses}
            {...props}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      aria-hidden="true"
      className={baseClasses}
      {...props}
    />
  );
}

