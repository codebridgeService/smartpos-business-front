"use client";

import React, { forwardRef } from "react";
import { Check } from "lucide-react";

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: React.ReactNode;
  description?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, className = "", id, checked, ...props }, ref) => {
    const inputId = id || (typeof label === "string" ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <label htmlFor={inputId} className="inline-flex items-start gap-3 cursor-pointer select-none">
        <div className="relative flex items-center mt-0.5">
          <input
            ref={ref}
            type="checkbox"
            id={inputId}
            checked={checked}
            className="peer sr-only"
            {...props}
          />
          <div className="h-5 w-5 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 peer-checked:bg-blue-600 peer-checked:border-blue-600 peer-focus:ring-2 peer-focus:ring-blue-500/20 transition-all flex items-center justify-center text-white">
            <Check className="h-3.5 w-3.5 opacity-0 peer-checked:opacity-100 stroke-[3] transition-opacity" />
          </div>
        </div>
        {(label || description) && (
          <div className="flex flex-col">
            {label && (
              <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                {label}
              </span>
            )}
            {description && (
              <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                {description}
              </span>
            )}
          </div>
        )}
      </label>
    );
  }
);

Checkbox.displayName = "Checkbox";
