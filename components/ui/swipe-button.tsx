"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { ChevronRight, Check, Loader2, Sparkles } from "lucide-react";

export interface SwipeButtonProps {
  onConfirm: () => void | Promise<void>;
  label?: string;
  successLabel?: string;
  loadingLabel?: string;
  variant?: "primary" | "orange" | "success" | "danger" | "purple";
  disabled?: boolean;
  isLoading?: boolean;
  isSuccess?: boolean;
  className?: string;
  threshold?: number; // 0 to 1, default 0.85
  icon?: React.ReactNode;
}

const variantStyles = {
  orange: {
    track: "bg-orange-950/20 border-orange-500/30 text-orange-600 dark:text-orange-400",
    fill: "bg-gradient-to-r from-orange-500/20 to-amber-500/40 border-r border-orange-500/50",
    thumb: "bg-gradient-to-tr from-orange-500 to-amber-500 text-white shadow-orange-500/30 hover:shadow-orange-500/50",
    successBg: "bg-gradient-to-r from-emerald-600 to-teal-600 text-white",
    shimmer: "from-orange-500/0 via-orange-400/20 to-orange-500/0",
  },
  primary: {
    track: "bg-blue-950/20 border-blue-500/30 text-blue-600 dark:text-blue-400",
    fill: "bg-gradient-to-r from-blue-500/20 to-indigo-500/40 border-r border-blue-500/50",
    thumb: "bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-blue-500/30 hover:shadow-blue-500/50",
    successBg: "bg-gradient-to-r from-emerald-600 to-teal-600 text-white",
    shimmer: "from-blue-500/0 via-blue-400/20 to-blue-500/0",
  },
  success: {
    track: "bg-emerald-950/20 border-emerald-500/30 text-emerald-600 dark:text-emerald-400",
    fill: "bg-gradient-to-r from-emerald-500/20 to-teal-500/40 border-r border-emerald-500/50",
    thumb: "bg-gradient-to-tr from-emerald-600 to-teal-600 text-white shadow-emerald-500/30 hover:shadow-emerald-500/50",
    successBg: "bg-gradient-to-r from-emerald-600 to-teal-600 text-white",
    shimmer: "from-emerald-500/0 via-emerald-400/20 to-emerald-500/0",
  },
  danger: {
    track: "bg-rose-950/20 border-rose-500/30 text-rose-600 dark:text-rose-400",
    fill: "bg-gradient-to-r from-rose-500/20 to-red-500/40 border-r border-rose-500/50",
    thumb: "bg-gradient-to-tr from-rose-600 to-red-600 text-white shadow-rose-500/30 hover:shadow-rose-500/50",
    successBg: "bg-gradient-to-r from-rose-600 to-red-600 text-white",
    shimmer: "from-rose-500/0 via-rose-400/20 to-rose-500/0",
  },
  purple: {
    track: "bg-purple-950/20 border-purple-500/30 text-purple-600 dark:text-purple-400",
    fill: "bg-gradient-to-r from-purple-500/20 to-fuchsia-500/40 border-r border-purple-500/50",
    thumb: "bg-gradient-to-tr from-purple-600 to-fuchsia-600 text-white shadow-purple-500/30 hover:shadow-purple-500/50",
    successBg: "bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white",
    shimmer: "from-purple-500/0 via-purple-400/20 to-purple-500/0",
  },
};

