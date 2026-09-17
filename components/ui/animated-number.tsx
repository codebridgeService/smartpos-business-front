"use client";

import React, { useEffect, useState, useRef } from "react";

export interface AnimatedNumberProps {
  value: number;
  duration?: number; // Duration in ms, defaults to 1000ms
  prefix?: string;
  suffix?: string;
  decimals?: number;
  formatter?: (n: number) => string;
  className?: string;
}

export function AnimatedNumber({
  value,
  duration = 1000,
  prefix = "",
  suffix = "",
  decimals = 0,
  formatter,
  className = "",
}: AnimatedNumberProps) {
  const isTest = typeof process !== "undefined" && process.env?.NODE_ENV === "test";
  const [displayValue, setDisplayValue] = useState<number>(() => (isTest ? value : 0));
  const startTimestampRef = useRef<number | null>(null);
  const startValueRef = useRef<number>(isTest ? value : 0);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (isTest) {
      setDisplayValue(value);
      return;
    }

    const startVal = startValueRef.current;
    const targetVal = value;
    startTimestampRef.current = null;

    // Ease-out cubic easing for smooth deceleration
    const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

    const step = (timestamp: number) => {
      if (!startTimestampRef.current) {
        startTimestampRef.current = timestamp;
      }
      const elapsed = timestamp - startTimestampRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(progress);

      const current = startVal + (targetVal - startVal) * easedProgress;
      setDisplayValue(current);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(step);
      } else {
        setDisplayValue(targetVal);
        startValueRef.current = targetVal;
      }
    };

    animationFrameRef.current = requestAnimationFrame(step);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [value, duration, isTest]);

  const formattedText = (() => {
    if (formatter) {
      return formatter(displayValue);
    }
    const fixed = displayValue.toFixed(decimals);
    const parts = fixed.split(".");
    // Format thousands separator
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  })();

  return (
    <span className={`tabular-nums transition-all ${className}`}>
      {prefix}
      {formattedText}
      {suffix}
    </span>
  );
}
