"use client";

import React, { forwardRef } from "react";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      className = "",
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]";

    const sizeStyles = {
      sm: "text-xs px-3 py-1.5 gap-1.5",
      md: "text-sm px-4 py-2.5 gap-2",
      lg: "text-base px-5 py-3 gap-2.5",
    };

    const variantStyles = {
      primary:
        "bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow shadow-blue-600/25 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600",
      secondary:
        "bg-zinc-100 hover:bg-zinc-200 text-zinc-900 focus:ring-zinc-400 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-100",
      outline:
        "border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 text-zinc-800 dark:text-zinc-200 focus:ring-zinc-400",
      ghost:
        "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 focus:ring-zinc-400",
      danger:
        "bg-red-600 hover:bg-red-700 text-white shadow-sm shadow-red-600/25 focus:ring-red-500 dark:bg-red-600 dark:hover:bg-red-700",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-current" />
        ) : (
          leftIcon
        )}
        <span>{children}</span>
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = "Button";
