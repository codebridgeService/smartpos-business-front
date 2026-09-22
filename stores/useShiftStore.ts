import { create } from "zustand";
import type { RegisterSession } from "@/types";
import { shiftsApi, OpenShiftRequest, CloseShiftRequest } from "@/lib/api/shifts";

export interface ShiftState {
  // Data
  activeShift: RegisterSession | null;
  shiftHistory: RegisterSession[];
  
  // Context
  outletUuid: string | null;
  registerUuid: string | null;

  // Status
  isLoading: boolean;
  isInitialLoaded: boolean;
  error: string | null;

  // Actions
  setContext: (outletUuid: string | null, registerUuid: string | null) => void;
  fetchCurrentShift: () => Promise<void>;
  fetchShiftHistory: () => Promise<void>;
  openShift: (data: OpenShiftRequest) => Promise<RegisterSession>;
  closeShift: (shiftId: string | number, data: CloseShiftRequest) => Promise<RegisterSession>;
  clearError: () => void;
}

export const useShiftStore = create<ShiftState>((set, get) => ({
  activeShift: null,
  shiftHistory: [],
  outletUuid: null,
  registerUuid: null,
  isLoading: false,
  isInitialLoaded: false,
  error: null,

  setContext: (outletUuid, registerUuid) => {
    set({ outletUuid, registerUuid });
    if (outletUuid && registerUuid) {
      get().fetchCurrentShift();
    } else {
      set({ activeShift: null, shiftHistory: [], isInitialLoaded: false });
    }
  },

  fetchCurrentShift: async () => {
    const { outletUuid, registerUuid } = get();
    if (!outletUuid || !registerUuid) return;

    try {
      set({ isLoading: true, error: null });
      const currentShift = await shiftsApi.getCurrentShift(outletUuid, registerUuid);
      set({ activeShift: currentShift, isLoading: false, isInitialLoaded: true });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || "Failed to fetch current shift", 
        isLoading: false 
      });
    }
  },

  fetchShiftHistory: async () => {
    const { outletUuid, registerUuid } = get();
    if (!outletUuid || !registerUuid) return;

    try {
      set({ isLoading: true, error: null });
      const history = await shiftsApi.getShifts(outletUuid, registerUuid);
      set({ shiftHistory: history, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || "Failed to fetch shift history", 
        isLoading: false 
      });
    }
  },

  openShift: async (data) => {
    const { outletUuid, registerUuid } = get();
    if (!outletUuid || !registerUuid) throw new Error("Context missing");

    try {
      set({ isLoading: true, error: null });
      const newShift = await shiftsApi.openShift(outletUuid, registerUuid, data);
      set({ activeShift: newShift, isLoading: false });
      return newShift;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || "Failed to open shift", 
        isLoading: false 
      });
      throw error;
    }
  },

  closeShift: async (shiftId, data) => {
    const { outletUuid, registerUuid } = get();
    if (!outletUuid || !registerUuid) throw new Error("Context missing");

    try {
      set({ isLoading: true, error: null });
      const closedShift = await shiftsApi.closeShift(outletUuid, registerUuid, shiftId, data);
      set({ activeShift: null, isLoading: false }); // clear active shift since it's closed
      get().fetchShiftHistory(); // refresh history
      return closedShift;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || "Failed to close shift", 
        isLoading: false 
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
