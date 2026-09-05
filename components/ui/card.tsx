"use client";

import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export function Card({ children, hoverEffect = false, className = "", ...props }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm ${
        hoverEffect
          ? "transition-all duration-200 hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700"
          : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`p-5 sm:p-6 border-b border-zinc-100 dark:border-zinc-800/80 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = "", ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={`text-base font-semibold text-zinc-900 dark:text-zinc-100 ${className}`} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = "", ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={`text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 ${className}`} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ children, className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`p-5 sm:p-6 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`p-4 sm:p-6 border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/50 rounded-b-2xl flex items-center justify-between gap-3 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
