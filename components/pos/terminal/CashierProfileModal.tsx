"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { ToggleSwitch } from "@/components/ui/toggle";
import { useToast } from "@/components/ui/toast";
import { cashierProfilesApi } from "@/lib/api/cashier-profiles";
import type { CashierProfile } from "@/types";
import {
  Shield,
  KeyRound,
  Percent,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  RotateCcw,
  Ban,
  BadgePercent,
  UserCheck,
} from "lucide-react";

interface CashierProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessUuid: string;
  businessUserUuid: string;
  userName?: string;
  onSuccess?: () => void;
}

export function CashierProfileModal({
  isOpen,
  onClose,
  businessUuid,
  businessUserUuid,
  userName = "Staff Member",
  onSuccess,
}: CashierProfileModalProps) {
  const toast = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [displayName, setDisplayName] = useState("");
  const [canSell, setCanSell] = useState(true);
  const [canRefund, setCanRefund] = useState(false);
  const [canVoid, setCanVoid] = useState(false);
  const [canDiscount, setCanDiscount] = useState(false);
  const [maxDiscountPercent, setMaxDiscountPercent] = useState("10.00");
  const [pinCode, setPinCode] = useState("");
  const [confirmPinCode, setConfirmPinCode] = useState("");

  // Load existing cashier profile
  useEffect(() => {
    if (!isOpen || !businessUuid || !businessUserUuid) return;

    let isMounted = true;
    const fetchProfile = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const profile = await cashierProfilesApi.getProfile(businessUuid, businessUserUuid);
        if (isMounted && profile) {
          setDisplayName(profile.display_name || "");
          setCanSell(profile.can_sell ?? true);
          setCanRefund(profile.can_refund ?? false);
          setCanVoid(profile.can_void ?? false);
          setCanDiscount(profile.can_discount ?? false);
          setMaxDiscountPercent(profile.max_discount_percent?.toString() || "10.00");
        }
      } catch (err: any) {
        // If not created yet, default values remain
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchProfile();
    return () => {
      isMounted = false;
    };
  }, [isOpen, businessUuid, businessUserUuid]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (pinCode && pinCode.length !== 4) {
      setError("PIN code must be exactly 4 numeric digits.");
      return;
    }

    if (pinCode && pinCode !== confirmPinCode) {
      setError("PIN codes do not match.");
      return;
    }

    const discountVal = parseFloat(maxDiscountPercent);
    if (canDiscount && (isNaN(discountVal) || discountVal < 0 || discountVal > 100)) {
      setError("Max discount percent must be between 0% and 100%.");
      return;
    }

    setIsSubmitting(true);
    try {
      await cashierProfilesApi.updateProfile(businessUuid, businessUserUuid, {
        display_name: displayName.trim() || undefined,
        can_sell: canSell,
        can_refund: canRefund,
        can_void: canVoid,
        can_discount: canDiscount,
        max_discount_percent: canDiscount ? discountVal.toFixed(2) : "0.00",
        pin_code: pinCode || undefined,
      });

      toast.success(`Cashier Profile Updated: Permissions updated for ${userName}`);
      setPinCode("");
      setConfirmPinCode("");
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update cashier profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cashier Permissions & PIN"
      description={`Configure POS cashier operations and terminal lock PIN for ${userName}.`}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5 pt-2">
        {error && (
          <div className="p-3.5 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* 1. Cashier Display Nickname */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            Cashier Nickname on Receipt / Screen
          </label>
          <input
            type="text"
            placeholder={userName}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
          />
        </div>

        {/* 2. Permission Toggles Matrix */}
        <div className="space-y-2.5">
          <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            Operational Privileges
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Can Sell */}
            <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CreditCard className="w-4 h-4 text-emerald-500" />
                <div>
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Ring Up Sales</h4>
                  <p className="text-[11px] text-zinc-500">Scan & checkout carts</p>
                </div>
              </div>
              <ToggleSwitch checked={canSell} onChange={setCanSell} />
            </div>

            {/* Can Refund */}
            <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <RotateCcw className="w-4 h-4 text-amber-500" />
                <div>
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Process Refunds</h4>
                  <p className="text-[11px] text-zinc-500">Issue customer refunds</p>
                </div>
              </div>
              <ToggleSwitch checked={canRefund} onChange={setCanRefund} />
            </div>

            {/* Can Void */}
            <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Ban className="w-4 h-4 text-rose-500" />
                <div>
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Void Line Items</h4>
                  <p className="text-[11px] text-zinc-500">Delete active cart lines</p>
                </div>
              </div>
              <ToggleSwitch checked={canVoid} onChange={setCanVoid} />
            </div>

            {/* Can Discount */}
            <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <BadgePercent className="w-4 h-4 text-blue-500" />
                <div>
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Custom Discounts</h4>
                  <p className="text-[11px] text-zinc-500">Apply item/cart markdowns</p>
                </div>
              </div>
              <ToggleSwitch checked={canDiscount} onChange={setCanDiscount} />
            </div>
          </div>
        </div>

        {/* 3. Max Discount Percent (if discount enabled) */}
        {canDiscount && (
          <div className="p-3.5 rounded-xl border border-blue-200 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20 space-y-2 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                <Percent className="w-3.5 h-3.5" />
                Maximum Allowed Discount (%)
              </label>
              <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                {maxDiscountPercent}%
              </span>
            </div>
            <input
              type="number"
              min="0"
              max="100"
              step="1"
              value={maxDiscountPercent}
              onChange={(e) => setMaxDiscountPercent(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-800 bg-white dark:bg-zinc-900 text-xs font-bold"
            />
          </div>
        )}

        {/* 4. Terminal Unlock PIN Setup */}
        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/50 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-900 dark:text-zinc-100">
            <KeyRound className="w-4 h-4 text-orange-500" />
            <span>4-Digit Terminal Quick PIN</span>
          </div>
          <p className="text-[11px] text-zinc-500">
            Used to lock and unlock the POS screen during cashier shifts without typing passwords.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
                New PIN (4 Digits)
              </label>
              <input
                type="password"
                maxLength={4}
                placeholder="••••"
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ""))}
                className="w-full mt-1 px-3 py-2 text-center tracking-widest font-mono text-base font-bold rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
                Confirm PIN
              </label>
              <input
                type="password"
                maxLength={4}
                placeholder="••••"
                value={confirmPinCode}
                onChange={(e) => setConfirmPinCode(e.target.value.replace(/\D/g, ""))}
                className="w-full mt-1 px-3 py-2 text-center tracking-widest font-mono text-base font-bold rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5"
          >
            {isSubmitting ? "Saving..." : "Save Cashier Profile"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
