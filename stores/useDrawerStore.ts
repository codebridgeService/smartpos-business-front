import { create } from "zustand";
import type { CashDrawerMovement } from "@/types";
import { drawersApi, DrawerDetailResponse, RecordCashMovementRequest } from "@/lib/api/drawers";

export interface DrawerState {
  // Data
  activeDrawer: DrawerDetailResponse | null;
  movements: CashDrawerMovement[];

  // Context
  outletUuid: string | null;
  registerUuid: string | null;
  drawerSessionUuid: string | null;

  // Status
  isLoading: boolean;
  isMovementsLoading: boolean;
  isSubmittingMovement: boolean;
  error: string | null;

  // Actions
  setContext: (outletUuid: string | null, registerUuid: string | null, drawerSessionUuid: string | null) => void;
  fetchDrawerDetails: () => Promise<void>;
  fetchMovements: () => Promise<void>;
  recordMovement: (data: RecordCashMovementRequest) => Promise<CashDrawerMovement>;
  clearError: () => void;
}

export const useDrawerStore = create<DrawerState>((set, get) => ({
  activeDrawer: null,
  movements: [],
  outletUuid: null,
  registerUuid: null,
  drawerSessionUuid: null,
  isLoading: false,
  isMovementsLoading: false,
  isSubmittingMovement: false,
  error: null,

  setContext: (outletUuid, registerUuid, drawerSessionUuid) => {
    set({ outletUuid, registerUuid, drawerSessionUuid });
    if (outletUuid && registerUuid && drawerSessionUuid) {
      get().fetchDrawerDetails();
      get().fetchMovements();
    } else {
      set({ activeDrawer: null, movements: [], error: null });
    }
  },

  fetchDrawerDetails: async () => {
    const { outletUuid, registerUuid, drawerSessionUuid } = get();
    if (!outletUuid || !registerUuid || !drawerSessionUuid) return;

    try {
      set({ isLoading: true, error: null });
      const drawer = await drawersApi.getDrawer(outletUuid, registerUuid, drawerSessionUuid);
      set({ activeDrawer: drawer, isLoading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.message || "Failed to fetch cash drawer details",
        isLoading: false,
      });
    }
  },

  fetchMovements: async () => {
    const { outletUuid, registerUuid, drawerSessionUuid } = get();
    if (!outletUuid || !registerUuid || !drawerSessionUuid) return;

    try {
      set({ isMovementsLoading: true, error: null });
      const movements = await drawersApi.getMovements(outletUuid, registerUuid, drawerSessionUuid);
      set({ movements, isMovementsLoading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.message || "Failed to fetch cash movements",
        isMovementsLoading: false,
      });
    }
  },

  recordMovement: async (data: RecordCashMovementRequest) => {
    const { outletUuid, registerUuid, drawerSessionUuid } = get();
    if (!outletUuid || !registerUuid || !drawerSessionUuid) {
      throw new Error("Missing active cash drawer context");
    }

    try {
      set({ isSubmittingMovement: true, error: null });
      const movement = await drawersApi.recordMovement(outletUuid, registerUuid, drawerSessionUuid, data);
      
      // Update local movements list
      set((state) => ({
        movements: [movement, ...state.movements],
        isSubmittingMovement: false,
      }));

      // Refresh drawer details for updated balance totals
      await get().fetchDrawerDetails();

      return movement;
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to record cash movement";
      set({ error: msg, isSubmittingMovement: false });
      throw new Error(msg);
    }
  },

  clearError: () => set({ error: null }),
}));
