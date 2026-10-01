"use client";

import React, { useMemo, useState, useRef, useCallback } from "react";
import { type CacheCategoryUsage } from "@/lib/storage/storage-types";
import { formatBytes } from "@/lib/storage/storage-policy";
import { HardDrive, Sparkles, Database, Layers } from "lucide-react";

interface StorageChartProps {
  categories: CacheCategoryUsage[];
  totalBytes: number;
  diskUsagePercentage?: number;
  className?: string;
}

export function StorageChart({
  categories,
  totalBytes,
  diskUsagePercentage = 0.05,
  className = "",
}: StorageChartProps) {
  const size = 260;
  const strokeWidth = 38;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  // Active segments calculation
  const segments = useMemo(() => {
    const active = categories.filter((c) => c.bytes > 0);
    const sumBytes = active.reduce((acc, curr) => acc + curr.bytes, 0);

    if (sumBytes === 0) {
      return [
        {
          key: "empty",
          name: "Empty Cache",
          bytes: 0,
          percentage: 100,
          startAngle: 0,
          endAngle: 360,
          color: "#334155",
          strokeDasharray: `${circumference} ${circumference}`,
          strokeDashoffset: 0,
          label: "",
          labelX: 0,
          labelY: 0,
        },
      ];
    }

    let accumulatedPct = 0;
    return active.map((cat) => {
      const pct = (cat.bytes / sumBytes) * 100;
      const strokeLength = (pct / 100) * circumference;
      const offset = -((accumulatedPct / 100) * circumference);

      const startAngle = accumulatedPct * 3.6;
      const endAngle = (accumulatedPct + pct) * 3.6;

      const midAngle = (accumulatedPct + pct / 2) * 3.6 - 90;
      const rad = (midAngle * Math.PI) / 180;
      const labelX = center + radius * Math.cos(rad);
      const labelY = center + radius * Math.sin(rad);

      accumulatedPct += pct;

      return {
        ...cat,
        percentage: pct,
        startAngle,
        endAngle,
        strokeDasharray: `${strokeLength} ${circumference}`,
        strokeDashoffset: offset,
        label: pct >= 8 ? `${Math.round(pct)}%` : "",
        labelX,
        labelY,
      };
    });
  }, [categories, circumference, center, radius]);

  // Determine currently hovered segment
  const hoveredSegment = useMemo(() => {
    if (!hoveredKey) return null;
    return segments.find((s) => s.key === hoveredKey) || null;
  }, [hoveredKey, segments]);

  // When only 1 category exists, identify it for default display
  const singleActiveSegment = useMemo(() => {
    const active = segments.filter((s) => s.key !== "empty" && s.bytes > 0);
    return active.length === 1 ? active[0] : null;
  }, [segments]);

  // Polar angle detection for seamless, buttery-smooth mouse tracking
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!containerRef.current || segments.length === 0 || segments[0].key === "empty") return;

      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const dx = mouseX - center;
      const dy = mouseY - center;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Check if mouse is hovering in or near the donut ring
      const innerRing = radius - strokeWidth / 2 - 12;
      const outerRing = radius + strokeWidth / 2 + 16;

      if (dist >= innerRing && dist <= outerRing) {
        // Calculate clockwise angle starting from 12 o'clock (0 to 360 deg)
        let angleDeg = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
        if (angleDeg < 0) angleDeg += 360;

        const matched = segments.find(
          (s) => angleDeg >= s.startAngle && angleDeg < s.endAngle
        );

        if (matched) {
          setHoveredKey(matched.key);
          setTooltipPos({ x: mouseX, y: mouseY });
          return;
        }
      }

      // If inside the center circle or outside the donut
      if (dist < innerRing) {
        // If single active category, keep it hovered; otherwise clear
        if (singleActiveSegment) {
          setHoveredKey(singleActiveSegment.key);
          setTooltipPos({ x: mouseX, y: mouseY });
        } else {
          setHoveredKey(null);
          setTooltipPos(null);
        }
      } else if (dist > outerRing) {
        setHoveredKey(null);
        setTooltipPos(null);
      }
    },
    [center, radius, strokeWidth, segments, singleActiveSegment]
  );

  const handleMouseLeave = useCallback(() => {
    setHoveredKey(null);
    setTooltipPos(null);
  }, []);

  return (
    <div
      className={`rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-7 shadow-xs flex flex-col items-center justify-center select-none relative ${className}`}
    >
      {/* Top Header Tag */}
      <div className="flex items-center justify-between w-full mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0">
            <HardDrive className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              Storage Usage
            </h3>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              Live browser memory & origin quota
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700 text-[11px] text-zinc-600 dark:text-zinc-300 font-medium">
          <Sparkles className="w-3 h-3 text-primary" />
          <span>Active Origin</span>
        </div>
      </div>

      {/* Donut Chart Container with Smooth Polar Mouse Tracking */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative flex items-center justify-center my-2 cursor-pointer touch-none"
        style={{ width: size, height: size }}
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90 transition-all duration-700 ease-out pointer-events-auto"
        >
          {/* Base track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="currentColor"
            className="text-zinc-100 dark:text-zinc-800"
            strokeWidth={strokeWidth}
          />

          {/* Segment Slices */}
          {segments.map((seg) => {
            const isHovered = hoveredKey === seg.key;
            const isAnyHovered = Boolean(hoveredKey);
            const currentStroke = isHovered ? strokeWidth + 4 : strokeWidth;
            const currentOpacity = isAnyHovered ? (isHovered ? 1 : 0.35) : 1;

            return (
              <circle
                key={seg.key}
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={seg.color}
                strokeWidth={currentStroke}
                strokeDasharray={seg.strokeDasharray}
                strokeDashoffset={seg.strokeDashoffset}
                strokeLinecap="round"
                style={{
                  opacity: currentOpacity,
                  pointerEvents: "stroke",
                  filter: isHovered ? `drop-shadow(0 0 10px ${seg.color}88)` : "none",
                }}
                className="transition-all duration-200"
              />
            );
          })}
        </svg>

        {/* Slice percentage labels */}
        <div className="absolute inset-0 pointer-events-none">
          {segments.map(
            (seg) =>
              seg.label && (
                <div
                  key={`lbl-${seg.key}`}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 text-[11px] font-bold text-white drop-shadow-md pointer-events-none transition-opacity duration-200"
                  style={{
                    left: `${seg.labelX}px`,
                    top: `${seg.labelY}px`,
                    opacity: hoveredKey && hoveredKey !== seg.key ? 0.2 : 1,
                  }}
                >
                  {seg.label}
                </div>
              )
          )}
        </div>

        {/* Center Cutout with Dynamic Hover Readout */}
        <div
          className="absolute rounded-full flex flex-col items-center justify-center text-center p-3 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm pointer-events-none transition-all duration-200"
          style={{
            width: size - strokeWidth * 2 - 12,
            height: size - strokeWidth * 2 - 12,
          }}
        >
          {hoveredSegment && hoveredSegment.key !== "empty" ? (
            <div className="flex flex-col items-center justify-center px-2 max-w-full animate-in fade-in zoom-in-95 duration-150">
              <span
                className="text-[11px] font-black uppercase tracking-wider line-clamp-1 mb-0.5"
                style={{ color: hoveredSegment.color }}
              >
                {hoveredSegment.name}
              </span>
              <span className="text-xl sm:text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
                {formatBytes(hoveredSegment.bytes)}
              </span>
              <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 mt-0.5">
                {hoveredSegment.percentage.toFixed(1)}% of cache
              </span>
            </div>
          ) : singleActiveSegment ? (
            /* When exactly one cache category is populated, display its name clearly */
            <div className="flex flex-col items-center justify-center px-2 max-w-full">
              <span
                className="text-[11px] font-extrabold uppercase tracking-wider line-clamp-1 mb-0.5"
                style={{ color: singleActiveSegment.color }}
              >
                {singleActiveSegment.name}
              </span>
              <span className="text-xl sm:text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
                {formatBytes(totalBytes)}
              </span>
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest mt-0.5">
                100% of Cache
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center">
              <span className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
                {formatBytes(totalBytes)}
              </span>
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest mt-0.5">
                Total Cache
              </span>
            </div>
          )}
        </div>

        {/* Floating Tooltip displaying Cache Name following cursor */}
        {hoveredSegment && hoveredSegment.key !== "empty" && tooltipPos && (
          <div
            className="absolute z-30 pointer-events-none transition-all duration-75 ease-out"
            style={{
              left: Math.min(Math.max(tooltipPos.x + 12, 10), size - 170),
              top: Math.min(Math.max(tooltipPos.y - 48, 10), size - 50),
            }}
          >
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-950/95 text-white shadow-xl backdrop-blur-md border border-white/10 text-xs whitespace-nowrap animate-in fade-in zoom-in-95 duration-100">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                style={{ backgroundColor: hoveredSegment.color }}
              />
              <div className="flex flex-col leading-tight">
                <span className="font-bold text-white text-[12px]">
                  {hoveredSegment.name}
                </span>
                <span className="text-[10px] text-zinc-400 font-medium">
                  {formatBytes(hoveredSegment.bytes)} • {hoveredSegment.percentage.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Hover Feedback Chip */}
      <div className="h-7 flex items-center justify-center mt-2 w-full">
        {hoveredSegment && hoveredSegment.key !== "empty" ? (
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-medium border bg-zinc-50 dark:bg-zinc-800/90 border-zinc-200 dark:border-zinc-700 shadow-xs animate-in fade-in duration-150">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs animate-pulse"
              style={{ backgroundColor: hoveredSegment.color }}
            />
            <span className="text-zinc-900 dark:text-zinc-100 font-bold">
              {hoveredSegment.name}
            </span>
            <span className="font-mono text-zinc-600 dark:text-zinc-300">
              {formatBytes(hoveredSegment.bytes)} ({hoveredSegment.percentage.toFixed(1)}%)
            </span>
          </div>
        ) : singleActiveSegment ? (
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-medium border bg-zinc-50 dark:bg-zinc-800/90 border-zinc-200 dark:border-zinc-700 shadow-xs">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
              style={{ backgroundColor: singleActiveSegment.color }}
            />
            <span className="text-zinc-900 dark:text-zinc-100 font-bold">
              {singleActiveSegment.name}
            </span>
            <span className="font-mono text-zinc-600 dark:text-zinc-300">
              {formatBytes(singleActiveSegment.bytes)} (100%)
            </span>
          </div>
        ) : (
          <span className="text-[11px] text-zinc-400 dark:text-zinc-500 font-medium">
            Hover over the ring to inspect cache category name & size
          </span>
        )}
      </div>

      {/* Disk Space Progress Meter */}
      <div className="mt-4 w-full space-y-2 pt-4 border-t border-zinc-100 dark:border-zinc-800/80">
        <div className="flex items-center justify-between text-xs px-1">
          <span className="text-zinc-500 dark:text-zinc-400">Browser Disk Usage</span>
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">
            {diskUsagePercentage}% of free space
          </span>
        </div>

        <div className="w-full h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden p-0.5 border border-zinc-200/60 dark:border-zinc-700/60">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500 shadow-xs"
            style={{ width: `${Math.min(Math.max(diskUsagePercentage * 10, 5), 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
