import { create } from "zustand";
import type { CashierSession } from "@/types";
import { cashierSessionsApi, StartCashierSessionRequest } from "@/lib/api/cashier-sessions";

export interface CashierSessionState {
  currentSession: CashierSession | null;
  isLocked: boolean;
  isLoading: boolean;
  isUnlocking: boolean;
  unlockError: string | null;
  error: string | null;

  // Auto-lock settings (in seconds, default 300 = 5 minutes, 0 = disabled)
  idleTimeoutSeconds: number;
  lastActivityTime: number;

  // Actions
  fetchCurrentSession: (outletUuid: string, registerUuid?: string) => Promise<void>;
  startSession: (outletUuid: string, data: StartCashierSessionRequest) => Promise<CashierSession>;
  lockSession: (outletUuid: string) => Promise<void>;
  unlockSession: (outletUuid: string, pinCode: string) => Promise<boolean>;
  endSession: (outletUuid: string) => Promise<void>;
  recordActivity: () => void;
  setIdleTimeout: (seconds: number) => void;
  clearUnlockError: () => void;
}

export const useCashierSessionStore = create<CashierSessionState>((set, get) => ({
  currentSession: null,
  isLocked: false,
  isLoading: false,
  isUnlocking: false,
  unlockError: null,
  error: null,
  idleTimeoutSeconds: 300, // 5 min auto-lock
  lastActivityTime: Date.now(),

  fetchCurrentSession: async (outletUuid: string, registerUuid?: string) => {
    try {
      set({ isLoading: true, error: null });
      const session = await cashierSessionsApi.getCurrentSession(outletUuid, registerUuid);
      set({
        currentSession: session,
        isLocked: session ? session.status === "locked" : false,
        isLoading: false,
        lastActivityTime: Date.now(),
      });
    } catch (err: any) {
      set({
        error: err.response?.data?.message || "Failed to fetch cashier session",
        isLoading: false,
      });
    }
  },

  startSession: async (outletUuid: string, data: StartCashierSessionRequest) => {
    try {
      set({ isLoading: true, error: null });
      const session = await cashierSessionsApi.startSession(outletUuid, data);
      set({
        currentSession: session,
        isLocked: false,
        isLoading: false,
        lastActivityTime: Date.now(),
      });
      return session;
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to start cashier session";
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  lockSession: async (outletUuid: string) => {
    const { currentSession } = get();
    if (!currentSession) {
      // If no active server session, just lock UI locally
      set({ isLocked: true, unlockError: null });
      return;
    }

    try {
      set({ isLoading: true, unlockError: null });
      const session = await cashierSessionsApi.lockSession(outletUuid, currentSession.uuid);
      set({
        currentSession: session,
        isLocked: true,
        isLoading: false,
      });
    } catch (err: any) {
      // In case of network error, still lock UI for security
      set({ isLocked: true, isLoading: false });
    }
  },

  unlockSession: async (outletUuid: string, pinCode: string) => {
    const { currentSession } = get();
    if (!currentSession) {
      // Demo/local unlock
      set({ isLocked: false, unlockError: null, lastActivityTime: Date.now() });
      return true;
    }

    try {
      set({ isUnlocking: true, unlockError: null });
      const session = await cashierSessionsApi.unlockSession(outletUuid, currentSession.uuid, pinCode);
      set({
        currentSession: session,
        isLocked: false,
        isUnlocking: false,
        unlockError: null,
        lastActivityTime: Date.now(),
      });
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.message || "Incorrect PIN code. Please try again.";
      set({
        unlockError: msg,
        isUnlocking: false,
      });
      return false;
    }
  },

  endSession: async (outletUuid: string) => {
    const { currentSession } = get();
    if (!currentSession) return;

    try {
      set({ isLoading: true });
      await cashierSessionsApi.endSession(outletUuid, currentSession.uuid);
      set({
        currentSession: null,
        isLocked: false,
        isLoading: false,
      });
    } catch (err: any) {
      set({
        error: err.response?.data?.message || "Failed to end cashier session",
        isLoading: false,
      });
    }
  },

  recordActivity: () => {
    set({ lastActivityTime: Date.now() });
  },

  setIdleTimeout: (seconds: number) => {
    set({ idleTimeoutSeconds: seconds });
  },

  clearUnlockError: () => set({ unlockError: null }),
}));
