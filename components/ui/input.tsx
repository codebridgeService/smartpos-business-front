"use client";

import React, { forwardRef, useState } from "react";
import { Eye, EyeOff, Search, X } from "lucide-react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const TextInput = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, className = "", id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-zinc-400">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`w-full rounded-xl border bg-white dark:bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 transition-all duration-150 focus:outline-none focus:ring-2 disabled:bg-zinc-100 dark:disabled:bg-zinc-800 disabled:cursor-not-allowed ${
              leftIcon ? "pl-10" : ""
            } ${rightIcon ? "pr-10" : ""} ${
              error
                ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                : "border-zinc-300 dark:border-zinc-700 focus:border-blue-500 focus:ring-blue-500/20"
            } ${className}`}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3.5 flex items-center text-zinc-400">
              {rightIcon}
            </div>
          )}
        </div>
        {error ? (
          <p className="mt-1.5 text-xs text-red-500 font-medium">{error}</p>
        ) : helperText ? (
          <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

TextInput.displayName = "TextInput";

export const PasswordInput = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <TextInput
      ref={ref}
      type={showPassword ? "text" : "password"}
      rightIcon={
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
          tabIndex={-1}
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      }
      {...props}
    />
  );
});

PasswordInput.displayName = "PasswordInput";

export interface SearchInputProps extends Omit<InputProps, "leftIcon"> {
  onClear?: () => void;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ onClear, value, onChange, ...props }, ref) => {
    return (
      <TextInput
        ref={ref}
        type="search"
        leftIcon={<Search className="h-4 w-4" />}
        rightIcon={
          value ? (
            <button
              type="button"
              onClick={onClear}
              className="hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
              tabIndex={-1}
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          ) : undefined
        }
        value={value}
        onChange={onChange}
        {...props}
      />
    );
  }
);

SearchInput.displayName = "SearchInput";
