"use client";

import React, { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { DoorOpen, DoorClosed, Clock, ShieldAlert, ChevronDown } from "lucide-react";
import { useShiftStore } from "@/stores/useShiftStore";
import { useBusiness } from "@/context/business-context";
import { OpenShiftModal } from "./OpenShiftModal";
import { CloseShiftModal } from "./CloseShiftModal";
import { useRegisterStore } from "@/stores/useRegisterStore";

export function ActiveShiftWidget() {
  const { activeBusiness } = useBusiness();
  const {
    activeShift,
    isLoading,
    setContext,
    fetchCurrentShift
  } = useShiftStore();

  // To know which register we are on, we ideally have a POS context.
  // For the admin dashboard, we might just show a placeholder or let them select a register.
  // In a real POS interface, the register ID is locked in.
  // For this widget to work in the admin layout, we'll need to know if they are assigned to a register.
  // We will assume for now that if they are an admin, they can see a specific outlet's register shift or it's hidden.

  // NOTE: In a full POS view, the active register UUID is bound to the device.
  // For this widget, we will just render a simplified view.

  const [isOpenModalOpen, setIsOpenModalOpen] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  // If we don't have a specific register context set in the shift store, don't render or render inactive.
  const { outletUuid, registerUuid } = useShiftStore.getState();

  // Polling or initial fetch
  useEffect(() => {
    if (outletUuid && registerUuid) {
      fetchCurrentShift();

      const interval = setInterval(() => {
        fetchCurrentShift();
      }, 60000); // Check every minute

      return () => clearInterval(interval);
    }
  }, [outletUuid, registerUuid, fetchCurrentShift]);

  if (!outletUuid || !registerUuid) {
    return null; // Hide widget if not in a POS context
  }

  const shiftStatus = activeShift?.status;

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="outline"
        size="sm"
        className="h-9 px-3 flex items-center gap-2 border-dashed border-border/60 bg-muted/20"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        {isLoading ? (
          <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        ) : shiftStatus === "open" ? (
          <>
            <div className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success"></span>
            </div>
            <span className="text-xs font-medium">Shift Open</span>
          </>
        ) : (
          <>
            <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground/50"></div>
            <span className="text-xs font-medium text-muted-foreground">Register Closed</span>
          </>
        )}
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
      </Button>

      {isDropdownOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl z-50 animate-in fade-in zoom-in-95 py-1">
          <div className="px-3 py-2 border-b border-border/50 text-sm font-semibold text-foreground">
            Register Session
          </div>

          {shiftStatus === "open" && activeShift ? (
            <>
              <div className="px-3 py-2 text-xs text-muted-foreground border-b border-border/50 bg-muted/10">
                <div className="flex justify-between items-center mb-1.5">
                  <span>Opened At</span>
                  <span className="text-foreground font-medium">
                    {new Date(activeShift.opened_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Start Float</span>
                  <span className="text-foreground font-medium">
                    ${parseFloat(activeShift.opening_cash).toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                className="w-full text-left px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors flex items-center"
                onClick={() => {
                  setIsCloseModalOpen(true);
                  setIsDropdownOpen(false);
                }}
              >
                <DoorClosed className="h-4 w-4 mr-2" />
                Close Shift (Z-Report)
              </button>
            </>
          ) : (
            <button
              className="w-full text-left px-3 py-2.5 text-sm font-medium text-primary hover:bg-primary/10 transition-colors flex items-center"
              onClick={() => {
                setIsOpenModalOpen(true);
                setIsDropdownOpen(false);
              }}
            >
              <DoorOpen className="h-4 w-4 mr-2" />
              Open Shift (Float Entry)
            </button>
          )}
        </div>
      )}

      <OpenShiftModal
        isOpen={isOpenModalOpen}
        onClose={() => setIsOpenModalOpen(false)}
      />

      {activeShift && (
        <CloseShiftModal
          isOpen={isCloseModalOpen}
          onClose={() => setIsCloseModalOpen(false)}
          shift={activeShift}
        />
      )}
    </div>
  );
}
