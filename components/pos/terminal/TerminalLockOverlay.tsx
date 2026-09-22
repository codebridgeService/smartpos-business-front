"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useCashierSessionStore } from "@/stores/useCashierSessionStore";
import { Lock, Unlock, Delete, AlertCircle, ShieldAlert, User, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TerminalLockOverlayProps {
  outletUuid: string;
  cashierName?: string;
  registerName?: string;
  onUnlocked?: () => void;
}

export function TerminalLockOverlay({
  outletUuid,
  cashierName = "Cashier",
  registerName = "Terminal #1",
  onUnlocked,
}: TerminalLockOverlayProps) {
  const {
    isLocked,
    unlockSession,
    isUnlocking,
    unlockError,
    clearUnlockError,
  } = useCashierSessionStore();

  const [pin, setPin] = useState("");
  const [shake, setShake] = useState(false);

  // Handle digit press
  const handleDigit = useCallback(
    (digit: string) => {
      clearUnlockError();
      if (pin.length < 6) {
        setPin((prev) => prev + digit);
      }
    },
    [pin.length, clearUnlockError]
  );

  // Handle backspace
  const handleBackspace = useCallback(() => {
    clearUnlockError();
    setPin((prev) => prev.slice(0, -1));
  }, [clearUnlockError]);

  // Handle clear
  const handleClear = useCallback(() => {
    clearUnlockError();
    setPin("");
  }, [clearUnlockError]);

  // Trigger unlock when PIN reaches 4 or 6 digits or user submits
  const handleUnlock = useCallback(async () => {
    if (pin.length < 4 || isUnlocking) return;

    const success = await unlockSession(outletUuid, pin);
    if (success) {
      setPin("");
      onUnlocked?.();
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setPin("");
    }
  }, [pin, isUnlocking, unlockSession, outletUuid, onUnlocked]);

  // Auto-submit on 4 digits if enabled
  useEffect(() => {
    if (pin.length === 4) {
      handleUnlock();
    }
  }, [pin, handleUnlock]);

  // Keyboard support: listen to numbers and backspace/enter
  useEffect(() => {
    if (!isLocked) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) {
        handleDigit(e.key);
      } else if (e.key === "Backspace") {
        handleBackspace();
      } else if (e.key === "Escape" || e.key === "c" || e.key === "C") {
        handleClear();
      } else if (e.key === "Enter") {
        handleUnlock();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLocked, handleDigit, handleBackspace, handleClear, handleUnlock]);

  if (!isLocked) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div
        className={`w-full max-w-sm rounded-3xl border border-zinc-800 bg-zinc-900/95 p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center ${
          shake ? "animate-shake" : ""
        }`}
      >
        {/* Lock Icon */}
        <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-500 flex items-center justify-center mb-4 shadow-inner">
          <Lock className="w-8 h-8" />
        </div>

        {/* Title & Terminal details */}
        <h2 className="text-xl font-bold text-white tracking-tight">Terminal Locked</h2>
        <div className="flex items-center gap-2 mt-1 text-xs text-zinc-400">
          <span className="flex items-center gap-1">
            <User className="w-3.5 h-3.5 text-zinc-500" />
            {cashierName}
          </span>
          <span>•</span>
          <span>{registerName}</span>
        </div>

        {/* Masked PIN Dots */}
        <div className="flex items-center justify-center gap-3 my-6">
          {[0, 1, 2, 3].map((index) => {
            const isFilled = index < pin.length;
            return (
              <div
                key={index}
                className={`w-4 h-4 rounded-full transition-all duration-200 ${
                  isFilled
                    ? "bg-orange-500 ring-4 ring-orange-500/20 scale-110"
                    : "border-2 border-zinc-700 bg-zinc-800/60"
                }`}
              />
            );
          })}
        </div>

        {/* Error message */}
        {unlockError && (
          <div className="w-full mb-4 p-2.5 rounded-xl border border-rose-900/50 bg-rose-950/40 text-rose-400 text-xs flex items-center justify-center gap-2 animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{unlockError}</span>
          </div>
        )}

        {/* Touch / Click Numeric Keypad */}
        <div className="grid grid-cols-3 gap-2.5 w-full">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleDigit(num.toString())}
              disabled={isUnlocking}
              className="h-14 rounded-2xl bg-zinc-800/80 hover:bg-zinc-700/80 active:bg-orange-500 active:text-white border border-zinc-700/60 text-xl font-bold text-zinc-100 transition-all active:scale-95 shadow-xs"
            >
              {num}
            </button>
          ))}

          {/* Clear Button */}
          <button
            type="button"
            onClick={handleClear}
            disabled={isUnlocking}
            className="h-14 rounded-2xl bg-zinc-800/40 hover:bg-zinc-800 text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-all active:scale-95 border border-zinc-800/60 uppercase tracking-wider"
          >
            Clear
          </button>

          {/* 0 Button */}
          <button
            type="button"
            onClick={() => handleDigit("0")}
            disabled={isUnlocking}
            className="h-14 rounded-2xl bg-zinc-800/80 hover:bg-zinc-700/80 active:bg-orange-500 active:text-white border border-zinc-700/60 text-xl font-bold text-zinc-100 transition-all active:scale-95 shadow-xs"
          >
            0
          </button>

          {/* Backspace Button */}
          <button
            type="button"
            onClick={handleBackspace}
            disabled={isUnlocking}
            className="h-14 rounded-2xl bg-zinc-800/40 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 flex items-center justify-center transition-all active:scale-95 border border-zinc-800/60"
            aria-label="Backspace"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Security / Idle Notice */}
        <p className="text-[11px] text-zinc-500 mt-5">
          Enter 4-digit Cashier PIN code to resume sales session.
        </p>
      </div>
    </div>
  );
}
