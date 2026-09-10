"use client";

import React, { useState } from "react";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  name?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  shape?: "circle" | "rounded";
  status?: "active" | "inactive" | "blocked" | null;
  lastLoginAt?: string | null;
  lastLoginIp?: string | null;
  className?: string;
}

export function Avatar({
  src,
  name,
  size = "md",
  shape = "circle",
  status,
  lastLoginAt,
  lastLoginIp,
  className = "",
  ...props
}: AvatarProps) {
  const [prevSrc, setPrevSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  if (prevSrc !== src) {
    setPrevSrc(src);
    setHasError(false);
  }

  const initials = name
    ? name
        .trim()
        .split(/\s+/)
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  const sizeStyles = {
    xs: "h-6 w-6 text-[10px]",
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
    xl: "h-16 w-16 text-xl",
  };

  const statusDotSizes = {
    xs: "h-1.5 w-1.5",
    sm: "h-2 w-2",
    md: "h-2.5 w-2.5",
    lg: "h-3 w-3",
    xl: "h-3.5 w-3.5",
  };

  const shapeStyles = {
    circle: "rounded-full",
    rounded: "rounded-2xl",
  };

  const showImage = Boolean(src) && !hasError;

  const formattedLastLogin = lastLoginAt
    ? new Date(lastLoginAt).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : null;

  const tooltipParts = [
    name,
    status ? `Status: ${status}` : null,
    formattedLastLogin ? `Last Login: ${formattedLastLogin}` : null,
    lastLoginIp ? `IP: ${lastLoginIp}` : null,
  ].filter(Boolean);

  const containerTitle = props.title || (tooltipParts.length > 0 ? tooltipParts.join(" • ") : undefined);

  const statusTitle = status
    ? [
        `Status: ${status === "active" ? "Active" : status === "blocked" ? "Blocked" : "Inactive"}`,
        formattedLastLogin ? `Last Login: ${formattedLastLogin}` : null,
        lastLoginIp ? `IP: ${lastLoginIp}` : null,
      ]
        .filter(Boolean)
        .join(" • ")
    : undefined;

  return (
    <div className="relative inline-block shrink-0" title={containerTitle} {...props}>
      <div
        className={`flex items-center justify-center font-bold select-none overflow-hidden ${
          sizeStyles[size]
        } ${shapeStyles[shape]} ${
          showImage
            ? "border border-neutral-200/80 dark:border-zinc-800 bg-neutral-100 dark:bg-zinc-800 shadow-2xs"
            : "bg-linear-to-tr from-primary/25 via-primary/10 to-orange-400/20 text-primary border border-primary/20 shadow-xs"
        } ${className}`}
      >
        {showImage ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={src || ""}
            alt={name || "Avatar"}
            className="h-full w-full object-cover"
            onError={() => setHasError(true)}
            loading="lazy"
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>

      {status && (
        <span
          title={statusTitle}
          className={`absolute bottom-0 right-0 rounded-full ring-2 ring-white dark:ring-zinc-950 ${
            statusDotSizes[size]
          } ${
            status === "active"
              ? "bg-emerald-500"
              : status === "blocked"
              ? "bg-rose-500"
              : "bg-neutral-400 dark:bg-zinc-600"
          }`}
        />
      )}
    </div>
  );
}


