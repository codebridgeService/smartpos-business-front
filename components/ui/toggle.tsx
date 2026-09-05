"use client";

import React from "react";

export interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: React.ReactNode;
  description?: string;
  disabled?: boolean;
}

export function ToggleSwitch({
  checked,
  onChange,
  label,
  description,
  disabled = false,
}: ToggleSwitchProps) {
  return (
    <label
      className={`inline-flex items-center justify-between gap-4 w-full select-none ${
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      }`}
    >
      {(label || description) && (
        <div className="flex flex-col">
          {label && (
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {label}
            </span>
          )}
          {description && (
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {description}
            </span>
          )}
        </div>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
          checked ? "bg-blue-600" : "bg-zinc-300 dark:bg-zinc-700"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </label>
  );
}