export const SwipeButton: React.FC<SwipeButtonProps> = ({
  onConfirm,
  label = "Swipe to apply",
  successLabel = "Applied!",
  loadingLabel = "Applying...",
  variant = "orange",
  disabled = false,
  isLoading = false,
  isSuccess = false,
  className = "",
  threshold = 0.85,
  icon,
}) => {
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [hasConfirmed, setHasConfirmed] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef<number>(0);

  const colors = variantStyles[variant] || variantStyles.orange;

  const getMaxDrag = useCallback(() => {
    if (!trackRef.current || !thumbRef.current) return 0;
    const trackWidth = trackRef.current.offsetWidth;
    const thumbWidth = thumbRef.current.offsetWidth;
    return Math.max(0, trackWidth - thumbWidth - 8); // 4px padding on each side
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled || isLoading || isSuccess || hasConfirmed) return;
    setIsDragging(true);
    startXRef.current = e.clientX - dragX;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || disabled || isLoading || isSuccess || hasConfirmed) return;
    const maxDrag = getMaxDrag();
    if (maxDrag <= 0) return;

    const newX = Math.max(0, Math.min(e.clientX - startXRef.current, maxDrag));
    setDragX(newX);
  };

  const triggerConfirm = useCallback(async () => {
    setHasConfirmed(true);
    try {
      await onConfirm();
    } catch {
      // Revert if error thrown
      setHasConfirmed(false);
      setDragX(0);
    }
  }, [onConfirm]);

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setIsDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    const maxDrag = getMaxDrag();
    if (maxDrag > 0 && dragX / maxDrag >= threshold) {
      setDragX(maxDrag);
      triggerConfirm();
    } else {
      // Snap back
      setDragX(0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled || isLoading || isSuccess || hasConfirmed) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const maxDrag = getMaxDrag();
      setDragX(maxDrag);
      triggerConfirm();
    }
  };

  // Reset if disabled or explicitly requested
  useEffect(() => {
    if (!isSuccess && !hasConfirmed) {
      setDragX(0);
    }
  }, [isSuccess, hasConfirmed]);

  const maxDrag = getMaxDrag();
  const progressRatio = maxDrag > 0 ? Math.min(1, dragX / maxDrag) : 0;
  const showConfirmed = isSuccess || hasConfirmed;

  return (
    <div
      ref={trackRef}
      role="slider"
      aria-label={label}
      aria-valuenow={Math.round(progressRatio * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={handleKeyDown}
      className={`relative select-none h-12 w-full rounded-2xl overflow-hidden border p-1 transition-colors flex items-center shadow-inner ${
        showConfirmed
          ? colors.successBg
          : disabled
          ? "bg-slate-100 dark:bg-zinc-800/40 border-slate-200 dark:border-zinc-800 opacity-60 cursor-not-allowed"
          : `bg-slate-50 dark:bg-zinc-900 border-slate-200/80 dark:border-zinc-700/80 ${className}`
      }`}
    >
      {/* Dynamic progress fill */}
      {!showConfirmed && !disabled && (
        <div
          className={`absolute left-0 top-0 bottom-0 pointer-events-none transition-[width] duration-75 ${colors.fill}`}
          style={{ width: `${dragX + (thumbRef.current?.offsetWidth || 40)}px` }}
        />
      )}

      {/* Background Track Label */}
      <div
        className={`absolute inset-0 flex items-center justify-center pointer-events-none px-12 transition-opacity duration-200 ${
          showConfirmed ? "opacity-100" : ""
        }`}
        style={{
          opacity: showConfirmed ? 1 : 1 - progressRatio * 1.5,
        }}
      >
        <span
          className={`text-xs font-bold tracking-wide uppercase flex items-center gap-1.5 ${
            showConfirmed
              ? "text-white"
              : disabled
              ? "text-slate-400 dark:text-zinc-500"
              : colors.track.split(" ").slice(-1)[0]
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {loadingLabel}
            </>
          ) : showConfirmed ? (
            <>
              <Check className="h-4 w-4 stroke-[3]" />
              {successLabel}
            </>
          ) : (
            <>
              <Sparkles className="h-3.5 w-3.5 opacity-70 animate-pulse" />
              {label}
              <ChevronRight className="h-3.5 w-3.5 opacity-50 animate-bounce" />
            </>
          )}
        </span>
      </div>

      {/* Draggable Thumb */}
      {!showConfirmed && (
        <div
          ref={thumbRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          style={{
            transform: `translateX(${dragX}px)`,
            transition: isDragging ? "none" : "transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
          className={`relative z-10 h-10 w-10 rounded-xl flex items-center justify-center font-bold shadow-md cursor-grab active:cursor-grabbing touch-none transition-shadow ${
            disabled
              ? "bg-slate-300 dark:bg-zinc-700 text-slate-500 cursor-not-allowed shadow-none"
              : `${colors.thumb}`
          }`}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-white" />
          ) : (
            icon || <ChevronRight className="h-5 w-5 stroke-[2.5]" />
          )}
        </div>
      )}
    </div>
  );
};
