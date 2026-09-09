"use client";

import React, { useState, useEffect } from "react";
import {
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Delete,
  RotateCcw,
  Building2,
  Lock,
  Eye,
  EyeOff,
  Check,
  Smartphone,
  Save,
  Sparkles,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/context/auth-context";
import { useBusiness } from "@/context/business-context";
import { apiClient } from "@/lib/api";
import type { SetPosPinResponse, VerifyPosPinResponse } from "@/types";

export function PosPinView() {
  const { user } = useAuth();
  const { businesses, activeBusiness } = useBusiness();
  const toast = useToast();

  // Selected Business for POS PIN
  const [selectedBusinessUuid, setSelectedBusinessUuid] = useState<string>("");

  useEffect(() => {
    if (activeBusiness?.uuid) {
      setSelectedBusinessUuid(activeBusiness.uuid);
    } else if (businesses.length > 0) {
      setSelectedBusinessUuid(businesses[0].uuid);
    }
  }, [activeBusiness, businesses]);

  // Form State: Set PIN
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSavingPin, setIsSavingPin] = useState(false);

  // Verification Simulator State
  const [testPin, setTestPin] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    status: "idle" | "success" | "error";
    message: string;
  }>({ status: "idle", message: "" });
  const [isShaking, setIsShaking] = useState(false);

  // ---------------------------------------------------------------------------
  // Set / Change PIN Handler
  // ---------------------------------------------------------------------------

  const handleSavePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uuid) return;

    const errors: Record<string, string> = {};

    if (!selectedBusinessUuid) {
      errors.business = "Please select a business.";
    }

    if (!newPin) {
      errors.pin = "PIN is required.";
    } else if (!/^\d{4,6}$/.test(newPin)) {
      errors.pin = "PIN must be between 4 and 6 numeric digits.";
    }

    if (newPin !== confirmPin) {
      errors.confirmPin = "PINs do not match.";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error("Please fix errors in the form.");
      return;
    }

    setIsSavingPin(true);
    setFormErrors({});

    try {
      await apiClient.put<SetPosPinResponse>(`/users/${user.uuid}/pos-pin`, {
        business_uuid: selectedBusinessUuid,
        pin: newPin,
      });

      toast.success("POS Fast-Access PIN updated successfully!");
      setNewPin("");
      setConfirmPin("");
      setVerificationResult({
        status: "idle",
        message: "PIN updated. You can now test it on the simulator.",
      });
    } catch (err: any) {
      const msg =
        err?.data?.message ||
        err?.message ||
        "Failed to update POS PIN. Please try again.";
      toast.error(msg);
    } finally {
      setIsSavingPin(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Verification Pad Simulator Handlers
  // ---------------------------------------------------------------------------

  const handleKeypadPress = (digit: string) => {
    if (testPin.length >= 6) return;
    setVerificationResult({ status: "idle", message: "" });
    setTestPin((prev) => prev + digit);
  };

  const handleKeypadClear = () => {
    setTestPin("");
    setVerificationResult({ status: "idle", message: "" });
  };

  const handleKeypadBackspace = () => {
    setTestPin((prev) => prev.slice(0, -1));
    setVerificationResult({ status: "idle", message: "" });
  };

  const handleVerifyTestPin = async () => {
    if (!user?.uuid) return;

    if (!selectedBusinessUuid) {
      toast.error("Please select a business first.");
      return;
    }

    if (testPin.length < 4) {
      setVerificationResult({
        status: "error",
        message: "PIN must be at least 4 digits.",
      });
      triggerShake();
      return;
    }

    setIsVerifying(true);

    try {
      const res = await apiClient.post<VerifyPosPinResponse>(
        `/users/${user.uuid}/pos-pin/verify`,
        {
          business_uuid: selectedBusinessUuid,
          pin: testPin,
        }
      );

      setVerificationResult({
        status: "success",
        message: res?.message || "Cashier PIN verified! Terminal authorization granted.",
      });
      toast.success("POS PIN verified successfully!");
    } catch (err: any) {
      const msg =
        err?.data?.message ||
        err?.message ||
        "Invalid POS PIN. Authorization rejected.";

      setVerificationResult({
        status: "error",
        message: msg,
      });
      triggerShake();
      toast.error(msg);
    } finally {
      setIsVerifying(false);
    }
  };

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  // Business options for select
  const businessOptions = businesses.map((b) => ({
    value: b.uuid,
    label: b.name,
  }));

  const selectedBusinessName =
    businesses.find((b) => b.uuid === selectedBusinessUuid)?.name ||
    activeBusiness?.name ||
    "Selected Store";

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            POS Fast-Access PIN
          </h1>
          <Badge variant="primary" size="sm">
            Phase 2.4
          </Badge>
        </div>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Configure and verify 4-to-6 digit numeric PINs for rapid cashier authorization on POS registers.
        </p>
      </div>

      {/* Business Selector Banner */}
      <Card className="bg-gradient-to-r from-blue-50/70 to-indigo-50/70 dark:from-zinc-900 dark:to-zinc-900 border-blue-200/60 dark:border-zinc-800">
        <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-500/30">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Store Affiliation
              </p>
              <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
                {selectedBusinessName}
              </h3>
            </div>
          </div>

          <div className="w-full sm:w-64">
            <Select
              value={selectedBusinessUuid}
              onChange={(e) => {
                setSelectedBusinessUuid(e.target.value);
                setVerificationResult({ status: "idle", message: "" });
                setTestPin("");
              }}
              options={
                businessOptions.length > 0
                  ? businessOptions
                  : [{ value: "", label: "No Business Available" }]
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Main Grid: Form (Left) & PIN Simulator (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* LEFT: Set / Change PIN Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-blue-500" />
              Set Cashier POS PIN
            </CardTitle>
            <CardDescription>
              Enter a secure 4 to 6 digit numeric code. Avoid predictable sequences like 1234 or 0000.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSavePin} className="space-y-4">
              <TextInput
                id="pos-new-pin"
                type={showPin ? "text" : "password"}
                label="New 4-6 Digit POS PIN"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                required
                value={newPin}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setNewPin(val);
                }}
                error={formErrors.pin}
                leftIcon={<Lock className="h-4 w-4" />}
                placeholder="Enter 4 to 6 digits"
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                  >
                    {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
              />

              <TextInput
                id="pos-confirm-pin"
                type={showPin ? "text" : "password"}
                label="Confirm POS PIN"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                required
                value={confirmPin}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setConfirmPin(val);
                }}
                error={formErrors.confirmPin}
                leftIcon={<Lock className="h-4 w-4" />}
                placeholder="Re-enter same digits"
              />

              {/* Quick helper notes */}
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700 text-xs text-zinc-500 dark:text-zinc-400 space-y-1">
                <p className="font-semibold text-zinc-700 dark:text-zinc-300">
                  POS Security Standards:
                </p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li>PIN is securely hashed using bcrypt on the server.</li>
                  <li>Used to quickly unlock POS terminals and approve transactions.</li>
                  <li>Locked for 15 minutes after 5 consecutive failed attempts.</li>
                </ul>
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={!newPin || !confirmPin || isSavingPin}
                  isLoading={isSavingPin}
                  leftIcon={<Save className="h-4 w-4" />}
                >
                  Save Cashier PIN
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* RIGHT: In-App Terminal Simulator */}
        <Card className="overflow-hidden border-zinc-200/80 dark:border-zinc-800 shadow-md">
          <CardHeader className="bg-zinc-900 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-emerald-400" />
                <CardTitle className="text-base text-white">
                  Terminal PIN Simulator
                </CardTitle>
              </div>
              <Badge variant="success" size="sm">
                Ready to test
              </Badge>
            </div>
            <CardDescription className="text-zinc-400">
              Interactive sandbox simulating cashier unlock on smart terminal hardware.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 flex flex-col items-center justify-center space-y-6">
            {/* Screen Mockup */}
            <div
              className={`w-full max-w-xs p-5 rounded-2xl border text-center transition-all duration-200 ${
                isShaking ? "animate-shake border-red-500 bg-red-50/50 dark:bg-red-950/20" : ""
              } ${
                verificationResult.status === "success"
                  ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20"
                  : "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900"
              }`}
            >
              <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                {selectedBusinessName}
              </p>
              <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-4">
                Enter Cashier PIN
              </h4>

              {/* Masked PIN Dots */}
              <div className="flex items-center justify-center gap-3 mb-2 h-8">
                {Array.from({ length: 6 }).map((_, idx) => {
                  const isFilled = idx < testPin.length;
                  return (
                    <div
                      key={idx}
                      className={`h-4 w-4 rounded-full transition-all duration-150 ${
                        isFilled
                          ? verificationResult.status === "success"
                            ? "bg-emerald-500 scale-110 shadow-sm shadow-emerald-500/50"
                            : verificationResult.status === "error"
                            ? "bg-red-500 scale-110 shadow-sm shadow-red-500/50"
                            : "bg-blue-600 dark:bg-blue-500 scale-110 shadow-sm shadow-blue-500/50"
                          : "border-2 border-zinc-300 dark:border-zinc-700 bg-transparent"
                      }`}
                    />
                  );
                })}
              </div>

              {/* Status feedback */}
              <div className="min-h-[24px]">
                {verificationResult.status === "success" && (
                  <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {verificationResult.message}
                  </p>
                )}
                {verificationResult.status === "error" && (
                  <p className="text-xs font-semibold text-red-600 dark:text-red-400 flex items-center justify-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {verificationResult.message}
                  </p>
                )}
                {verificationResult.status === "idle" && (
                  <p className="text-[11px] text-zinc-400">
                    {testPin.length === 0
                      ? "Use keypad to enter your PIN"
                      : `${testPin.length} digit${testPin.length > 1 ? "s" : ""} entered`}
                  </p>
                )}
              </div>
            </div>

            {/* Tactile Numeric Keypad */}
            <div className="grid grid-cols-3 gap-2.5 w-full max-w-xs">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleKeypadPress(num)}
                  className="h-12 rounded-xl text-lg font-bold bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-700 active:scale-95 transition-all shadow-sm flex items-center justify-center"
                >
                  {num}
                </button>
              ))}

              {/* Bottom Row: Clear, 0, Backspace */}
              <button
                type="button"
                onClick={handleKeypadClear}
                className="h-12 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 active:scale-95 transition-all flex items-center justify-center"
              >
                Clear
              </button>

              <button
                type="button"
                onClick={() => handleKeypadPress("0")}
                className="h-12 rounded-xl text-lg font-bold bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-700 active:scale-95 transition-all shadow-sm flex items-center justify-center"
              >
                0
              </button>

              <button
                type="button"
                onClick={handleKeypadBackspace}
                className="h-12 rounded-xl text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700 active:scale-95 transition-all flex items-center justify-center"
                aria-label="Backspace"
              >
                <Delete className="h-5 w-5" />
              </button>
            </div>

            {/* Test Submit Button */}
            <div className="w-full max-w-xs">
              <Button
                type="button"
                variant="primary"
                size="md"
                className="w-full"
                disabled={testPin.length < 4 || isVerifying}
                isLoading={isVerifying}
                onClick={handleVerifyTestPin}
                leftIcon={<ShieldCheck className="h-4 w-4" />}
              >
                Verify PIN
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
